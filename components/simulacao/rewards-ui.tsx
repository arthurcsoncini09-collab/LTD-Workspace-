'use client';

import {
  Activity,
  Award,
  Binary,
  Check,
  Cloudy,
  Crown,
  Flame,
  Gift,
  Globe,
  Layers,
  Lock,
  Medal,
  Printer,
  Radar,
  Rocket,
  Route,
  ScanSearch,
  Shirt,
  Siren,
  Sparkles,
  UserRoundPlus,
  Waypoints,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react';
import { DEFAULT_PLAYER_LOOK, type AvatarLook } from '@/lib/simulacao/characters';
import { AREAS, LEVELS } from '@/lib/simulacao/levels';
import {
  ALL_BADGES,
  GEAR,
  GEAR_SLOTS,
  LEGEND_BADGE,
  earnedBadgeIds,
  unlockHint,
  unlockedGear,
  type Badge,
  type BadgeIcon,
  type GearItem,
} from '@/lib/simulacao/rewards';
import type { AreaId } from '@/lib/simulacao/types';
import { FaceAvatar } from './avatar';
import { simActions, type SimProgress } from './sim-progress';

const ICONS: Record<BadgeIcon, LucideIcon> = {
  'wifi-off': WifiOff,
  globe: Globe,
  printer: Printer,
  binary: Binary,
  layers: Layers,
  route: Route,
  flame: Flame,
  'scan-search': ScanSearch,
  siren: Siren,
  cloudy: Cloudy,
  rocket: Rocket,
  activity: Activity,
  radar: Radar,
  waypoints: Waypoints,
  medal: Medal,
  award: Award,
  crown: Crown,
};

const AREA_GRADIENT: Record<AreaId, string> = {
  suporte: 'from-sky-500 to-cyan-400',
  redes: 'from-blue-600 to-indigo-400',
  seguranca: 'from-rose-600 to-orange-400',
  cloud: 'from-violet-600 to-fuchsia-400',
  noc: 'from-emerald-600 to-teal-400',
};

/** Medalha de um badge. Bloqueada, aparece em cinza com um cadeado. */
export function BadgeMedal({ badge, earned, size = 64 }: { badge: Badge; earned: boolean; size?: number }) {
  const Icon = ICONS[badge.icon];
  const gradient =
    badge.tier === 'lenda' ? 'from-amber-300 via-yellow-400 to-orange-500' : badge.area ? AREA_GRADIENT[badge.area] : 'from-slate-500 to-slate-400';
  const ring = badge.tier === 'fase' ? 'ring-slate-900/60' : 'ring-amber-300/80';
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden>
      <div
        className={`flex h-full w-full items-center justify-center rounded-full ring-4 ${
          earned ? `bg-gradient-to-br ${gradient} ${ring} shadow-lg shadow-black/40` : 'bg-slate-800 ring-slate-700/70'
        }`}
      >
        <Icon className={earned ? 'text-white drop-shadow' : 'text-slate-600'} style={{ width: size * 0.42, height: size * 0.42 }} />
      </div>
      {earned && badge.tier !== 'fase' ? (
        <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-amber-200" />
      ) : null}
      {!earned ? (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 bg-slate-900">
          <Lock className="h-3 w-3 text-slate-500" />
        </span>
      ) : null}
    </div>
  );
}

function BadgeCard({ badge, earned, requirement }: { badge: Badge; earned: boolean; requirement: string }) {
  return (
    <div
      className={`flex items-start gap-4 rounded-xl border p-4 ${earned ? 'border-slate-700 bg-slate-900/70' : 'border-slate-800 bg-slate-950/40'}`}
    >
      <BadgeMedal badge={badge} earned={earned} size={56} />
      <div className="min-w-0">
        <div className={`font-semibold ${earned ? 'text-white' : 'text-slate-400'}`}>{badge.name}</div>
        <p className={`mt-1 text-xs ${earned ? 'text-slate-300' : 'text-slate-500'}`}>{badge.description}</p>
        {!earned ? (
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
            <Lock className="h-3 w-3" />
            {requirement}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Painel de badges

export function AchievementsPanel({ progress }: { progress: SimProgress }) {
  const earned = earnedBadgeIds(progress.results);
  const levelNumber = (id: string) => LEVELS.findIndex((l) => `fase:${l.id}` === id) + 1;

  return (
    <div className="space-y-6">
      <section className="card-surface rounded-xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Conquistas</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">Seus badges</h2>
            <p className="mt-1 text-sm text-slate-300">Cada fase concluída rende um badge. Concluir uma área rende o badge da promoção.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {earned.size}
              <span className="text-lg text-slate-500">/{ALL_BADGES.length}</span>
            </div>
            <div className="text-xs text-slate-400">badges conquistados</div>
          </div>
        </div>
        <div className="mt-4 progress-bar" role="progressbar" aria-label="Badges conquistados" aria-valuenow={earned.size} aria-valuemin={0} aria-valuemax={ALL_BADGES.length}>
          <span style={{ width: `${(earned.size / ALL_BADGES.length) * 100}%` }} />
        </div>
      </section>

      {AREAS.map((area) => (
        <section key={area.id} className="card-surface rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white">{area.title}</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {ALL_BADGES.filter((b) => b.area === area.id && b.tier === 'fase').map((badge) => (
              <BadgeCard key={badge.id} badge={badge} earned={earned.has(badge.id)} requirement={`Conclua a fase ${levelNumber(badge.id)}`} />
            ))}
            {ALL_BADGES.filter((b) => b.area === area.id && b.tier === 'promocao').map((badge) => (
              <BadgeCard key={badge.id} badge={badge} earned={earned.has(badge.id)} requirement="Conclua as 3 fases da área" />
            ))}
          </div>
        </section>
      ))}

      <section className="card-surface rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white">Especial</h3>
        <div className="mt-4 max-w-md">
          <BadgeCard badge={LEGEND_BADGE} earned={earned.has(LEGEND_BADGE.id)} requirement="3 estrelas em todas as fases" />
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Guarda-roupa

/** Visual do jogador vestindo um item no lugar do que está naquela parte do corpo. */
function tryOn(look: AvatarLook, item: GearItem): AvatarLook {
  return { ...look, gear: { ...look.gear, [item.slot]: item.id } };
}

export function Wardrobe({ progress, onCreatePlayer }: { progress: SimProgress; onCreatePlayer: () => void }) {
  const unlocked = unlockedGear(progress.results);
  const player = progress.player;
  const look = player?.look ?? DEFAULT_PLAYER_LOOK;
  const worn = look.gear ?? {};
  const total = Object.keys(GEAR).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <section className="card-surface h-fit rounded-xl p-6 xl:sticky xl:top-24">
        <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Guarda-roupa</div>
        <div className="mt-4 flex flex-col items-center text-center">
          <FaceAvatar look={look} size={180} title={player ? `${player.name} com os acessórios escolhidos` : 'Prévia do personagem'} />
          <div className="mt-4 text-lg font-semibold text-white">{player?.name ?? 'Seu personagem'}</div>
          <div className="mt-1 text-sm text-slate-400">
            {unlocked.size} de {total} acessórios desbloqueados
          </div>
        </div>
        {player ? (
          Object.keys(worn).length ? (
            <button
              type="button"
              onClick={() => GEAR_SLOTS.forEach((slot) => simActions.equip(slot.id, null))}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
              Tirar todos os acessórios
            </button>
          ) : null
        ) : (
          <div className="mt-5 rounded-lg border border-cyan-400/30 bg-cyan-400/5 p-4 text-sm text-slate-200">
            Crie seu personagem para vestir os acessórios que você conquistar.
            <button
              type="button"
              onClick={onCreatePlayer}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <UserRoundPlus className="h-4 w-4" />
              Criar personagem
            </button>
          </div>
        )}
      </section>

      <div className="space-y-6">
        {GEAR_SLOTS.map((slot) => {
          const items = Object.values(GEAR).filter((item) => item.slot === slot.id);
          return (
            <section key={slot.id} className="card-surface rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white">{slot.label}</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                {items.map((item) => {
                  const isUnlocked = unlocked.has(item.id);
                  const isWorn = worn[slot.id] === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={!isUnlocked || !player}
                      aria-pressed={isWorn}
                      title={isUnlocked ? item.description : unlockHint(item.id)}
                      onClick={() => simActions.equip(slot.id, isWorn ? null : item.id)}
                      className={`group relative flex flex-col items-center rounded-xl border p-3 text-center transition ${
                        isWorn
                          ? 'border-cyan-300 bg-cyan-400/10 ring-2 ring-cyan-400/40'
                          : isUnlocked
                            ? 'border-slate-700 bg-slate-900/70 hover:border-slate-500 disabled:cursor-default disabled:hover:border-slate-700'
                            : 'cursor-not-allowed border-slate-800 bg-slate-950/40'
                      }`}
                    >
                      <FaceAvatar look={tryOn(look, item)} size={76} dimmed={!isUnlocked} />
                      <div className={`mt-2 text-sm font-medium ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{item.name}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {isWorn ? (
                          <span className="inline-flex items-center gap-1 text-cyan-200">
                            <Check className="h-3 w-3" />
                            Vestindo · clique para tirar
                          </span>
                        ) : isUnlocked ? (
                          player ? (
                            'Clique para vestir'
                          ) : (
                            'Desbloqueado'
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            {unlockHint(item.id)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recompensas ao concluir uma fase

export function RewardsUnlocked({
  badges,
  gear,
  progress,
}: {
  badges: Badge[];
  gear: GearItem[];
  progress: SimProgress;
}) {
  if (!badges.length && !gear.length) return null;
  const player = progress.player;
  const look = player?.look ?? DEFAULT_PLAYER_LOOK;

  return (
    <div className="mt-6 rounded-xl border border-amber-300/40 bg-amber-300/[0.06] p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
        <Gift className="h-4 w-4" />
        Recompensas desbloqueadas
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {badges.map((badge) => (
          <div key={badge.id} className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <BadgeMedal badge={badge} earned size={60} />
            <div>
              <div className="text-xs uppercase tracking-[0.08em] text-amber-200">{badge.tier === 'fase' ? 'Novo badge' : 'Badge especial'}</div>
              <div className="font-semibold text-white">{badge.name}</div>
              <p className="mt-1 text-xs text-slate-300">{badge.description}</p>
            </div>
          </div>
        ))}
        {gear.map((item) => {
          const isWorn = look.gear?.[item.slot] === item.id;
          return (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <FaceAvatar look={tryOn(look, item)} size={68} title={`Prévia com ${item.name}`} />
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-[0.08em] text-amber-200">Novo acessório</div>
                <div className="font-semibold text-white">{item.name}</div>
                <p className="mt-1 text-xs text-slate-300">{item.description}</p>
                {player ? (
                  <button
                    type="button"
                    disabled={isWorn}
                    onClick={() => simActions.equip(item.slot, item.id)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:bg-emerald-600/80"
                  >
                    {isWorn ? <Check className="h-3.5 w-3.5" /> : <Shirt className="h-3.5 w-3.5" />}
                    {isWorn ? 'Vestindo' : 'Vestir agora'}
                  </button>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">Crie seu personagem no mapa de fases para vestir.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
