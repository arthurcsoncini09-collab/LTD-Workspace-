'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAccount } from './progress-store';
import {
  BookOpen,
  BrainCircuit,
  ChartNoAxesColumn,
  Compass,
  Gamepad2,
  Gauge,
  Home,
  Layers3,
  LibraryBig,
  LogIn,
  Menu,
  Network,
  Route,
  Search,
  TerminalSquare,
  Trophy,
  UserCircle2,
  X,
} from 'lucide-react';
import { buttonVariants } from './ui/button';
import { BrandLogo, BrandMark } from './brand-logo';

type NavItem = { label: string; href: string; icon: typeof Home };

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Geral',
    items: [
      { label: 'Início', href: '/', icon: Home },
      { label: 'Dashboard', href: '/dashboard', icon: Gauge },
    ],
  },
  {
    title: 'Estudar',
    items: [
      { label: 'Aprender', href: '/aprender', icon: BookOpen },
      { label: 'Trilha de Redes', href: '/trilha', icon: Compass },
      { label: 'Quizzes', href: '/quizzes', icon: BrainCircuit },
      { label: 'Glossário', href: '/glossario', icon: LibraryBig },
    ],
  },
  {
    title: 'Praticar',
    items: [
      { label: 'Laboratórios', href: '/labs', icon: Network },
      { label: 'Subnetting Lab', href: '/labs/subnetting', icon: Layers3 },
      { label: 'Packet Journey', href: '/labs/packet-journey', icon: Route },
      { label: 'Terminal', href: '/terminal', icon: TerminalSquare },
      { label: 'Desafios', href: '/desafios', icon: Trophy },
      { label: 'Simulação', href: '/simulacao', icon: Gamepad2 },
    ],
  },
  {
    title: 'Conta',
    items: [
      { label: 'Progresso', href: '/progresso', icon: ChartNoAxesColumn },
      { label: 'Perfil', href: '/perfil', icon: UserCircle2 },
    ],
  },
];

const navItems = navGroups.flatMap((group) => group.items);

/** Item de menu mais específico que corresponde à rota (ex.: /labs/subnetting não ativa também /labs). */
function findActiveHref(pathname: string) {
  if (pathname === '/') return '/';
  const matches = navItems.filter(({ href }) => href !== '/' && (pathname === href || pathname.startsWith(`${href}/`)));
  if (matches.length === 0 && pathname.startsWith('/aulas/')) return '/aprender';
  return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;
}

function GlobalSearch({ className = '' }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Atalho Ctrl+K / ⌘K (ou "/") foca a busca.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
      if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') || (event.key === '/' && !typing)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <form
      role="search"
      className={`h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-muted-foreground transition-colors focus-within:border-blue-500/60 hover:border-slate-600 ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        const q = query.trim();
        if (q) router.push(`/busca?q=${encodeURIComponent(q)}`);
      }}
    >
      <Search className="h-4 w-4 shrink-0" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Busca global"
        placeholder="Buscar aulas, termos e laboratórios…"
        className="w-full min-w-0 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none lg:w-72"
      />
      <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-slate-400 lg:inline">Ctrl K</kbd>
    </form>
  );
}

/** Botão do topo: "Entrar" sem login, nome do aluno com login, "Perfil" quando o site roda sem banco. */
function AccountButton() {
  const account = useAccount();
  const className = buttonVariants({ variant: 'outline', size: 'md' });

  if (account.status === 'anonymous') {
    return (
      <Link href="/entrar" className={buttonVariants({ variant: 'primary', size: 'md' })}>
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Entrar</span>
      </Link>
    );
  }

  const label = account.user ? account.user.name.split(' ')[0] : 'Perfil';
  return (
    <Link href="/perfil" className={className}>
      <UserCircle2 className="h-4 w-4" />
      <span className="hidden max-w-[10rem] truncate sm:inline">{label}</span>
    </Link>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const pathname = usePathname();
  const activeHref = useMemo(() => findActiveHref(pathname), [pathname]);
  const activeGroup = navGroups.find((group) => group.items.some((item) => item.href === activeHref));
  const currentLabel = navItems.find((nav) => nav.href === activeHref)?.label ?? (pathname.startsWith('/aulas/') ? 'Aula' : 'NetLearn');

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
    <div className="min-h-screen bg-background text-slate-100">
      <div className="flex min-h-screen">
        {isOpen ? <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm xl:hidden" onClick={() => setOpen(false)} aria-hidden /> : null}
        <aside
          className={`soft-scrollbar fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 transform flex-col overflow-y-auto border-r border-border bg-[hsl(222_47%_3%)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-200 xl:sticky xl:top-0 xl:h-screen xl:translate-x-0`}
        >
          <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
            <BrandLogo size={40} tagline />
            <button className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'xl:hidden' })} onClick={() => setOpen(false)} aria-label="Fechar menu">
              <X />
            </button>
          </div>

          <nav className="flex-1 space-y-6 px-3 py-5" aria-label="Navegação principal">
            {navGroups.map((group) => (
              <div key={group.title}>
                <div className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{group.title}</div>
                <div className="space-y-0.5">
                  {group.items.map(({ label, href, icon: Icon }) => {
                    const active = href === activeHref;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`group flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors ${
                          active ? 'bg-muted font-medium text-white' : 'text-slate-400 hover:bg-muted/60 hover:text-slate-100'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className={`h-4 w-4 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t border-border p-3">
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Trilha atual</div>
              <div className="mt-1 text-sm font-medium text-slate-100">Fundamentos de Redes</div>
              <div className="mt-1 text-xs text-muted-foreground">20 módulos · gratuito</div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen w-full min-w-0 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
              <button onClick={() => setOpen(true)} aria-label="Abrir menu" className={buttonVariants({ variant: 'outline', size: 'icon', className: 'xl:hidden' })}>
                <Menu />
              </button>

              <Link href="/" aria-label="NetLearn — página inicial" className="xl:hidden">
                <BrandMark size={30} />
              </Link>
              <nav aria-label="Você está em" className="flex min-w-0 items-center gap-2 text-sm">
                {activeGroup && activeGroup.title !== 'Geral' ? (
                  <>
                    <span className="hidden text-slate-500 sm:inline">{activeGroup.title}</span>
                    <span className="hidden text-slate-700 sm:inline">/</span>
                  </>
                ) : null}
                <span className="truncate font-medium text-slate-200">{currentLabel}</span>
              </nav>

              <div className="ml-auto flex items-center gap-2">
                <GlobalSearch className="hidden md:flex" />
                <Link href="/busca" aria-label="Buscar" className={buttonVariants({ variant: 'outline', size: 'icon', className: 'md:hidden' })}>
                  <Search />
                </Link>
                <AccountButton />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>

          <footer className="border-t border-border">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <span className="flex items-center gap-2">
                <BrandMark size={18} />© {new Date().getFullYear()} NetLearn · Fundamentos de Redes
              </span>
              <span>Conteúdo gratuito e aberto para estudantes de TI.</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
