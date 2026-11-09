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
  Pencil,
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
import { CHARACTERS, firstName, say } from '@/lib/simulacao/characters';
import { Avatar, FaceAvatar, SpeechBubble } from './avatar';
import { CastGallery, CharacterCreator } from './cast';
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
  const player = progress.player;
  const [editing, setEditing] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const showCreator = editing || (!player && !skipped && completed === 0);

  return (
    <div className="space-y-8">
      {showCreator ? (
        <CharacterCreator
          initial={player}
          onDone={() => {
            setEditing(false);
            setSkipped(true);
          }}
        />
      ) : null}

      <section className="card-surface overflow-hidden rounded-xl p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl gap-5">
            {player ? (
              <div className="hidden shrink-0 flex-col items-center gap-2 sm:flex">
                <FaceAvatar look={player.look} size={88} title={player.name} />
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-200"
                >
                  <Pencil className="h-3 w-3" />
                  Editar
                </button>
              </div>
            ) : null}
            <div>
            <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Simulação · Carreira em TI</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{player ? `${player.name}: do estágio a especialista` : 'Do estágio a especialista'}</h1>
            <p className="mt-3 text-slate-300">
              Você acabou de entrar no time de TI. Resolva chamados reais de 5 áreas diferentes usando o que aprendeu nas aulas, com a ajuda de
              um(a) mentor(a) em cada área. Cada fase concluída libera a próxima — e cada área completa rende uma promoção.
            </p>
            {!player && !showCreator ? (
              <button type="button" onClick={() => setEditing(true)} className="mt-3 inline-flex items-center gap-1.5 text-sm text-cyan-200 hover:text-white">
                <Pencil className="h-3.5 w-3.5" />
                Criar seu personagem
              </button>
            ) : null}
            </div>
          </div>
          {next ? (
            <button
              type="button"
              onClick={() => onOpen(next.id)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition"
            >
              <Play className="h-4 w-4" />
              {completed === 0 ? 'Começar' : 'Continuar'}: Fase {levelIndex(next.id) + 1}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-lg border border-amber-300/40 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-100">
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
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
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
          <section key={area.id} className={`card-surface rounded-xl p-6 ${locked ? 'opacity-70' : ''}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${AREA_ACCENT[area.id]} text-slate-950`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">Área {areaNumber + 1}</div>
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
                className={`inline-flex shrink-0 items-center gap-2 self-start rounded-lg border px-3 py-2 text-xs ${
                  done ? 'border-amber-300/50 bg-amber-300/10 text-amber-100' : 'border-slate-700 text-slate-400'
                }`}
              >
                <Award className="h-4 w-4" />
                {done ? `Promovido(a): ${area.role}` : `Promoção: ${area.role}`}
              </div>
            </div>

            <div className="mt-5">
              {locked ? (
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Avatar character={CHARACTERS[area.mentor]} size={40} dimmed />
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    Seu(sua) mentor(a) desta área aparece quando você chegar aqui.
                  </span>
                </div>
              ) : (
                <SpeechBubble character={CHARACTERS[area.mentor]} tone={done ? 'success' : 'default'} size={40}>
                  {say(done ? area.promotion : area.welcome, player?.name)}
                </SpeechBubble>
              )}
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
                    className={`group rounded-xl border p-4 text-left transition ${
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
                    <div className="mt-3 flex items-center gap-3">
                      <Avatar character={CHARACTERS[level.ticket.requester]} size={32} dimmed={!unlocked} />
                      <div className="min-w-0">
                        <div className={`font-semibold ${unlocked ? 'text-white' : 'text-slate-500'}`}>{level.title}</div>
                        <div className="truncate text-xs text-slate-500">{unlocked ? CHARACTERS[level.ticket.requester].name : 'Chamado bloqueado'}</div>
                      </div>
                    </div>
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

      <CastGallery progress={progress} />

      {completed > 0 ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Apagar todo o progresso da simulação e recomeçar do estágio?')) simActions.reset();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 hover:border-rose-400/60 hover:text-rose-200"
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
  const [slips, setSlips] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [solved, setSolved] = useState(false);

  const index = levelIndex(level.id);
  const area = AREAS.find((a) => a.id === level.area)!;
  const areaNumber = AREAS.indexOf(area) + 1;
  const nextLevel = LEVELS[index + 1];
  const stars = starsFor(mistakes);
  const AreaIcon = AREA_ICON[level.area];
  const lastOfArea = !nextLevel || nextLevel.area !== level.area;
  const mentor = CHARACTERS[area.mentor];
  const requester = CHARACTERS[level.ticket.requester];
  const thanksBy = CHARACTERS[level.story.thanksBy ?? level.ticket.requester];
  const playerName = progress.player?.name;
  const mistakeLines = mentor.onMistake ?? [];

  // Erro na mecânica: conta para as estrelas e faz o mentor comentar.
  const onMistake = () => {
    setMistakes((m) => m + 1);
    setSlips((n) => n + 1);
  };
  const onSolved = () => {
    setSolved(true);
    simActions.complete(level.id, starsFor(mistakes));
  };

  const restart = () => {
    setAttempt((a) => a + 1);
    setMistakes(0);
    setSlips(0);
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
        <button type="button" onClick={onExit} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white">
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

      <section className="card-surface rounded-xl p-6 sm:p-8">
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
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{level.title}</h1>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Ticket className="h-4 w-4" />
                Chamado #{2026100 + index * 7}
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-xs ${PRIORITY_STYLE[level.ticket.priority]}`}>Prioridade {level.ticket.priority}</span>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <Avatar character={requester} size={48} />
              <div>
                <div className="text-sm font-semibold text-white">
                  {requester.name} <span className="font-normal text-slate-400">· {requester.role}</span>
                </div>
                <p className="mt-1 text-slate-100">“{level.ticket.message}”</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {level.context ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">Documentação</div>
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
              <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-50">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <Lightbulb className="h-4 w-4" />
                  Dica de {firstName(mentor)}
                </div>
                <div className="flex items-start gap-3">
                  <Avatar character={mentor} size={32} />
                  <span>{level.hint}</span>
                </div>
              </div>
            ) : !solved ? (
              <button
                type="button"
                onClick={() => {
                  setHintShown(true);
                  onMistake();
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-amber-300/40 px-4 py-3 text-sm text-amber-100 hover:bg-amber-300/10"
              >
                <Lightbulb className="h-4 w-4" />
                Pedir uma dica a {firstName(mentor)} (conta como 1 erro)
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <SpeechBubble character={mentor} size={44}>
            <div className="space-y-1.5">
              {level.story.briefing.map((line, i) => (
                <p key={i}>{say(line, playerName)}</p>
              ))}
            </div>
          </SpeechBubble>
        </div>
      </section>

      <section className="card-surface rounded-xl p-6 sm:p-8" key={attempt}>
        {mechanic}
        {slips > 0 && !solved && mistakeLines.length ? (
          <div className="mt-5" aria-live="polite">
            <SpeechBubble character={mentor} tone="warn" size={40}>
              {say(mistakeLines[(slips - 1) % mistakeLines.length], playerName)}
            </SpeechBubble>
          </div>
        ) : null}
      </section>

      {solved ? (
        <section className="card-surface rounded-xl border-emerald-400/30 p-6 sm:p-8" aria-live="polite">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-emerald-300">Chamado resolvido</div>
              <div className="mt-3 flex items-center gap-4">
                <Stars count={stars} size="h-8 w-8" />
                <span className="text-lg font-bold text-white">+{stars * XP_PER_STAR} XP</span>
              </div>
              {progress.results[level.id] && progress.results[level.id].stars > stars ? (
                <p className="mt-2 text-xs text-slate-400">Seu recorde nesta fase continua sendo {progress.results[level.id].stars} estrelas.</p>
              ) : null}
            </div>
            {lastOfArea ? (
              <div className="rounded-xl border border-amber-300/40 bg-amber-300/10 px-5 py-4 text-amber-50">
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

          <div className="mt-6 space-y-3">
            <SpeechBubble character={thanksBy} tone="success">
              {say(level.story.thanks, playerName)}
            </SpeechBubble>
            {lastOfArea ? (
              <SpeechBubble character={mentor} tone="success">
                {say(area.promotion, playerName)}
              </SpeechBubble>
            ) : null}
          </div>

          <p className="mt-6 text-slate-200">{level.debrief}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {nextLevel ? (
              <button
                type="button"
                onClick={() => onOpen(nextLevel.id)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Próxima fase: {nextLevel.title}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={onExit} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:opacity-90">
                <Trophy className="h-4 w-4" />
                Ver minha carreira
              </button>
            )}
            {stars < 3 ? (
              <button type="button" onClick={restart} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-slate-500">
                <RotateCcw className="h-4 w-4" />
                Tentar 3 estrelas
              </button>
            ) : null}
            <Link
              href={`/aulas/${level.module.slug}`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-cyan-400/60 hover:text-white"
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
