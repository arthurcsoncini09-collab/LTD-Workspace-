import { AREAS, LEVELS } from './levels';
import type { AreaId } from './types';

// Recompensas da Simulação: cada fase concluída rende um badge e um acessório
// para o boneco do jogador. Concluir uma área rende um badge de promoção, e
// fazer 3 estrelas em todas as fases rende o badge "Lenda da TI" e a coroa.

// ---------------------------------------------------------------------------
// Acessórios (um por parte do corpo, combináveis)

export type GearSlot = 'head' | 'eyes' | 'face' | 'neck' | 'outfit';

export type GearId =
  | 'cracha'
  | 'oculos-redondos'
  | 'bone'
  | 'gravata'
  | 'bigode'
  | 'boina'
  | 'moletom'
  | 'oculos-escuros'
  | 'colar'
  | 'jaqueta'
  | 'chapeu'
  | 'bigode-imperial'
  | 'capacete'
  | 'cachecol'
  | 'terno'
  | 'coroa';

export type GearItem = { id: GearId; slot: GearSlot; name: string; description: string };

/** O que o boneco está vestindo: no máximo um item por parte do corpo. */
export type Outfit = Partial<Record<GearSlot, GearId>>;

export const GEAR_SLOTS: { id: GearSlot; label: string }[] = [
  { id: 'head', label: 'Cabeça' },
  { id: 'eyes', label: 'Olhos' },
  { id: 'face', label: 'Rosto' },
  { id: 'neck', label: 'Pescoço' },
  { id: 'outfit', label: 'Roupa' },
];

export const GEAR: Record<GearId, GearItem> = {
  cracha: { id: 'cracha', slot: 'neck', name: 'Crachá da empresa', description: 'Agora é oficial: você faz parte do time de TI.' },
  'oculos-redondos': { id: 'oculos-redondos', slot: 'eyes', name: 'Óculos redondos', description: 'Para enxergar o que o nslookup está dizendo.' },
  bone: { id: 'bone', slot: 'head', name: 'Boné do suporte', description: 'Uniforme oficial de quem anda de mesa em mesa resolvendo chamados.' },
  gravata: { id: 'gravata', slot: 'neck', name: 'Gravata', description: 'Para apresentar o plano de endereçamento à gerência.' },
  bigode: { id: 'bigode', slot: 'face', name: 'Bigode', description: 'Todo analista de redes respeitável tem um (ou pelo menos um falso).' },
  boina: { id: 'boina', slot: 'head', name: 'Boina', description: 'Estilo de quem conhece o caminho de cada pacote, da camada 1 à 7.' },
  moletom: { id: 'moletom', slot: 'outfit', name: 'Moletom de capuz', description: 'O traje clássico de quem passa a madrugada no SOC.' },
  'oculos-escuros': { id: 'oculos-escuros', slot: 'eyes', name: 'Óculos escuros', description: 'Atacantes não conseguem ver para onde você está olhando.' },
  colar: { id: 'colar', slot: 'neck', name: 'Colar de cadeado', description: 'Lembrete diário: o que é bom fica trancado.' },
  jaqueta: { id: 'jaqueta', slot: 'outfit', name: 'Jaqueta de nuvem', description: 'Leve, escalável e com bolsos privados.' },
  chapeu: { id: 'chapeu', slot: 'head', name: 'Chapéu', description: 'Para quem salvou o deploy de sexta à tarde.' },
  'bigode-imperial': { id: 'bigode-imperial', slot: 'face', name: 'Bigode imperial', description: 'Status 200 OK de elegância.' },
  capacete: { id: 'capacete', slot: 'head', name: 'Capacete de obra', description: 'Equipamento obrigatório para entrar na sala de telecom.' },
  cachecol: { id: 'cachecol', slot: 'neck', name: 'Cachecol', description: 'Faz frio no data center — e dentro de um túnel VPN.' },
  terno: { id: 'terno', slot: 'outfit', name: 'Terno de especialista', description: 'Para a reunião em que você ensina o método ao time inteiro.' },
  coroa: { id: 'coroa', slot: 'head', name: 'Coroa', description: 'Só para quem fez 3 estrelas em todas as 15 fases.' },
};

// ---------------------------------------------------------------------------
// Badges

/** Ícones disponíveis para os badges (o componente converte em ícones do lucide). */
export type BadgeIcon =
  | 'wifi-off'
  | 'globe'
  | 'printer'
  | 'binary'
  | 'layers'
  | 'route'
  | 'flame'
  | 'scan-search'
  | 'siren'
  | 'cloudy'
  | 'rocket'
  | 'activity'
  | 'radar'
  | 'waypoints'
  | 'medal'
  | 'award'
  | 'crown';

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: BadgeIcon;
  tier: 'fase' | 'promocao' | 'lenda';
  /** Área a que o badge pertence (define a cor). */
  area?: AreaId;
};

type LevelReward = { badge: Omit<Badge, 'id' | 'tier' | 'area'>; gear: GearId };

/** Recompensa de cada fase, pela ordem do jogo. */
export const LEVEL_REWARDS: Record<string, LevelReward> = {
  'sem-internet-rh': {
    badge: { name: 'Primeiro chamado', description: 'Encontrou um endereço APIPA e descobriu que o DHCP não respondeu.', icon: 'wifi-off' },
    gear: 'cracha',
  },
  'site-nao-abre': {
    badge: { name: 'Detetive do DNS', description: 'Percebeu que o IP funcionava e o nome não: era o DNS.', icon: 'globe' },
    gear: 'oculos-redondos',
  },
  'ip-impressora': {
    badge: { name: 'Zero conflito', description: 'Deu um IP fixo à impressora sem bater com o DHCP nem com outro equipamento.', icon: 'printer' },
    gear: 'bone',
  },
  'subnetting-filial': {
    badge: { name: 'Mestre das sub-redes', description: 'Dividiu um /24 em quatro /26 sem desperdiçar nenhum bloco.', icon: 'binary' },
    gear: 'gravata',
  },
  'vlans-switch': {
    badge: { name: 'Arquiteto de VLANs', description: 'Isolou visitantes, financeiro e TI no mesmo switch.', icon: 'layers' },
    gear: 'bigode',
  },
  'caminho-do-acesso': {
    badge: { name: 'Guia do pacote', description: 'Colocou DHCP, ARP, DNS, TCP, TLS e HTTP na ordem certa.', icon: 'route' },
    gear: 'boina',
  },
  'firewall-servidor-web': {
    badge: { name: 'Guardião do firewall', description: 'Abriu só o necessário, para quem precisava.', icon: 'flame' },
    gear: 'moletom',
  },
  'forca-bruta-ssh': {
    badge: { name: 'Caçador de intrusos', description: 'Seguiu o rastro do atacante no auth.log até a escalada para root.', icon: 'scan-search' },
    gear: 'oculos-escuros',
  },
  'porta-suspeita': {
    badge: { name: 'Contenção rápida', description: 'Isolou a estação infectada sem destruir as evidências.', icon: 'siren' },
    gear: 'colar',
  },
  'subredes-nuvem': {
    badge: { name: 'Arquiteto de nuvem', description: 'Deixou na sub-rede pública só o que a internet precisa alcançar.', icon: 'cloudy' },
    gear: 'jaqueta',
  },
  'deploy-fora-do-ar': {
    badge: { name: 'Salvador do deploy', description: 'Descobriu a aplicação presa em 127.0.0.1 e trouxe o site de volta.', icon: 'rocket' },
    gear: 'chapeu',
  },
  'alertas-http': {
    badge: { name: 'Tradutor de status', description: 'Separou 2xx, 3xx, 4xx e 5xx e acordou só quem precisava.', icon: 'activity' },
    gear: 'bigode-imperial',
  },
  'filial-lenta': {
    badge: { name: 'Rastreador de rotas', description: 'Achou no traceroute o salto exato em que a latência disparava.', icon: 'radar' },
    gear: 'capacete',
  },
  'vpn-filial': {
    badge: { name: 'Construtor de túneis', description: 'Resolveu a sobreposição de redes e subiu a VPN da filial.', icon: 'waypoints' },
    gear: 'cachecol',
  },
  'incidente-final': {
    badge: { name: 'Método de especialista', description: 'Documentou o diagnóstico de baixo para cima, da camada física à aplicação.', icon: 'medal' },
    gear: 'terno',
  },
};

export const LEGEND_BADGE: Badge = {
  id: 'lenda',
  name: 'Lenda da TI',
  description: '3 estrelas em todas as 15 fases. Desbloqueia a coroa.',
  icon: 'crown',
  tier: 'lenda',
};

export const LEGEND_GEAR: GearId = 'coroa';

export function phaseBadge(levelId: string): Badge {
  const level = LEVELS.find((l) => l.id === levelId)!;
  return { id: `fase:${levelId}`, tier: 'fase', area: level.area, ...LEVEL_REWARDS[levelId].badge };
}

export function promotionBadge(areaId: AreaId): Badge {
  const area = AREAS.find((a) => a.id === areaId)!;
  return {
    id: `promocao:${areaId}`,
    tier: 'promocao',
    area: areaId,
    name: area.role,
    description: `Concluiu as 3 fases de ${area.title} e foi promovido(a).`,
    icon: 'award',
  };
}

/** Todos os badges, na ordem em que aparecem na tela. */
export const ALL_BADGES: Badge[] = [
  ...LEVELS.map((l) => phaseBadge(l.id)),
  ...AREAS.map((a) => promotionBadge(a.id)),
  LEGEND_BADGE,
];

// ---------------------------------------------------------------------------
// O que o jogador já conquistou (calculado a partir das fases concluídas)

type Results = Record<string, { stars: number }>;

const isLegend = (results: Results) => LEVELS.every((l) => results[l.id]?.stars === 3);

export function earnedBadgeIds(results: Results): Set<string> {
  const ids = new Set<string>();
  for (const level of LEVELS) if (results[level.id]) ids.add(`fase:${level.id}`);
  for (const area of AREAS) {
    if (LEVELS.filter((l) => l.area === area.id).every((l) => results[l.id])) ids.add(`promocao:${area.id}`);
  }
  if (isLegend(results)) ids.add(LEGEND_BADGE.id);
  return ids;
}

export function unlockedGear(results: Results): Set<GearId> {
  const ids = new Set<GearId>();
  for (const level of LEVELS) if (results[level.id]) ids.add(LEVEL_REWARDS[level.id].gear);
  if (isLegend(results)) ids.add(LEGEND_GEAR);
  return ids;
}

/** Como desbloquear um item, para mostrar no guarda-roupa. */
export function unlockHint(gearId: GearId) {
  if (gearId === LEGEND_GEAR) return '3 estrelas em todas as fases';
  const index = LEVELS.findIndex((l) => LEVEL_REWARDS[l.id].gear === gearId);
  return `Conclua a fase ${index + 1}`;
}

/** Badges e itens novos ao passar de `before` para `after`. */
export function newRewards(before: Results, after: Results) {
  const oldBadges = earnedBadgeIds(before);
  const oldGear = unlockedGear(before);
  return {
    badges: ALL_BADGES.filter((b) => earnedBadgeIds(after).has(b.id) && !oldBadges.has(b.id)),
    gear: Array.from(unlockedGear(after)).filter((id) => !oldGear.has(id)).map((id) => GEAR[id]),
  };
}
