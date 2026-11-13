// Desenhos (SVG) dos acessórios conquistados na Simulação.
// Coordenadas no mesmo viewBox 64×64 do FaceAvatar: cabeça centrada em (32, 28),
// olhos em y = 29, boca em y ≈ 35, pescoço de 36 a 46 e tronco a partir de y = 44.

import type { GearId } from '@/lib/simulacao/rewards';

/** Roupas: desenhadas logo depois do tronco, antes do pescoço e da cabeça. */
export function OutfitArt({ id, shirt, hasNeckItem }: { id: GearId; shirt: string; hasNeckItem: boolean }) {
  const torso = 'M6 64 C6 50 17 44 32 44 C47 44 58 50 58 64Z';
  switch (id) {
    case 'moletom':
      return (
        <g>
          <path d={torso} fill="#3f3f46" />
          {/* Capuz caído atrás do pescoço */}
          <path d="M17 48 C16 38.5 48 38.5 47 48 C42 43.5 22 43.5 17 48Z" fill="#27272a" />
          <path d="M23 64 V59 C23 57.5 24 57 25 57 H39 C40 57 41 57.5 41 59 V64Z" fill="#27272a" opacity="0.7" />
          <g stroke="#e4e4e7" strokeWidth="0.9" strokeLinecap="round">
            <path d="M29.5 46 V54" />
            <path d="M34.5 46 V54" />
          </g>
          <circle cx="29.5" cy="54.6" r="0.9" fill="#e4e4e7" />
          <circle cx="34.5" cy="54.6" r="0.9" fill="#e4e4e7" />
        </g>
      );
    case 'jaqueta':
      return (
        <g>
          <path d={torso} fill="#94a3b8" />
          {/* Frente aberta mostrando a camiseta */}
          <path d="M27.5 44 L32 64 L36.5 44Z" fill={shirt} />
          <g stroke="#64748b" strokeWidth="0.9" fill="none">
            <path d="M9 55 C14 54 21 54 28.6 54.5" />
            <path d="M35.4 54.5 C43 54 50 54 55 55" />
            <path d="M7 61 C14 60 22 60 30 60.5" />
            <path d="M34 60.5 C42 60 50 60 57 61" />
          </g>
          <path d="M23 44.6 L27.5 44 L29.2 50Z" fill="#cbd5e1" />
          <path d="M41 44.6 L36.5 44 L34.8 50Z" fill="#cbd5e1" />
        </g>
      );
    case 'terno':
      return (
        <g>
          <path d={torso} fill="#1e293b" />
          <path d="M26.5 44 L32 57.5 L37.5 44Z" fill="#f8fafc" />
          <path d="M26.5 44 L30.4 52.5 L27.6 55.5 L22.5 46Z" fill="#0f172a" />
          <path d="M37.5 44 L33.6 52.5 L36.4 55.5 L41.5 46Z" fill="#0f172a" />
          {!hasNeckItem ? <path d="M31.1 45 H32.9 L33.4 54.5 L32 56.5 L30.6 54.5Z" fill="#b91c1c" /> : null}
          <path d="M42.5 52.5 L47 51.3 L46.4 54Z" fill="#f8fafc" />
          <circle cx="32" cy="60.5" r="0.8" fill="#64748b" />
        </g>
      );
    default:
      return null;
  }
}

/** Itens de pescoço: desenhados depois da cabeça, abaixo do queixo. */
export function NeckArt({ id }: { id: GearId }) {
  switch (id) {
    case 'cracha':
      return (
        <g>
          <g stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round">
            <path d="M27 44 L30.4 54" />
            <path d="M37 44 L33.6 54" />
          </g>
          <rect x="28.5" y="53.5" width="7" height="9" rx="1" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
          <rect x="28.5" y="53.5" width="7" height="2.4" rx="1" fill="#2563eb" />
          <circle cx="32" cy="58.2" r="1.3" fill="#94a3b8" />
          <path d="M30 61 H34" stroke="#94a3b8" strokeWidth="0.7" />
        </g>
      );
    case 'gravata':
      return (
        <g>
          <path d="M30.4 44.4 H33.6 L33 47.6 H31Z" fill="#b91c1c" />
          <path d="M31 47.6 H33 L34.7 58.5 L32 62 L29.3 58.5Z" fill="#dc2626" />
          <g stroke="#fecaca" strokeWidth="0.7" opacity="0.7">
            <path d="M30.4 52 L33.7 50" />
            <path d="M29.9 56 L34.2 53.6" />
          </g>
        </g>
      );
    case 'colar':
      return (
        <g>
          <path d="M25 44.5 Q32 52.5 39 44.5" stroke="#fbbf24" strokeWidth="1.1" strokeDasharray="1.4 0.8" fill="none" />
          <path d="M30.7 51.6 V50.4 A1.3 1.3 0 0 1 33.3 50.4 V51.6" stroke="#fbbf24" strokeWidth="0.9" fill="none" />
          <rect x="30" y="51.4" width="4" height="3.4" rx="0.6" fill="#fbbf24" />
          <circle cx="32" cy="52.9" r="0.5" fill="#92400e" />
        </g>
      );
    case 'cachecol':
      return (
        <g>
          <path d="M21.5 42 C27 46.5 37 46.5 42.5 42 L43 46.5 C37 51 27 51 21 46.5Z" fill="#dc2626" />
          <path d="M35 47.5 H40 L39.5 59 H35.5Z" fill="#dc2626" />
          <g fill="#fef2f2" opacity="0.85">
            <rect x="35.2" y="51" width="4.6" height="1.2" />
            <rect x="35.3" y="54.5" width="4.4" height="1.2" />
          </g>
          <path d="M22 44.2 C27 48.2 37 48.2 42.4 44.2" stroke="#fef2f2" strokeWidth="1" opacity="0.6" fill="none" />
          <g stroke="#dc2626" strokeWidth="0.8">
            <path d="M36 59 V61" />
            <path d="M37.5 59 V61.2" />
            <path d="M39 59 V61" />
          </g>
        </g>
      );
    default:
      return null;
  }
}

/** Bigodes: desenhados por cima da boca, na cor do cabelo. */
export function FaceArt({ id, hair }: { id: GearId; hair: string }) {
  switch (id) {
    case 'bigode':
      return (
        <path
          d="M25.5 33.2 C27.5 30.8 30.5 31 32 32.6 C33.5 31 36.5 30.8 38.5 33.2 C36.3 34.6 33.8 34.2 32 33.4 C30.2 34.2 27.7 34.6 25.5 33.2Z"
          fill={hair}
          stroke="#00000033"
          strokeWidth="0.4"
        />
      );
    case 'bigode-imperial':
      return (
        <path
          d="M27 32.8 C29 31.3 31 31.6 32 32.8 C33 31.6 35 31.3 37 32.8 C38.5 33.8 40 33.2 40.3 31.6 C41 33.8 39.2 35.4 37 34.4 C35.2 33.6 33.6 33.6 32 33.9 C30.4 33.6 28.8 33.6 27 34.4 C24.8 35.4 23 33.8 23.7 31.6 C24 33.2 25.5 33.8 27 32.8Z"
          fill={hair}
          stroke="#00000033"
          strokeWidth="0.4"
        />
      );
    default:
      return null;
  }
}

/** Óculos conquistados (substituem os óculos básicos do criador de personagem). */
export function EyesArt({ id }: { id: GearId }) {
  switch (id) {
    case 'oculos-redondos':
      return (
        <g>
          <circle cx="27" cy="29" r="4.5" fill="#bae6fd" fillOpacity="0.15" stroke="#b45309" strokeWidth="1.5" />
          <circle cx="37" cy="29" r="4.5" fill="#bae6fd" fillOpacity="0.15" stroke="#b45309" strokeWidth="1.5" />
          <g stroke="#b45309" strokeWidth="1.1" fill="none" strokeLinecap="round">
            <path d="M31.5 28.6 Q32 27.6 32.5 28.6" />
            <path d="M22.5 28.4 L19.6 27.4" />
            <path d="M41.5 28.4 L44.4 27.4" />
          </g>
        </g>
      );
    case 'oculos-escuros':
      return (
        <g>
          <rect x="22" y="25.6" width="9" height="6.4" rx="2.4" fill="#0f172a" stroke="#020617" strokeWidth="0.8" />
          <rect x="33" y="25.6" width="9" height="6.4" rx="2.4" fill="#0f172a" stroke="#020617" strokeWidth="0.8" />
          <g stroke="#020617" strokeWidth="1.1" strokeLinecap="round">
            <path d="M31 27.6 H33" />
            <path d="M22 27.4 L19.6 26.8" />
            <path d="M42 27.4 L44.4 26.8" />
          </g>
          <g stroke="#f8fafc" strokeWidth="0.8" opacity="0.55" strokeLinecap="round">
            <path d="M23.6 27.3 L25.8 26.8" />
            <path d="M34.6 27.3 L36.8 26.8" />
          </g>
        </g>
      );
    default:
      return null;
  }
}

/** Chapéus: desenhados por último, por cima do cabelo. */
export function HeadArt({ id }: { id: GearId }) {
  switch (id) {
    case 'bone':
      return (
        <g>
          <path d="M18.5 25 C18 13.5 25 10 32 10 C39 10 46 13.5 45.5 25 C40 22.5 24 22.5 18.5 25Z" fill="#2563eb" />
          <path d="M32 10.5 C30.4 15 30.4 19 30.8 23.2" stroke="#1e40af" strokeWidth="0.8" fill="none" />
          <path d="M16.5 25.6 C22 21.6 42 21.6 47.5 25.6 C42 28 22 28 16.5 25.6Z" fill="#1d4ed8" />
          <circle cx="32" cy="10.6" r="1.2" fill="#1e40af" />
          {/* Letra N, de NetLearn */}
          <path d="M35.6 19.2 V15 L38.4 19.2 V15" stroke="#f8fafc" strokeWidth="0.9" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        </g>
      );
    case 'boina':
      return (
        <g>
          <path d="M16 19.8 C13.5 12 26 7.8 36 9.4 C45.5 11 50.5 15 47.6 20.2 C42 17.6 24 17.2 16 19.8Z" fill="#7f1d1d" />
          <path d="M18 19.6 C25 17 39 17 46 19.6 L46 21.2 C39 18.7 25 18.7 18 21.2Z" fill="#450a0a" />
          <path d="M33 9.6 L33.6 7 L35 7.4 L34.4 9.8Z" fill="#450a0a" />
          <path d="M22 13.5 C27 11 34 10.6 40 12" stroke="#f8fafc" strokeWidth="0.7" opacity="0.2" fill="none" />
        </g>
      );
    case 'chapeu':
      return (
        <g>
          <path d="M21.5 20 C21 11 25 7 32 7 C39 7 43 11 42.5 20Z" fill="#57534e" />
          <path d="M27.5 8.6 Q32 11.2 36.5 8.6" stroke="#3f3a36" strokeWidth="1" fill="none" />
          <path d="M21.4 16.4 H42.6 V19.8 H21.4Z" fill="#1c1917" />
          <path d="M9.5 21 C14 17.4 50 17.4 54.5 21 C50 23.6 14 23.6 9.5 21Z" fill="#44403c" />
        </g>
      );
    case 'capacete':
      return (
        <g>
          <path d="M17.5 23.5 C17.5 11.5 25 8 32 8 C39 8 46.5 11.5 46.5 23.5Z" fill="#facc15" />
          <path d="M30 8.3 H34 V23.5 H30Z" fill="#eab308" />
          <path d="M14.5 22.4 H49.5 C50.6 22.4 50.6 25.6 49.5 25.6 H14.5 C13.4 25.6 13.4 22.4 14.5 22.4Z" fill="#ca8a04" />
          <path d="M21 18 C21.5 13.5 24.5 11 28 10.2" stroke="#fef9c3" strokeWidth="1" opacity="0.6" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'coroa':
      return (
        <g>
          <path d="M20.5 19 L19.5 8.5 L25.5 13.5 L29 5.5 L32 11.5 L35 5.5 L38.5 13.5 L44.5 8.5 L43.5 19Z" fill="#fbbf24" stroke="#b45309" strokeWidth="0.6" strokeLinejoin="round" />
          <rect x="20.4" y="16.2" width="23.2" height="3.2" rx="0.8" fill="#f59e0b" />
          <circle cx="26" cy="17.8" r="1.1" fill="#ef4444" />
          <circle cx="32" cy="17.8" r="1.2" fill="#3b82f6" />
          <circle cx="38" cy="17.8" r="1.1" fill="#22c55e" />
          <g fill="#fde68a">
            <circle cx="19.5" cy="8.5" r="1" />
            <circle cx="29" cy="5.5" r="1" />
            <circle cx="35" cy="5.5" r="1" />
            <circle cx="44.5" cy="8.5" r="1" />
          </g>
        </g>
      );
    default:
      return null;
  }
}
