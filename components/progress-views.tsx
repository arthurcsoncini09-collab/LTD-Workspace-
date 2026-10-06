'use client';

import Link from 'next/link';
import { ArrowRight, BrainCircuit, CheckCircle2, Clock3, Flame, RotateCcw, Target, Trophy } from 'lucide-react';
import { computeStreak, progressActions, useProgress, type ProgressState } from './progress-store';
import { shortTitle, type TrailModule } from './trail-list';

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

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="card-surface rounded-2xl p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className={`mt-3 text-3xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

export function DashboardView({ modules }: { modules: Summary[] }) {
  const stats = useStats(modules);
  const upcoming = modules.filter((m) => !stats.state.completed.includes(m.slug)).slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Dashboard</div>
            <h1 className="mt-3 text-3xl font-bold text-white">Olá, estudante!</h1>
            <p className="mt-2 text-slate-300">
              {stats.completed === 0 ? 'Comece pelo primeiro módulo e acompanhe sua evolução aqui.' : 'Continue aprendendo — cada módulo concluído aparece no seu progresso.'}
            </p>
          </div>
          {stats.continueModule ? (
            <Link
              href={`/aulas/${stats.continueModule.slug}`}
              className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200 transition hover:border-blue-400/60"
            >
              {stats.state.lastVisited === stats.continueModule.slug ? 'Continuar: ' : 'Próximo módulo: '}
              <span className="font-semibold">{shortTitle(stats.continueModule.title)}</span>
            </Link>
          ) : (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Todos os módulos concluídos! 🎉</div>
          )}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Módulos concluídos" value={`${stats.completed}/${modules.length}`} accent="text-cyan-300" />
        <StatCard label="Sequência de estudo" value={`${stats.streak} ${stats.streak === 1 ? 'dia' : 'dias'}`} accent="text-emerald-300" />
        <StatCard label="Taxa de acertos" value={stats.accuracy === null ? '—' : `${stats.accuracy}%`} accent="text-blue-300" />
        <StatCard label="Quizzes realizados" value={String(stats.quizzesDone)} accent="text-violet-300" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="card-surface rounded-[28px] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Progresso</div>
              <h2 className="mt-2 text-2xl font-bold text-white">Curso: Fundamentos de Redes</h2>
            </div>
            <div className="text-2xl font-bold text-cyan-300">{stats.overall}%</div>
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
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <Icon className="h-5 w-5 text-cyan-300" />
                <div className="mt-3 text-2xl font-bold text-white">{value}</div>
                <div className="text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-[28px] p-6">
          <div className="mb-4 flex items-center gap-2 text-cyan-300">
            <Flame className="h-5 w-5" />
            <span className="text-sm uppercase tracking-[0.2em]">Streak</span>
          </div>
          <div className="text-4xl font-black text-white">
            {stats.streak} {stats.streak === 1 ? 'dia' : 'dias'}
          </div>
          <p className="mt-3 text-slate-300">Estude um pouco todos os dias para manter a sequência.</p>
          <div className="mt-6 space-y-3">
            {modules
              .filter((m) => stats.state.completed.includes(m.slug))
              .slice(-3)
              .map((m) => (
                <div key={m.slug} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm">
                  <span>{shortTitle(m.title)}</span>
                  <span className="text-emerald-300">✓</span>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="card-surface rounded-[28px] p-6">
          <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-cyan-300">
            <Clock3 className="h-4 w-4" />
            Próximos módulos
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 ? <p className="text-sm text-slate-300">Você concluiu todos os módulos. Que tal refazer a prova final?</p> : null}
            {upcoming.map((m) => (
              <Link
                key={m.slug}
                href={`/aulas/${m.slug}`}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200 hover:border-cyan-400/50"
              >
                {shortTitle(m.title)}
                <span className="text-cyan-300">Estudar</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-[28px] p-6">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Prática</div>
          <h3 className="mt-2 text-2xl font-bold text-white">Continuar com exercícios</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { topic: 'Subnetting Lab', level: 'Intermediário', href: '/labs/subnetting' },
              { topic: 'Terminal de comandos', level: 'Iniciante', href: '/terminal' },
              { topic: 'Packet Journey', level: 'Iniciante', href: '/labs/packet-journey' },
              { topic: 'Quizzes por módulo', level: 'Todos os níveis', href: '/quizzes' },
            ].map(({ topic, level, href }) => (
              <Link key={topic} href={href} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-cyan-400/50">
                <div className="text-lg font-semibold text-white">{topic}</div>
                <div className="mt-2 text-sm text-slate-400">Dificuldade: {level}</div>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
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
    <div className="card-surface rounded-[28px] p-6">
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

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="card-surface rounded-[28px] p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-2xl font-black text-slate-950">E</div>
        <div className="mt-5 text-2xl font-bold text-white">Estudante</div>
        <div className="mt-2 text-sm text-slate-300">Nível: {levelFor(stats.completed, modules.length)}</div>
        <p className="mt-4 text-xs text-slate-400">Seu progresso fica salvo neste navegador.</p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Apagar todo o progresso salvo neste navegador?')) progressActions.reset();
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-rose-400/60 hover:text-rose-200"
        >
          <RotateCcw className="h-4 w-4" />
          Reiniciar progresso
        </button>
      </div>

      <div className="card-surface rounded-[28px] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['Progresso geral', `${stats.overall}%`],
            ['Sequência', `${stats.streak} ${stats.streak === 1 ? 'dia' : 'dias'}`],
            ['Taxa de acertos', stats.accuracy === null ? '—' : `${stats.accuracy}%`],
            ['Módulos concluídos', `${stats.completed}/${modules.length}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-sm text-slate-400">{label}</div>
              <div className="mt-2 text-2xl font-bold text-white">{value}</div>
            </div>
          ))}
        </div>
        <Link href="/quizzes" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200">
          <BrainCircuit className="h-4 w-4" />
          Fazer quizzes para melhorar a taxa de acertos
        </Link>
      </div>
    </div>
  );
}
