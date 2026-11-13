'use client';

import { useSyncExternalStore } from 'react';
import { useAccount } from '../progress-store';

// Nome impresso nos certificados. Com login, usa o nome da conta (a não ser que o
// aluno digite outro, por exemplo o nome completo). Sem login, fica salvo no navegador.

const KEY = 'netlearn:certificado:nome';
const listeners = new Set<() => void>();

function read() {
  try {
    return window.localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function setCertName(name: string) {
  try {
    const clean = name.replace(/\s+/g, ' ').slice(0, 80);
    if (clean.trim()) window.localStorage.setItem(KEY, clean);
    else window.localStorage.removeItem(KEY);
  } catch {
    // Sem armazenamento: o nome vale só enquanto a página está aberta.
  }
  listeners.forEach((l) => l());
}

/** Nome digitado pelo aluno ("" se nenhum) e o nome que vai no certificado. */
export function useCertName() {
  const typed = useSyncExternalStore(subscribe, read, () => '');
  const account = useAccount();
  const accountName = account.user?.name ?? '';
  return { typed, accountName, name: (typed || accountName).trim() };
}
