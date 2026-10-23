'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CloudOff, Loader2, LogIn, UserPlus } from 'lucide-react';
import { accountActions, useAccount, useProgress } from './progress-store';

type Mode = 'login' | 'register';

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none';

/** Só aceita caminhos internos, para o parâmetro ?next= não levar a outro site. */
function safeNext(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const account = useAccount();
  const progress = useProgress();
  const next = safeNext(params.get('next'));
  const [mode, setMode] = useState<Mode>(params.get('modo') === 'cadastro' ? 'register' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (account.status === 'authenticated') router.replace(next);
  }, [account.status, next, router]);

  if (account.status === 'unavailable') {
    return (
      <div className="card-surface mx-auto max-w-md rounded-[28px] p-6 sm:p-8">
        <CloudOff className="h-8 w-8 text-amber-300" />
        <h1 className="mt-4 text-2xl font-bold text-white">Contas indisponíveis</h1>
        <p className="mt-3 text-sm text-slate-300">
          Este site está rodando sem banco de dados, então não é possível criar conta agora. Seu progresso continua salvo neste
          navegador.
        </p>
        <Link href="/dashboard" className="mt-6 inline-flex text-sm font-medium text-cyan-300 hover:text-cyan-200">
          Voltar ao dashboard
        </Link>
      </div>
    );
  }

  const hasLocalProgress = progress.completed.length > 0 || Object.keys(progress.quizScores).length > 0;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const message = mode === 'login' ? await accountActions.login(email, password) : await accountActions.register(name, email, password);
    setBusy(false);
    if (message) setError(message);
  }

  return (
    <div className="card-surface mx-auto max-w-md rounded-[28px] p-6 sm:p-8">
      <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Sua conta</div>
      <h1 className="mt-3 text-3xl font-bold text-white">{mode === 'login' ? 'Entrar' : 'Criar conta'}</h1>
      <p className="mt-2 text-sm text-slate-300">Salve seu progresso e continue de qualquer dispositivo.</p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-1 text-sm" role="tablist">
        {(['login', 'register'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => {
              setMode(value);
              setError(null);
            }}
            className={`rounded-lg px-3 py-2 transition ${mode === value ? 'bg-blue-500/20 text-blue-100' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {value === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === 'register' ? (
          <label className="block text-sm text-slate-300">
            Nome
            <input className={`${inputClass} mt-2`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={60} />
          </label>
        ) : null}
        <label className="block text-sm text-slate-300">
          E-mail
          <input className={`${inputClass} mt-2`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label className="block text-sm text-slate-300">
          Senha
          <input
            className={`${inputClass} mt-2`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={mode === 'register' ? 8 : undefined}
            required
          />
          {mode === 'register' ? <span className="mt-1 block text-xs text-slate-500">Mínimo de 8 caracteres.</span> : null}
        </label>

        {error ? (
          <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        {hasLocalProgress ? (
          <p className="text-xs text-slate-400">O progresso que você já fez neste navegador será somado à sua conta.</p>
        ) : null}

        <button
          type="submit"
          disabled={busy || account.status === 'loading'}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
    </div>
  );
}
