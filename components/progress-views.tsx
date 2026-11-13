'use client';

import Link from 'next/link';
import { ArrowRight, BrainCircuit, CheckCircle2, Clock3, Cloud, CloudOff, Flame, LogIn, LogOut, UserCog, RotateCcw, Target, Trophy } from 'lucide-react';
import { accountActions, computeStreak, progressActions, useAccount, useProgress, type ProgressState } from './progress-store';
import { shortTitle, type TrailModule } from './trail-list';
import { PageHeader } from './ui/card';
import { buttonVariants } from './ui/button';

type Summary = Pick<TrailModule, 'slug' | 'title' | 'description' | 'stage'>;

/** 50% por marcar como concluído + 50% proporcional à melhor nota do quiz. */
function moduleProgress(slug: string, state: ProgressState) {
  const done = state.completed.includes(slug) ? 50 : 0;
  const score = state.quizScores[slug];
  return done + (score ? Math.round((score.correct / score.total) * 50) : 0);
}

function useStats(modules: Summary[]) {
  const state = useProgress();
  const slugs = new Set(modules.map((m) => m.slug));
  const completed = state.completed.filter((slug) => slugs.has(slug)).length;
  const scores = Object.entries(state.quizScores).filter(([slug]) => slugs.has(slug));
  const correct = scores.reduce((sum, [, s]) => sum + s.correct, 0);
  const answered = scores.reduce((sum, [, s]) => sum + s.total, 0);
  const overall = modules.length ? Math.round(modules.reduce((sum, m) => sum + moduleProgress(m.slug, state), 0) / modules.length) : 0;
  const nextModule = modules.find((m) => !state.completed.includes(m.slug)) ?? null;
  const lastVisited = modules.find((m) => m.slug === state.lastVisited) ?? null;

  return {
    state,
    completed,
    quizzesDone: scores.length,
    accuracy: answered ? Math.round((correct / answered) * 100) : null,
    overall,
    streak: computeStreak(state.studyDays),
    nextModule,
    continueModule: lastVisited && !state.completed.includes(lastVisited.slug) ? lastVisited : nextModule,
  };
}

function StatCard({ label, value, icon: Icon, hint }: { label: string; value: string; icon: typeof Target; hint: string }) {
  return (
    <div className="card-surface rounded-xl p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
    </div>
  );
}

export function DashboardView({ modules }: { modules: Summary[] }) {
  const stats = useStats(modules);
  const account = useAccount();
  const firstName = account.user?.name.split(' ')[0] ?? 'estudante';
  const upcoming = modules.filter((m) => !stats.state.completed.includes(m.slug)).slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title={`Olá, ${firstName}!`}
        description={stats.completed === 0 ? 'Comece pelo primeiro módulo e acompanhe sua evolução aqui.' : 'Continue aprendendo — cada módulo concluído aparece no seu progresso.'}
        actions={
          stats.continueModule ? (
            <Link href={`/aulas/${stats.continueModule.slug}`} className={buttonVariants({ size: 'lg' })}>
              {stats.state.lastVisited === stats.continueModule.slug ? 'Continuar: ' : 'Próximo: '}
              {shortTitle(stats.continueModule.title)}
              <ArrowRight />
            </Link>
          ) : (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">Todos os módulos concluídos! 🎉</div>
          )
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Módulos concluídos" value={`${stats.completed}/${modules.length}`} icon={CheckCircle2} hint="Marcados como concluídos" />
        <StatCard label="Sequência de estudo" value={`${stats.streak} ${stats.streak === 1 ? 'dia' : 'dias'}`} icon={Flame} hint="Dias seguidos estudando" />
        <StatCard label="Taxa de acertos" value={stats.accuracy === null ? '—' : `${stats.accuracy}%`} icon={Target} hint="Média de todos os quizzes" />
        <StatCard label="Quizzes realizados" value={String(stats.quizzesDone)} icon={BrainCircuit} hint={`De ${modules.length} disponíveis`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="card-surface rounded-xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Progresso</div>
              <h2 className="mt-2 text-xl font-semibold text-white">Curso: Fundamentos de Redes</h2>
            </div>
            <div className="text-2xl font-semibold tracking-tight text-white">{stats.overall}%</div>
          </div>
          <div className="progress-bar mb-4" role="progressbar" aria-valuenow={stats.overall} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${stats.overall}%` }} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: CheckCircle2, label: 'Módulos concluídos', value: `${stats.completed}/${modules.length}` },
              { icon: Target, label: 'Quizzes feitos', value: `${stats.quizzesDone}/${modules.length}` },
              { icon: Trophy, label: 'Quizzes com 70%+', value: String(Object.values(stats.state.quizScores).filter((s) => s.correct / s.total >= 0.7).length) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <Icon className="h-4 w-4 text-slate-500" />
                <div className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</div>
                <div className="text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-xl p-6">
          <div className="mb-4 flex items-center gap-2 text-blue-400">
            <Flame className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-[0.08em]">Streak</span>
          </div>
          <div className="text-4xl font-semibold tracking-tight text-white">
            {stats.streak} {stats.streak === 1 ? 'dia' : 'dias'}
          </div>
          <p className="mt-3 text-slate-300">Estude um pouco todos os dias para manter a sequência.</p>
          <div className="mt-6 space-y-3">
            {modules
              .filter((m) => stats.state.completed.includes(m.slug))
              .slice(-3)
              .map((m) => (
                <div key={m.slug} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm">
                  <span>{shortTitle(m.title)}</span>
                  <span className="text-emerald-300">✓</span>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="card-surface rounded-xl p-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-blue-400">
            <Clock3 className="h-4 w-4" />
            Próximos módulos
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 ? <p className="text-sm text-slate-300">Você concluiu todos os módulos. Que tal refazer a prova final?</p> : null}
            {upcoming.map((m) => (
              <Link
                key={m.slug}
                href={`/aulas/${m.slug}`}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200 hover:border-cyan-400/50"
              >
                {shortTitle(m.title)}
                <span className="text-blue-400">Estudar</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-xl p-6">
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Prática</div>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Continuar com exercícios</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { topic: 'Subnetting Lab', level: 'Intermediário', href: '/labs/subnetting' },
              { topic: 'Terminal de comandos', level: 'Iniciante', href: '/terminal' },
              { topic: 'Packet Journey', level: 'Iniciante', href: '/labs/packet-journey' },
              { topic: 'Quizzes por módulo', level: 'Todos os níveis', href: '/quizzes' },
            ].map(({ topic, level, href }) => (
              <Link key={topic} href={href} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-cyan-400/50">
                <div className="text-lg font-semibold text-white">{topic}</div>
                <div className="mt-2 text-sm text-slate-400">Dificuldade: {level}</div>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-400">
                  Praticar <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ProgressView({ modules }: { modules: Summary[] }) {
  const stats = useStats(modules);

  return (
    <div className="card-surface rounded-xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
        <span>Progresso geral: {stats.overall}%</span>
        <span>Cada módulo: 50% ao marcar como concluído + 50% pela melhor nota do quiz.</span>
      </div>
      <div className="space-y-6">
        {modules.map((m) => {
          const value = moduleProgress(m.slug, stats.state);
          return (
            <div key={m.slug}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-300">
                <Link href={`/aulas/${m.slug}`} className="hover:text-white">
                  {m.title}
                </Link>
                <span>{value}%</span>
              </div>
              <div className="progress-bar" role="progressbar" aria-label={m.title} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
                <span style={{ width: `${value}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function levelFor(completed: number, total: number) {
  const ratio = total ? completed / total : 0;
  if (ratio === 1) return 'Especialista em Redes';
  if (ratio >= 0.7) return 'Avançado em Redes';
  if (ratio >= 0.35) return 'Intermediário em Redes';
  if (completed > 0) return 'Iniciante em Redes';
  return 'Rookie em Redes';
}

export function ProfileView({ modules }: { modules: Summary[] }) {
  const stats = useStats(modules);
  const account = useAccount();
  const user = account.user;
  const loggedIn = account.status === 'authenticated';

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="card-surface rounded-xl p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-2xl font-semibold tracking-tight text-white">
          {(user?.name ?? 'Estudante').charAt(0).toUpperCase()}
        </div>
        <div className="mt-5 text-2xl font-semibold tracking-tight text-white">{user?.name ?? 'Estudante'}</div>
        {user ? <div className="mt-1 text-sm text-slate-400">{user.email}</div> : null}
        <div className="mt-2 text-sm text-slate-300">Nível: {levelFor(stats.completed, modules.length)}</div>

        <p className="mt-4 flex items-start gap-2 text-xs text-slate-400">
          {loggedIn && !account.syncError ? <Cloud className="h-4 w-4 shrink-0 text-blue-400" /> : null}
          {loggedIn && account.syncError ? <CloudOff className="h-4 w-4 shrink-0 text-amber-300" /> : null}
          {loggedIn
            ? account.syncError
              ? 'Não foi possível sincronizar agora. O progresso está salvo neste navegador e será enviado na próxima ação.'
              : 'Seu progresso fica salvo na sua conta e aparece em qualquer dispositivo.'
            : 'Seu progresso fica salvo neste navegador.'}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {account.status === 'anonymous' ? (
            <Link
              href="/entrar?next=/perfil"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/40 px-3 py-2 text-sm text-cyan-100 hover:border-cyan-300"
            >
              <LogIn className="h-4 w-4" />
              Entrar para salvar na nuvem
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => {
              const where = loggedIn ? 'da sua conta' : 'salvo neste navegador';
              if (window.confirm(`Apagar todo o progresso ${where}?`)) progressActions.reset();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-rose-400/60 hover:text-rose-200"
          >
            <RotateCcw className="h-4 w-4" />
            Reiniciar progresso
          </button>
          {loggedIn ? (
            <a
              href="#minha-conta"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
            >
              <UserCog className="h-4 w-4" />
              Editar conta
            </a>
          ) : null}
          {loggedIn ? (
            <button
              type="button"
              onClick={() => void accountActions.logout()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          ) : null}
        </div>
      </div>

      <div className="card-surface rounded-xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['Progresso geral', `${stats.overall}%`],
            ['Sequência', `${stats.streak} ${stats.streak === 1 ? 'dia' : 'dias'}`],
            ['Taxa de acertos', stats.accuracy === null ? '—' : `${stats.accuracy}%`],
            ['Módulos concluídos', `${stats.completed}/${modules.length}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-sm text-slate-400">{label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</div>
            </div>
          ))}
        </div>
        <Link href="/quizzes" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300">
          <BrainCircuit className="h-4 w-4" />
          Fazer quizzes para melhorar a taxa de acertos
        </Link>
      </div>
    </div>
  );
}
