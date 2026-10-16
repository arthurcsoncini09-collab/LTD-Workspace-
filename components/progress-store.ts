'use client';

import { useSyncExternalStore } from 'react';

export type QuizScore = { correct: number; total: number; at: string };

export type ProgressState = {
  completed: string[];
  quizScores: Record<string, QuizScore>;
  lastVisited: string | null;
  studyDays: string[];
};

const STORAGE_KEY = 'netlearn:progress:v1';
const EMPTY: ProgressState = { completed: [], quizScores: {}, lastVisited: null, studyDays: [] };

const listeners = new Set<() => void>();
let cache: ProgressState | null = null;

function read(): ProgressState {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<ProgressState>) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function write(update: (state: ProgressState) => ProgressState) {
  const current = read();
  const next = update(current);
  const day = today();
  cache = next.studyDays.includes(day) ? next : { ...next, studyDays: [...next.studyDays, day].slice(-60) };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Armazenamento indisponível (modo privado, cota cheia): o progresso vale só para esta sessão.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
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
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const progressActions = {
  toggleCompleted(slug: string) {
    write((state) => ({
      ...state,
      completed: state.completed.includes(slug) ? state.completed.filter((s) => s !== slug) : [...state.completed, slug],
    }));
  },
  saveQuizScore(slug: string, correct: number, total: number) {
    write((state) => {
      const previous = state.quizScores[slug];
      // Mantém a melhor nota obtida no módulo.
      if (previous && previous.correct / previous.total > correct / total) return state;
      return { ...state, quizScores: { ...state.quizScores, [slug]: { correct, total, at: new Date().toISOString() } } };
    });
  },
  visit(slug: string) {
    if (read().lastVisited === slug) return;
    write((state) => ({ ...state, lastVisited: slug }));
  },
  reset() {
    write(() => EMPTY);
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
