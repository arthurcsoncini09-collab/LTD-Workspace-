'use client';

import { useId } from 'react';
import { Activity, Bug, ShieldAlert } from 'lucide-react';
import type { AvatarLook, Character } from '@/lib/simulacao/characters';

// Avatares desenhados em SVG a partir do "visual" de cada personagem.

const CAP = 'M19 27 C18 15 25 10.5 32 10.5 C40 10.5 46 15 45 27 C42 20.5 37 18.5 32 18.5 C27 18.5 22 20.5 19 27Z';

export function FaceAvatar({ look, size = 48, title, dimmed = false }: { look: AvatarLook; size?: number; title?: string; dimmed?: boolean }) {
  const clip = useId();
  const { skin, hair, hairStyle, shirt, background, accessory } = look;
  const glasses = accessory === 'oculos' || accessory === 'oculos-barba';
  const beard = accessory === 'barba' || accessory === 'oculos-barba';

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`shrink-0 rounded-full ${dimmed ? 'opacity-40 grayscale' : ''}`}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="64" height="64" fill={background} />

        {/* Cabelo atrás da cabeça */}
        {hairStyle === 'longo' ? <path d="M17 28 C15 12 49 12 47 28 L49 52 C42 56 22 56 15 52Z" fill={hair} /> : null}
        {hairStyle === 'coque' ? <circle cx="32" cy="9" r="7" fill={hair} /> : null}
        {hairStyle === 'rabo' ? <path d="M43 20 C53 22 54 36 49 44 C48 36 46 30 42 26Z" fill={hair} /> : null}
        {hairStyle === 'cacheado' ? <ellipse cx="32" cy="24" rx="18" ry="15" fill={hair} /> : null}

        {/* Corpo */}
        <path d="M6 64 C6 50 17 44 32 44 C47 44 58 50 58 64Z" fill={shirt} />
        <path d="M26 44 L32 51 L38 44Z" fill="#000" opacity="0.15" />
        <rect x="27" y="36" width="10" height="10" rx="3" fill={skin} />
        <rect x="27" y="36" width="10" height="4" fill="#000" opacity="0.08" />

        {/* Cabeça */}
        <circle cx="19" cy="29" r="3" fill={skin} />
        <circle cx="45" cy="29" r="3" fill={skin} />
        <ellipse cx="32" cy="28" rx="13" ry="14" fill={skin} />

        {/* Cabelo na frente */}
        {hairStyle === 'curto' || hairStyle === 'longo' || hairStyle === 'coque' || hairStyle === 'rabo' ? <path d={CAP} fill={hair} /> : null}
        {hairStyle === 'cacheado' ? (
          <g fill={hair}>
            {[
              [20, 23],
              [23, 16.5],
              [29, 13],
              [35, 13],
              [41, 16.5],
              [44, 23],
            ].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5.5" />
            ))}
          </g>
        ) : null}
        {hairStyle === 'raspado' ? <path d="M19.5 25 C19 16 25 13 32 13 C39 13 45 16 44.5 25 C41 19.5 23 19.5 19.5 25Z" fill={hair} opacity="0.85" /> : null}

        {/* Rosto */}
        <circle cx="27" cy="29" r="1.6" fill="#1f2937" />
        <circle cx="37" cy="29" r="1.6" fill="#1f2937" />
        <circle cx="24" cy="34" r="2" fill="#f43f5e" opacity="0.18" />
        <circle cx="40" cy="34" r="2" fill="#f43f5e" opacity="0.18" />
        {beard ? <path d="M19.5 30 C20 41 26 44.5 32 44.5 C38 44.5 44 41 44.5 30 C42 37 38 39.5 32 39.5 C26 39.5 22 37 19.5 30Z" fill={hair} /> : null}
        <path d="M27.5 34.5 Q32 38.5 36.5 34.5" stroke={beard ? '#fecaca' : '#7f1d1d'} strokeWidth="1.6" fill="none" strokeLinecap="round" />

        {/* Acessórios */}
        {glasses ? (
          <g stroke="#e2e8f0" strokeWidth="1.3" fill="none">
            <circle cx="27" cy="29" r="4" />
            <circle cx="37" cy="29" r="4" />
            <path d="M31 29 H33" />
          </g>
        ) : null}
        {accessory === 'headset' ? (
          <g>
            <path d="M17 29 C16 11 48 11 47 29" stroke="#0f172a" strokeWidth="2.6" fill="none" />
            <rect x="14" y="25" width="5.5" height="9" rx="2" fill="#0f172a" />
            <rect x="44.5" y="25" width="5.5" height="9" rx="2" fill="#0f172a" />
            <path d="M17 33 Q19 40 25.5 38.5" stroke="#0f172a" strokeWidth="1.6" fill="none" />
            <circle cx="26" cy="38.5" r="1.6" fill="#0f172a" />
          </g>
        ) : null}
        {accessory === 'brincos' ? (
          <g fill="#fbbf24">
            <circle cx="19" cy="33.5" r="1.6" />
            <circle cx="45" cy="33.5" r="1.6" />
          </g>
        ) : null}
      </g>
    </svg>
  );
}

const SYSTEM_ICON = { siem: ShieldAlert, antivirus: Bug, monitor: Activity };

export function Avatar({ character, size = 48, dimmed = false }: { character: Character; size?: number; dimmed?: boolean }) {
  if (character.look) return <FaceAvatar look={character.look} size={size} title={character.name} dimmed={dimmed} />;
  const Icon = SYSTEM_ICON[character.system ?? 'monitor'];
  return (
    <span
      role="img"
      aria-label={character.name}
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-cyan-200 ${dimmed ? 'opacity-40' : ''}`}
    >
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
    </span>
  );
}

/** Balão de fala com avatar. */
export function SpeechBubble({
  character,
  children,
  tone = 'default',
  size = 44,
}: {
  character: Character;
  children: React.ReactNode;
  tone?: 'default' | 'warn' | 'success';
  size?: number;
}) {
  const styles = {
    default: 'border-slate-700 bg-slate-900/80',
    warn: 'border-amber-300/40 bg-amber-300/10',
    success: 'border-emerald-400/40 bg-emerald-500/10',
  }[tone];
  return (
    <div className="flex items-start gap-3">
      <Avatar character={character} size={size} />
      <div className={`relative flex-1 rounded-2xl rounded-tl-sm border px-4 py-3 ${styles}`}>
        <div className="text-xs font-semibold text-slate-300">
          {character.name} <span className="font-normal text-slate-500">· {character.role}</span>
        </div>
        <div className="mt-1 text-sm text-slate-100">{children}</div>
      </div>
    </div>
  );
}
