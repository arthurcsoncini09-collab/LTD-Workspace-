'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, KeyRound, Loader2, Save, Trash2, UserCog } from 'lucide-react';
import { accountActions, useAccount } from './progress-store';

// "Minha conta": editar nome e e-mail, trocar a senha e excluir a conta.
// Só aparece para quem está logado.

const input =
  'mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none disabled:opacity-60';

type Feedback = { tone: 'ok' | 'error'; text: string } | null;

function Message({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return feedback.tone === 'ok' ? (
    <p role="status" className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {feedback.text}
    </p>
  ) : (
    <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
      {feedback.text}
    </p>
  );
}

function SectionTitle({ icon: Icon, title, text }: { icon: typeof UserCog; title: string; text: string }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
        <Icon className="h-5 w-5 text-blue-400" />
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}

function ProfileForm({ name: initialName, email: initialEmail }: { name: string; email: string }) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const emailChanged = email.trim().toLowerCase() !== initialEmail;
  const changed = name.trim() !== initialName || emailChanged;

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setFeedback(null);
        const error = await accountActions.updateProfile(name, email, emailChanged ? password : undefined);
        setBusy(false);
        if (error) setFeedback({ tone: 'error', text: error });
        else {
          setPassword('');
          setFeedback({ tone: 'ok', text: 'Dados da conta atualizados.' });
        }
      }}
    >
      <SectionTitle icon={UserCog} title="Dados da conta" text="O nome aparece no site e nos certificados; o e-mail é o que você usa para entrar." />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-300">
          Nome
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" required />
        </label>
        <label className="block text-sm text-slate-300">
          E-mail
          <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
      </div>
      {emailChanged ? (
        <label className="block max-w-sm text-sm text-slate-300">
          Senha atual (para confirmar a troca de e-mail)
          <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
      ) : null}
      <Message feedback={feedback} />
      <button
        type="submit"
        disabled={!changed || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar alterações
      </button>
    </form>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const mismatch = confirm !== '' && confirm !== next;

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (next !== confirm) return;
        setBusy(true);
        setFeedback(null);
        const error = await accountActions.changePassword(current, next);
        setBusy(false);
        if (error) setFeedback({ tone: 'error', text: error });
        else {
          setCurrent('');
          setNext('');
          setConfirm('');
          setFeedback({ tone: 'ok', text: 'Senha alterada. Os outros aparelhos conectados à sua conta foram desconectados.' });
        }
      }}
    >
      <SectionTitle icon={KeyRound} title="Senha" text="Ao trocar a senha, a conta é desconectada dos outros aparelhos. Este continua conectado." />
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm text-slate-300">
          Senha atual
          <input className={input} type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
        </label>
        <label className="block text-sm text-slate-300">
          Nova senha
          <input className={input} type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={8} required />
          <span className="mt-1 block text-xs text-slate-500">Mínimo de 8 caracteres.</span>
        </label>
        <label className="block text-sm text-slate-300">
          Repita a nova senha
          <input className={input} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
          {mismatch ? <span className="mt-1 block text-xs text-rose-300">As senhas não são iguais.</span> : null}
        </label>
      </div>
      <Message feedback={feedback} />
      <button
        type="submit"
        disabled={busy || !current || next.length < 8 || next !== confirm}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        Trocar senha
      </button>
    </form>
  );
}

function DeleteAccount({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const confirmed = typed.trim().toLowerCase() === 'excluir';

  return (
    <div className="space-y-4">
      <SectionTitle
        icon={AlertTriangle}
        title="Excluir conta"
        text="Apaga a conta e todo o progresso salvo nela, para sempre. Não dá para desfazer."
      />
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-rose-500/40 px-4 py-2.5 text-sm font-medium text-rose-200 hover:bg-rose-500/10"
        >
          <Trash2 className="h-4 w-4" />
          Quero excluir minha conta
        </button>
      ) : (
        <form
          className="space-y-4 rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!confirmed) return;
            setBusy(true);
            setFeedback(null);
            const error = await accountActions.deleteAccount(password);
            setBusy(false);
            if (error) setFeedback({ tone: 'error', text: error });
            else router.push('/');
          }}
        >
          <p className="text-sm text-rose-100">
            A conta <strong>{email}</strong> e todo o progresso dela serão apagados. Os certificados que você já salvou em PDF continuam com
            você.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-300">
              Sua senha
              <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </label>
            <label className="block text-sm text-slate-300">
              Digite <strong className="text-white">EXCLUIR</strong> para confirmar
              <input className={input} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" required />
            </label>
          </div>
          <Message feedback={feedback} />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy || !confirmed || !password}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Excluir conta para sempre
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPassword('');
                setTyped('');
                setFeedback(null);
              }}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:border-slate-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function AccountSettings() {
  const account = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || account.status !== 'authenticated' || !account.user) return null;
  const { user } = account;

  return (
    <section id="minha-conta" className="card-surface scroll-mt-24 space-y-8 rounded-xl p-6 sm:p-8">
      <div>
        <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Minha conta</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Editar conta</h2>
      </div>
      <ProfileForm name={user.name} email={user.email} />
      <div className="border-t border-slate-800" />
      <PasswordForm />
      <div className="border-t border-slate-800" />
      <DeleteAccount email={user.email} />
    </section>
  );
}
