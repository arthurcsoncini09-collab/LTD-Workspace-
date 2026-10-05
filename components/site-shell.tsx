'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Briefcase,
  BrainCircuit,
  ChevronRight,
  Compass,
  Gauge,
  Layers3,
  Menu,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Trophy,
  UserCircle2,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Gauge },
  { label: 'Aprender', href: '/aprender', icon: BookOpen },
  { label: 'Trilha de Redes', href: '/trilha', icon: Compass },
  { label: 'Laboratórios', href: '/labs', icon: Network },
  { label: 'Subnetting Lab', href: '/labs/subnetting', icon: Layers3 },
  { label: 'Packet Journey', href: '/labs/packet-journey', icon: Sparkles },
  { label: 'Terminal', href: '/terminal', icon: TerminalSquare },
  { label: 'Quizzes', href: '/quizzes', icon: BrainCircuit },
  { label: 'Desafios', href: '/desafios', icon: Trophy },
  { label: 'Progresso', href: '/progresso', icon: Briefcase },
  { label: 'Glossário', href: '/glossario', icon: ShieldCheck },
  { label: 'Perfil', href: '/perfil', icon: UserCircle2 },
];

/** Item de menu mais específico que corresponde à rota (ex.: /labs/subnetting não ativa também /labs). */
function findActiveHref(pathname: string) {
  const matches = navItems.filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
  if (matches.length === 0 && pathname.startsWith('/aulas/')) return '/aprender';
  return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;
}

function GlobalSearch({ className = '' }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  return (
    <form
      role="search"
      className={`items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-400 focus-within:border-cyan-400/50 ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        const q = query.trim();
        if (q) router.push(`/busca?q=${encodeURIComponent(q)}`);
      }}
    >
      <Search className="h-4 w-4 shrink-0" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Busca global"
        placeholder="Buscar aulas, termos e laboratórios"
        className="w-full min-w-0 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none lg:w-80"
      />
    </form>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const pathname = usePathname();
  const activeHref = useMemo(() => findActiveHref(pathname), [pathname]);
  const currentLabel = navItems.find((nav) => nav.href === activeHref)?.label ?? 'NetLearn';

  // Fecha o menu lateral ao navegar e com a tecla Esc.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        {isOpen ? <div className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm xl:hidden" onClick={() => setOpen(false)} aria-hidden /> : null}
        <aside
          className={`soft-scrollbar fixed inset-y-0 left-0 z-40 w-72 shrink-0 transform overflow-y-auto border-r border-slate-800 bg-slate-950/95 p-5 backdrop-blur ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } transition xl:sticky xl:top-0 xl:h-screen xl:translate-x-0`}
        >
          <div className="mb-8 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-slate-950">
                N
              </div>
              <div>
                <div className="text-lg font-bold">NetLearn</div>
                <div className="text-xs text-slate-400">Redes em prática</div>
              </div>
            </Link>
            <button className="xl:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Trilha atual</div>
            <div className="mt-2 text-sm font-medium text-slate-100">Fundamentos de Redes</div>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = href === activeHref;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                    active ? 'bg-blue-500/15 text-blue-200 ring-1 ring-blue-500/30' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen w-full min-w-0 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex shrink-0 items-center gap-3 xl:hidden">
                <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="rounded-lg border border-slate-700 p-2">
                  <Menu className="h-5 w-5" />
                </button>
                <div className="text-sm font-medium text-slate-300">{currentLabel}</div>
              </div>

              <GlobalSearch className="hidden flex-1 md:flex xl:flex-none" />

              <div className="ml-auto flex items-center gap-3">
                <Link href="/busca" aria-label="Buscar" className="rounded-xl border border-slate-700 p-2 md:hidden">
                  <Search className="h-5 w-5" />
                </Link>
                <Link href="/perfil" className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm">
                  <UserCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </Link>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
