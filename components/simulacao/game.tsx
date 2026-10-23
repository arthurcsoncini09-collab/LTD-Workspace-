'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Cloud,
  Headset,
  Lightbulb,
  Lock,
  Network,
  Play,
  RadioTower,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Star,
  Ticket,
  Trophy,
} from 'lucide-react';
import { AREAS, FINAL_ROLE, LEVELS, START_ROLE, levelIndex } from '@/lib/simulacao/levels';
import { KIND_LABEL, type AreaId, type Level } from '@/lib/simulacao/types';
import { ClassifyMechanic, ConfigMechanic, DiagnoseMechanic, FirewallMechanic, LogsMechanic, SequenceMechanic } from './mechanics';
import { XP_PER_STAR, simActions, starsFor, useSimProgress, type SimProgress } from './sim-progress';

const AREA_ICON: Record<AreaId, typeof Headset> = {
  suporte: Headset,
  redes: Network,
  seguranca: ShieldAlert,
  cloud: Cloud,
  noc: RadioTower,
};

const AREA_ACCENT: Record<AreaId, string> = {
  suporte: 'from-sky-500 to-cyan-400',
  redes: 'from-blue-500 to-indigo-400',
  seguranca: 'from-rose-500 to-orange-400',
  cloud: 'from-violet-500 to-fuchsia-400',
  noc: 'from-emerald-500 to-teal-400',
};

const PRIORITY_STYLE: Record<Level['ticket']['priority'], string> = {
  Baixa: 'border-slate-600 text-slate-300',
  Média: 'border-amber-400/50 text-amber-200',
  Alta: 'border-orange-400/60 text-orange-200',
  Crítica: 'border-rose-400/70 bg-rose-500/10 text-rose-200',
};

const MAX_STARS = LEVELS.length * 3;

function areaLevels(areaId: AreaId) {
  return LEVELS.filter((level) => level.area === areaId);
}

function isUnlocked(index: number, progress: SimProgress) {
  return index === 0 || Boolean(progress.results[LEVELS[index - 1].id]);
}

function isAreaDone(areaId: AreaId, progress: SimProgress) {
  return areaLevels(areaId).every((level) => progress.results[level.id]);
}

function currentRole(progress: SimProgress) {
  if (AREAS.every((area) => isAreaDone(area.id, progress))) return FINAL_ROLE;
  const done = AREAS.filter((area) => isAreaDone(area.id, progress));
  return done.length ? done[done.length - 1].role : START_ROLE;
}

function Stars({ count, size = 'h-4 w-4' }: { count: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${count} de 3 estrelas`}>
      {[1, 2, 3].map((n) => (
        <Star key={n} className={`${size} ${n <= count ? 'fill-amber-300 text-amber-300' : 'text-slate-700'}`} />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------

export function SimulationGame() {
  const progress = useSimProgress();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeId]);

  if (activeId) {
    return <LevelPlayer key={activeId} level={LEVELS[levelIndex(activeId)]} onExit={() => setActiveId(null)} onOpen={setActiveId} />;
  }
  return <Hub progress={progress} onOpen={setActiveId} />;
}

// ---------------------------------------------------------------------------
// Mapa de fases

function Hub({ progress, onOpen }: { progress: SimProgress; onOpen: (id: string) => void }) {
  const results = Object.values(progress.results);
  const stars = results.reduce((sum, r) => sum + r.stars, 0);
  const completed = LEVELS.filter((l) => progress.results[l.id]).length;
  const next = LEVELS.find((l) => !progress.results[l.id]);
  const role = currentRole(progress);

  return (
    <div className="space-y-8">
      <section className="card-surface overflow-hidden rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">Simulação · Carreira em TI</div>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Do estágio a especialista</h1>
            <p className="mt-3 text-slate-300">
              Você acabou de entrar no time de TI. Resolva chamados reais de 5 áreas diferentes usando o que aprendeu nas aulas. Cada fase
              concluída libera a próxima — e cada área completa rende uma promoção.
            </p>
          </div>
          {next ? (
            <button
              type="button"
              onClick={() => onOpen(next.id)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
            >
              <Play className="h-4 w-4" />
              {completed === 0 ? 'Começar' : 'Continuar'}: Fase {levelIndex(next.id) + 1}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-100">
              <Trophy className="h-4 w-4" />
              Carreira concluída!
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Cargo atual', value: role, icon: Briefcase },
            { label: 'Experiência', value: `${stars * XP_PER_STAR} XP`, icon: Sparkles },
            { label: 'Estrelas', value: `${stars}/${MAX_STARS}`, icon: Star },
            { label: 'Fases concluídas', value: `${completed}/${LEVELS.length}`, icon: Trophy },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Icon className="h-4 w-4" />
                {label}
              </div>
              <div className="mt-2 text-lg font-bold text-white">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 progress-bar" role="progressbar" aria-label="Progresso na carreira" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={LEVELS.length}>
          <span style={{ width: `${(completed / LEVELS.length) * 100}%` }} />
        </div>
      </section>

      {AREAS.map((area, areaNumber) => {
        const Icon = AREA_ICON[area.id];
        const done = isAreaDone(area.id, progress);
        const firstIndex = levelIndex(areaLevels(area.id)[0].id);
        const locked = !isUnlocked(firstIndex, progress);
        return (
          <section key={area.id} className={`card-surface rounded-[28px] p-6 ${locked ? 'opacity-70' : ''}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${AREA_ACCENT[area.id]} text-slate-950`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Área {areaNumber + 1}</div>
                  <h2 className="text-xl font-bold text-white">{area.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm text-slate-300">{area.dayToDay}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {area.topics.map((topic) => (
                      <span key={topic} className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div
                className={`inline-flex shrink-0 items-center gap-2 self-start rounded-xl border px-3 py-2 text-xs ${
                  done ? 'border-amber-300/50 bg-amber-300/10 text-amber-100' : 'border-slate-700 text-slate-400'
                }`}
              >
                <Award className="h-4 w-4" />
                {done ? `Promovido(a): ${area.role}` : `Promoção: ${area.role}`}
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {areaLevels(area.id).map((level) => {
                const index = levelIndex(level.id);
                const unlocked = isUnlocked(index, progress);
                const result = progress.results[level.id];
                return (
                  <button
                    key={level.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => onOpen(level.id)}
                    className={`group rounded-2xl border p-4 text-left transition ${
                      result
                        ? 'border-emerald-400/30 bg-emerald-500/5 hover:border-emerald-300/60'
                        : unlocked
                          ? 'border-cyan-400/40 bg-cyan-400/5 hover:border-cyan-300 hover:bg-cyan-400/10'
                          : 'cursor-not-allowed border-slate-800 bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-slate-400">Fase {index + 1}</span>
                      <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-300">{KIND_LABEL[level.kind]}</span>
                    </div>
                    <div className={`mt-3 font-semibold ${unlocked ? 'text-white' : 'text-slate-500'}`}>{level.title}</div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      {result ? (
                        <Stars count={result.stars} />
                      ) : unlocked ? (
                        <span className="inline-flex items-center gap-1 text-cyan-200">
                          <Play className="h-3.5 w-3.5" />
                          Jogar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Lock className="h-3.5 w-3.5" />
                          Conclua a fase {index}
                        </span>
                      )}
                      {result ? <span className="text-slate-400 group-hover:text-slate-200">Jogar de novo</span> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {completed > 0 ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Apagar todo o progresso da simulação e recomeçar do estágio?')) simActions.reset();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-400 hover:border-rose-400/60 hover:text-rose-200"
          >
            <RotateCcw className="h-4 w-4" />
            Recomeçar a carreira
          </button>
        </div>
      ) : null}
      <p className="text-center text-xs text-slate-500">O progresso da simulação fica salvo neste navegador.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Uma fase

function LevelPlayer({ level, onExit, onOpen }: { level: Level; onExit: () => void; onOpen: (id: string) => void }) {
  const progress = useSimProgress();
  const [attempt, setAttempt] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [solved, setSolved] = useState(false);

  const index = levelIndex(level.id);
  const area = AREAS.find((a) => a.id === level.area)!;
  const areaNumber = AREAS.indexOf(area) + 1;
  const nextLevel = LEVELS[index + 1];
  const stars = starsFor(mistakes);
  const AreaIcon = AREA_ICON[level.area];
  const lastOfArea = !nextLevel || nextLevel.area !== level.area;

  const onMistake = () => setMistakes((m) => m + 1);
  const onSolved = () => {
    setSolved(true);
    simActions.complete(level.id, starsFor(mistakes));
  };

  const restart = () => {
    setAttempt((a) => a + 1);
    setMistakes(0);
    setHintShown(false);
    setSolved(false);
    window.scrollTo({ top: 0 });
  };

  const props = { solved, onMistake, onSolved };
  const mechanic = (() => {
    switch (level.kind) {
      case 'diagnose':
        return <DiagnoseMechanic level={level} {...props} />;
      case 'config':
        return <ConfigMechanic level={level} {...props} />;
      case 'classify':
        return <ClassifyMechanic level={level} {...props} />;
      case 'firewall':
        return <FirewallMechanic level={level} {...props} />;
      case 'logs':
        return <LogsMechanic level={level} {...props} />;
      case 'sequence':
        return <SequenceMechanic level={level} {...props} />;
    }
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onExit} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Mapa de fases
        </button>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span>
            Erros: <span className="font-mono text-slate-200">{mistakes}</span>
          </span>
          <Stars count={stars} />
        </div>
      </div>

      <section className="card-surface rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${AREA_ACCENT[level.area]} px-3 py-1 font-semibold text-slate-950`}>
            <AreaIcon className="h-3.5 w-3.5" />
            Área {areaNumber} · {area.title}
          </span>
          <span className="font-mono text-slate-400">
            Fase {index + 1} de {LEVELS.length}
          </span>
          <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-300">{KIND_LABEL[level.kind]}</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">{level.title}</h1>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Ticket className="h-4 w-4" />
                Chamado #{2026100 + index * 7} · {level.ticket.from}
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-xs ${PRIORITY_STYLE[level.ticket.priority]}`}>Prioridade {level.ticket.priority}</span>
            </div>
            <p className="mt-3 text-slate-100">“{level.ticket.message}”</p>
          </div>

          <div className="space-y-3">
            {level.context ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Documentação</div>
                <dl className="space-y-1.5 text-sm">
                  {level.context.map((item) => (
                    <div key={item.label} className="flex flex-wrap justify-between gap-x-3">
                      <dt className="text-slate-400">{item.label}</dt>
                      <dd className="font-mono text-slate-100">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
            {hintShown ? (
              <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-50">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <Lightbulb className="h-4 w-4" />
                  Dica
                </div>
                {level.hint}
              </div>
            ) : !solved ? (
              <button
                type="button"
                onClick={() => {
                  setHintShown(true);
                  onMistake();
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-300/40 px-4 py-3 text-sm text-amber-100 hover:bg-amber-300/10"
              >
                <Lightbulb className="h-4 w-4" />
                Pedir uma dica (conta como 1 erro)
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="card-surface rounded-[28px] p-6 sm:p-8" key={attempt}>
        {mechanic}
      </section>

      {solved ? (
        <section className="card-surface rounded-[28px] border-emerald-400/30 p-6 sm:p-8" aria-live="polite">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">Chamado resolvido</div>
              <div className="mt-3 flex items-center gap-4">
                <Stars count={stars} size="h-8 w-8" />
                <span className="text-lg font-bold text-white">+{stars * XP_PER_STAR} XP</span>
              </div>
              {progress.results[level.id] && progress.results[level.id].stars > stars ? (
                <p className="mt-2 text-xs text-slate-400">Seu recorde nesta fase continua sendo {progress.results[level.id].stars} estrelas.</p>
              ) : null}
            </div>
            {lastOfArea ? (
              <div className="rounded-2xl border border-amber-300/40 bg-amber-300/10 px-5 py-4 text-amber-50">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Award className="h-5 w-5" />
                  {nextLevel ? 'Promoção!' : 'Carreira concluída!'}
                </div>
                <div className="mt-1 text-sm">
                  Você agora é <strong>{nextLevel ? area.role : FINAL_ROLE}</strong>.
                </div>
              </div>
            ) : null}
          </div>

          <p className="mt-6 text-slate-200">{level.debrief}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {nextLevel ? (
              <button
                type="button"
                onClick={() => onOpen(nextLevel.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:opacity-90"
              >
                Próxima fase: {nextLevel.title}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={onExit} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:opacity-90">
                <Trophy className="h-4 w-4" />
                Ver minha carreira
              </button>
            )}
            {stars < 3 ? (
              <button type="button" onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-slate-500">
                <RotateCcw className="h-4 w-4" />
                Tentar 3 estrelas
              </button>
            ) : null}
            <Link
              href={`/aulas/${level.module.slug}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-cyan-400/60 hover:text-white"
            >
              <BookOpen className="h-4 w-4" />
              Revisar a aula: {level.module.title}
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
