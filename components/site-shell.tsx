'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  BookOpen,
  Briefcase,
  BrainCircuit,
  ChevronRight,
  Compass,
  Gauge,
  Home,
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

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const pathname = usePathname();

  const currentLabel = useMemo(() => {
    const item = navItems.find((nav) => nav.href === pathname || pathname.startsWith(nav.href));
    return item?.label ?? 'NetLearn';
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-800 bg-slate-950/95 p-5 backdrop-blur xl:translate-x-0 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } transition xl:static xl:translate-x-0`}
        >
          <div className="mb-8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-slate-950">
                N
              </div>
              <div>
                <div className="text-lg font-bold">NetLearn</div>
                <div className="text-xs text-slate-400">Redes em prática</div>
              </div>
            </div>
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
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                    active ? 'bg-blue-500/15 text-blue-200 ring-1 ring-blue-500/30' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                  onClick={() => setOpen(false)}
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

        <div className="flex min-h-screen w-full flex-col xl:ml-0">
          <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 xl:hidden">
                <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="rounded-lg border border-slate-700 p-2">
                  <Menu className="h-5 w-5" />
                </button>
                <div className="text-sm font-medium text-slate-300">{currentLabel}</div>
              </div>

              <div className="hidden items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-400 xl:flex">
                <Search className="h-4 w-4" />
                <input
                  aria-label="Busca global"
                  placeholder="Buscar aulas, termos e laboratórios"
                  className="w-80 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="ml-auto flex items-center gap-3">
                <button className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200">Dark</button>
                <Link href="/perfil" className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm">
                  <Home className="h-4 w-4" />
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
