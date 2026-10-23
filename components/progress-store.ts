'use client';

import { useSyncExternalStore } from 'react';
import {
  EMPTY_PROGRESS,
  STUDY_DAYS_LIMIT,
  type AccountUser,
  type ProgressAction,
  type ProgressState,
  type QuizScore,
} from '@/lib/progress-types';

export type { AccountUser, ProgressState, QuizScore };

// Progresso do aluno.
// - Sem login (ou sem banco configurado): fica só no localStorage, como antes.
// - Com login: cada ação é aplicada na hora na tela e enviada ao servidor (Postgres); a resposta
//   do servidor passa a ser o estado oficial. O localStorage continua como cópia local.
// - O progresso feito antes de entrar, ou que não chegou ao servidor por falha de rede, fica
//   marcado como pendente e é somado à conta na próxima oportunidade (ação "merge").

const STORAGE_KEY = 'netlearn:progress:v1';
const PENDING_KEY = 'netlearn:progress:pending';
const OWNER_KEY = 'netlearn:progress:owner';

export type AccountState = {
  /** loading: verificando sessão · unavailable: site sem banco · anonymous: sem login · authenticated: logado */
  status: 'loading' | 'unavailable' | 'anonymous' | 'authenticated';
  user: AccountUser | null;
  /** true quando a última sincronização com o servidor falhou (o progresso segue salvo localmente). */
  syncError: boolean;
};

const LOADING: AccountState = { status: 'loading', user: null, syncError: false };

const listeners = new Set<() => void>();
let cache: ProgressState | null = null;
let account: AccountState = LOADING;
let started = false;
let requestSeq = 0;

// ---------------------------------------------------------------------------
// localStorage

function storage(action: (s: Storage) => string | null | void) {
  try {
    return action(window.localStorage) ?? null;
  } catch {
    // Armazenamento indisponível (modo privado, cota cheia): vale só para esta sessão.
    return null;
  }
}

function read(): ProgressState {
  if (cache) return cache;
  try {
    const raw = storage((s) => s.getItem(STORAGE_KEY));
    cache = raw ? { ...EMPTY_PROGRESS, ...(JSON.parse(raw) as Partial<ProgressState>) } : EMPTY_PROGRESS;
  } catch {
    cache = EMPTY_PROGRESS;
  }
  return cache;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function setState(next: ProgressState) {
  cache = next;
  storage((s) => s.setItem(STORAGE_KEY, JSON.stringify(next)));
  notify();
}

function setAccount(next: AccountState) {
  account = next;
  notify();
}

const isPending = () => storage((s) => s.getItem(PENDING_KEY)) === '1';
const setPending = (value: boolean) => storage((s) => (value ? s.setItem(PENDING_KEY, '1') : s.removeItem(PENDING_KEY)));

/** Apaga a cópia local (ao sair da conta, para o próximo usuário do navegador não ver este progresso). */
function clearLocal() {
  storage((s) => {
    s.removeItem(STORAGE_KEY);
    s.removeItem(PENDING_KEY);
    s.removeItem(OWNER_KEY);
  });
  cache = EMPTY_PROGRESS;
  notify();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function write(update: (state: ProgressState) => ProgressState) {
  const next = update(read());
  const day = today();
  setState(next.studyDays.includes(day) ? next : { ...next, studyDays: [...next.studyDays, day].slice(-STUDY_DAYS_LIMIT) });
}

// ---------------------------------------------------------------------------
// Servidor

type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

async function api<T>(url: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, status: response.status, error: data.error ?? 'Não foi possível concluir a ação.' };
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, error: 'Sem conexão com o servidor.' };
  }
}

async function sendAction(action: ProgressAction) {
  const seq = ++requestSeq;
  const result = await api<{ progress: ProgressState }>('/api/progress', action);
  if (result.ok) {
    // Ignora respostas antigas que chegam depois de uma mais nova.
    if (seq === requestSeq) setState(result.data.progress);
    return true;
  }
  if (result.status === 401) setAccount({ status: 'anonymous', user: null, syncError: false });
  return false;
}

/** Envia ao servidor o que ficou pendente no navegador (progresso anônimo ou falhas de rede). */
async function flushPending() {
  if (!isPending()) return true;
  const ok = await sendAction({ type: 'merge', state: read() });
  if (ok) setPending(false);
  return ok;
}

async function push(action: ProgressAction) {
  if (account.status !== 'authenticated') {
    if (account.status !== 'unavailable') setPending(true);
    return;
  }
  const ok = (await flushPending()) && (await sendAction(action));
  if (!ok) setPending(true);
  if (account.status === 'authenticated' && account.syncError === ok) setAccount({ ...account, syncError: !ok });
}

async function loadForUser(user: AccountUser) {
  // Cópia local de outra conta (ex.: computador compartilhado): descarta.
  const owner = storage((s) => s.getItem(OWNER_KEY));
  if (owner && owner !== user.id) clearLocal();
  storage((s) => s.setItem(OWNER_KEY, user.id));

  setAccount({ status: 'authenticated', user, syncError: false });
  const merged = await flushPending();
  const result = await api<{ progress: ProgressState }>('/api/progress');
  if (result.ok) setState(result.data.progress);
  if (!merged || !result.ok) setAccount({ ...account, syncError: true });
}

async function start() {
  if (started) return;
  started = true;
  const me = await api<{ databaseEnabled: boolean; user: AccountUser | null }>('/api/auth/me');
  if (!me.ok || !me.data.databaseEnabled) return setAccount({ status: 'unavailable', user: null, syncError: false });
  if (!me.data.user) {
    // Sessão expirou: a cópia local pertencia a uma conta, então não é mais exibida.
    if (storage((s) => s.getItem(OWNER_KEY))) clearLocal();
    return setAccount({ status: 'anonymous', user: null, syncError: false });
  }
  await loadForUser(me.data.user);
}

// ---------------------------------------------------------------------------
// Hooks

function subscribe(listener: () => void) {
  listeners.add(listener);
  void start();
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useProgress() {
  return useSyncExternalStore(subscribe, read, () => EMPTY_PROGRESS);
}

export function useAccount() {
  return useSyncExternalStore(
    subscribe,
    () => account,
    () => LOADING,
  );
}

// ---------------------------------------------------------------------------
// Ações

export const progressActions = {
  toggleCompleted(slug: string) {
    const done = !read().completed.includes(slug);
    write((state) => ({
      ...state,
      completed: done ? [...state.completed, slug] : state.completed.filter((s) => s !== slug),
    }));
    void push({ type: 'complete', slug, done, day: today() });
  },
  saveQuizScore(slug: string, correct: number, total: number) {
    write((state) => {
      const previous = state.quizScores[slug];
      // Mantém a melhor nota obtida no módulo.
      if (previous && previous.correct / previous.total > correct / total) return state;
      return { ...state, quizScores: { ...state.quizScores, [slug]: { correct, total, at: new Date().toISOString() } } };
    });
    void push({ type: 'quiz', slug, correct, total, day: today() });
  },
  visit(slug: string) {
    if (read().lastVisited === slug) return;
    write((state) => ({ ...state, lastVisited: slug }));
    void push({ type: 'visit', slug, day: today() });
  },
  reset() {
    write(() => EMPTY_PROGRESS);
    // Zerar também descarta o que estava pendente de envio.
    setPending(false);
    void push({ type: 'reset', day: today() });
  },
};

export const accountActions = {
  /** Cria a conta e entra. Retorna a mensagem de erro, ou null se deu certo. */
  async register(name: string, email: string, password: string) {
    const result = await api<{ user: AccountUser }>('/api/auth/register', { name, email, password });
    if (!result.ok) return result.error;
    await loadForUser(result.data.user);
    return null;
  },
  async login(email: string, password: string) {
    const result = await api<{ user: AccountUser }>('/api/auth/login', { email, password });
    if (!result.ok) return result.error;
    await loadForUser(result.data.user);
    return null;
  },
  async logout() {
    await api('/api/auth/logout', {});
    clearLocal();
    setAccount({ status: 'anonymous', user: null, syncError: false });
  },
};

/** Dias consecutivos de estudo terminando hoje (ou ontem, para não zerar antes de estudar no dia). */
export function computeStreak(studyDays: string[]) {
  const days = new Set(studyDays);
  const cursor = new Date();
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
