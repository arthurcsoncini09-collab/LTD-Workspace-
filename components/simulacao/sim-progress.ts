'use client';

import { useSyncExternalStore } from 'react';

// Resultado das fases do jogo, salvo no navegador. Guarda sempre a melhor pontuação.

export type LevelResult = { stars: number; at: string };
export type SimProgress = { results: Record<string, LevelResult> };

const STORAGE_KEY = 'netlearn:simulacao:v1';
const EMPTY: SimProgress = { results: {} };
const listeners = new Set<() => void>();
let cache: SimProgress | null = null;

function read(): SimProgress {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<SimProgress>) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: SimProgress) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Sem armazenamento: o progresso vale só para esta visita.
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

export function useSimProgress() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** 0 erros = 3 estrelas; 1 ou 2 = 2 estrelas; 3 ou mais = 1 estrela. Pedir dica conta como um erro. */
export function starsFor(mistakes: number) {
  if (mistakes === 0) return 3;
  if (mistakes <= 2) return 2;
  return 1;
}

export const XP_PER_STAR = 50;

export const simActions = {
  complete(levelId: string, stars: number) {
    const current = read();
    const previous = current.results[levelId];
    if (previous && previous.stars >= stars) return;
    write({ results: { ...current.results, [levelId]: { stars, at: new Date().toISOString() } } });
  },
  reset() {
    write(EMPTY);
  },
};
