// Personagens do jogo "Carreira em TI": mentores de cada área, colegas que abrem
// chamados e os sistemas automáticos que disparam alertas.

import type { Outfit } from './rewards';

export type HairStyle = 'curto' | 'longo' | 'coque' | 'cacheado' | 'raspado' | 'careca' | 'rabo';
export type Accessory = 'nenhum' | 'oculos' | 'headset' | 'barba' | 'oculos-barba' | 'brincos';

export type AvatarLook = {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  shirt: string;
  background: string;
  accessory: Accessory;
  /** Acessórios conquistados nas fases que o jogador está vestindo. */
  gear?: Outfit;
};

export type CharacterId =
  | 'bia'
  | 'paula'
  | 'helena'
  | 'fernanda'
  | 'jorge'
  | 'maria'
  | 'joao'
  | 'carla'
  | 'ricardo'
  | 'lucas'
  | 'ana'
  | 'diego'
  | 'rafael'
  | 'sonia'
  | 'siem'
  | 'antivirus'
  | 'monitor';

export type Character = {
  id: CharacterId;
  name: string;
  /** Cargo e setor, ex.: "Recursos Humanos". */
  role: string;
  kind: 'mentor' | 'colega' | 'sistema';
  bio: string;
  /** Visual do avatar (pessoas). */
  look?: AvatarLook;
  /** Ícone para os sistemas automáticos. */
  system?: 'siem' | 'antivirus' | 'monitor';
  /** Frases do mentor quando o jogador erra (usadas em rodízio). */
  onMistake?: string[];
};

const SKIN = { clara: '#f3d2b8', media: '#d9a47e', morena: '#b07a52', escura: '#7a4f33', negra: '#5a3825' };

export const CHARACTERS: Record<CharacterId, Character> = {
  // ---------------- Mentores (um por área) ----------------
  bia: {
    id: 'bia',
    name: 'Bia Santos',
    role: 'Líder do Help Desk',
    kind: 'mentor',
    bio: 'Começou como estagiária há 8 anos e hoje lidera o suporte. Acredita que todo chamado se resolve com calma e um bom ipconfig.',
    look: { skin: SKIN.morena, hair: '#2b1a12', hairStyle: 'cacheado', shirt: '#0ea5e9', background: '#164e63', accessory: 'headset' },
    onMistake: [
      'Calma, respira. Volta um passo e olha de novo o que o computador está te dizendo.',
      'Errar faz parte — eu já reiniciei o servidor errado no meu primeiro mês. Tenta outra vez.',
      'Pensa como o usuário: o que mudou desde ontem? A resposta costuma estar aí.',
    ],
  },
  paula: {
    id: 'paula',
    name: 'Paula Ribeiro',
    role: 'Coordenadora de Redes',
    kind: 'mentor',
    bio: 'Desenha a rede da empresa no quadro branco antes de tocar em qualquer switch. Tem uma planilha de endereços IP para tudo.',
    look: { skin: SKIN.clara, hair: '#7c2d12', hairStyle: 'coque', shirt: '#6366f1', background: '#1e1b4b', accessory: 'oculos' },
    onMistake: [
      'Faz a conta no papel: quantos endereços cabem em cada bloco?',
      'Rede boa é rede organizada. Confere de novo onde cada coisa deve morar.',
      'Quase! Desenha o caminho do pacote — onde ele passa primeiro?',
    ],
  },
  helena: {
    id: 'helena',
    name: 'Helena Kato',
    role: 'Líder do SOC',
    kind: 'mentor',
    bio: 'Já respondeu a incidentes em bancos e hospitais. Seu lema: "na dúvida, contenha — e nunca apague a evidência".',
    look: { skin: SKIN.clara, hair: '#111827', hairStyle: 'raspado', shirt: '#e11d48', background: '#4c0519', accessory: 'brincos' },
    onMistake: [
      'Atacante adora quem tem pressa. Leia cada linha com desconfiança.',
      'Pergunte-se: isso é necessário? Se não for, é superfície de ataque.',
      'Não foi dessa vez. Pense no que um invasor faria com essa brecha.',
    ],
  },
  fernanda: {
    id: 'fernanda',
    name: 'Fernanda Lima',
    role: 'Tech Lead de Cloud',
    kind: 'mentor',
    bio: 'Coloca aplicações no ar desde a época em que servidor ficava embaixo da mesa. Automatiza tudo o que precisa fazer duas vezes.',
    look: { skin: SKIN.negra, hair: '#1c1917', hairStyle: 'longo', shirt: '#a855f7', background: '#3b0764', accessory: 'nenhum' },
    onMistake: [
      'Na nuvem, o que não precisa ser público fica privado. Revisa isso.',
      'Olha os números com carinho: porta, endereço, código de status. Algum não bate.',
      'Sem pânico — rollback existe. Tenta de novo com outra hipótese.',
    ],
  },
  jorge: {
    id: 'jorge',
    name: 'Jorge Batista',
    role: 'Engenheiro Sênior do NOC',
    kind: 'mentor',
    bio: 'São 25 anos de telecom, do modem discado à fibra. Conhece de cabeça o telefone de todas as operadoras.',
    look: { skin: SKIN.escura, hair: '#d4d4d8', hairStyle: 'curto', shirt: '#10b981', background: '#064e3b', accessory: 'oculos-barba' },
    onMistake: [
      'Devagar, garoto(a). Testa salto por salto e vê onde a coisa piora.',
      'Já vi muito link cair por detalhe. Confere de novo os endereços dos dois lados.',
      'De baixo para cima, sempre. Começa pelo que não depende de nada.',
    ],
  },

  // ---------------- Colegas que abrem chamados ----------------
  maria: {
    id: 'maria',
    name: 'Maria Oliveira',
    role: 'Recursos Humanos',
    kind: 'colega',
    bio: 'Cuida da folha de ponto de 300 pessoas. Quando o sistema cai, o telefone dela não para.',
    look: { skin: SKIN.media, hair: '#3f2a1d', hairStyle: 'longo', shirt: '#f472b6', background: '#500724', accessory: 'oculos' },
  },
  joao: {
    id: 'joao',
    name: 'João Pereira',
    role: 'Vendas',
    kind: 'colega',
    bio: 'Vive entre reuniões com clientes. Se o notebook trava antes de uma apresentação, ele liga na hora.',
    look: { skin: SKIN.clara, hair: '#a16207', hairStyle: 'curto', shirt: '#f59e0b', background: '#451a03', accessory: 'nenhum' },
  },
  carla: {
    id: 'carla',
    name: 'Carla Mendes',
    role: 'Administrativo',
    kind: 'colega',
    bio: 'Compra tudo que a empresa usa, de cadeira a impressora. Sempre avisa a TI… depois que o equipamento chega.',
    look: { skin: SKIN.escura, hair: '#0c0a09', hairStyle: 'rabo', shirt: '#84cc16', background: '#1a2e05', accessory: 'brincos' },
  },
  ricardo: {
    id: 'ricardo',
    name: 'Ricardo Almeida',
    role: 'Gerente de Infraestrutura',
    kind: 'colega',
    bio: 'Responde pela rede da matriz e das filiais. Exigente, mas é o primeiro a elogiar um trabalho bem documentado.',
    look: { skin: SKIN.media, hair: '#57534e', hairStyle: 'careca', shirt: '#334155', background: '#0f172a', accessory: 'barba' },
  },
  lucas: {
    id: 'lucas',
    name: 'Lucas Ferreira',
    role: 'Desenvolvimento',
    kind: 'colega',
    bio: 'Desenvolvedor full stack. Escreve código rápido e às vezes esquece que servidor também precisa de segurança.',
    look: { skin: SKIN.clara, hair: '#1f2937', hairStyle: 'cacheado', shirt: '#22c55e', background: '#052e16', accessory: 'oculos' },
  },
  ana: {
    id: 'ana',
    name: 'Ana Costa',
    role: 'Marketing',
    kind: 'colega',
    bio: 'Abre dezenas de e-mails de fornecedores por dia. Foi ela quem recebeu aquele "PDF de notas fiscais"…',
    look: { skin: SKIN.morena, hair: '#7c2d12', hairStyle: 'longo', shirt: '#fb7185', background: '#4c0519', accessory: 'nenhum' },
  },
  diego: {
    id: 'diego',
    name: 'Diego Rocha',
    role: 'Plantão de DevOps',
    kind: 'colega',
    bio: 'Está de plantão esta semana. Toma o terceiro café do dia e quer saber quem deve ser acordado para cada alerta.',
    look: { skin: SKIN.negra, hair: '#0c0a09', hairStyle: 'raspado', shirt: '#38bdf8', background: '#082f49', accessory: 'headset' },
  },
  rafael: {
    id: 'rafael',
    name: 'Rafael Schmitt',
    role: 'Gerente da Filial Blumenau',
    kind: 'colega',
    bio: 'Comanda 40 pessoas na filial. Quando o ERP fica lento, as vendas param — e ele liga direto para o NOC.',
    look: { skin: SKIN.clara, hair: '#ca8a04', hairStyle: 'curto', shirt: '#14b8a6', background: '#042f2e', accessory: 'barba' },
  },
  sonia: {
    id: 'sonia',
    name: 'Sônia Prado',
    role: 'Diretora de TI',
    kind: 'colega',
    bio: 'Acompanhou sua carreira desde o primeiro chamado. Decide as promoções e valoriza quem ensina o que aprendeu.',
    look: { skin: SKIN.media, hair: '#e5e7eb', hairStyle: 'curto', shirt: '#eab308', background: '#422006', accessory: 'oculos' },
  },

  // ---------------- Sistemas automáticos ----------------
  siem: {
    id: 'siem',
    name: 'SIEM',
    role: 'Correlação de eventos de segurança',
    kind: 'sistema',
    bio: 'Lê os logs de todos os servidores e dispara um alerta quando algo foge do padrão.',
    system: 'siem',
  },
  antivirus: {
    id: 'antivirus',
    name: 'Antivírus corporativo',
    role: 'Proteção das estações',
    kind: 'sistema',
    bio: 'Vigia os processos de cada computador e avisa o SOC quando algo se comporta de forma estranha.',
    system: 'antivirus',
  },
  monitor: {
    id: 'monitor',
    name: 'Monitoramento',
    role: 'Health checks e métricas',
    kind: 'sistema',
    bio: 'Testa os serviços a cada poucos segundos e avisa quando alguém para de responder.',
    system: 'monitor',
  },
};

export function character(id: CharacterId) {
  return CHARACTERS[id];
}

export function firstName(c: Character) {
  return c.name.split(' ')[0];
}

// ---------------------------------------------------------------------------
// Personagem do jogador

export type PlayerProfile = { name: string; look: AvatarLook };

export const PLAYER_SKINS = Object.values(SKIN);
export const PLAYER_HAIR_COLORS = ['#0c0a09', '#3f2a1d', '#7c2d12', '#a16207', '#ca8a04', '#d4d4d8', '#2563eb', '#db2777'];
export const PLAYER_HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'curto', label: 'Curto' },
  { id: 'longo', label: 'Longo' },
  { id: 'coque', label: 'Coque' },
  { id: 'cacheado', label: 'Cacheado' },
  { id: 'rabo', label: 'Rabo de cavalo' },
  { id: 'raspado', label: 'Raspado' },
  { id: 'careca', label: 'Careca' },
];
export const PLAYER_ACCESSORIES: { id: Accessory; label: string }[] = [
  { id: 'nenhum', label: 'Nenhum' },
  { id: 'oculos', label: 'Óculos' },
  { id: 'headset', label: 'Headset' },
  { id: 'barba', label: 'Barba' },
  { id: 'oculos-barba', label: 'Óculos e barba' },
  { id: 'brincos', label: 'Brincos' },
];
export const PLAYER_SHIRTS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#64748b', '#f8fafc'];

export const DEFAULT_PLAYER_LOOK: AvatarLook = {
  skin: SKIN.media,
  hair: '#3f2a1d',
  hairStyle: 'curto',
  shirt: '#06b6d4',
  background: '#0f172a',
  accessory: 'nenhum',
};

/** Troca {nome} pelo nome do jogador nas falas. */
export function say(text: string, playerName?: string) {
  return text.split("{nome}").join(playerName?.trim() || "estagiário(a)");
}
