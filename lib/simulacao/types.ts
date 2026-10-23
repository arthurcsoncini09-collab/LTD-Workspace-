// Tipos do jogo "Carreira em TI" (aba Simulação).

export type AreaId = 'suporte' | 'redes' | 'seguranca' | 'cloud' | 'noc';

export type Area = {
  id: AreaId;
  title: string;
  /** Cargo conquistado ao concluir as fases da área. */
  role: string;
  /** O que esse profissional faz no dia a dia. */
  dayToDay: string;
  /** Temas do NetLearn mais usados na área. */
  topics: string[];
};

type Ticket = {
  /** Quem abriu o chamado, ex.: "Maria — RH". */
  from: string;
  /** Prioridade mostrada no chamado. */
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  message: string;
};

type BaseLevel = {
  id: string;
  area: AreaId;
  title: string;
  ticket: Ticket;
  /** Informações extras de contexto (documentação da rede etc.). */
  context?: { label: string; value: string }[];
  /** Dica mostrada a pedido do jogador (custa uma estrela). */
  hint: string;
  /** Explicação final, mostrada ao concluir. */
  debrief: string;
  /** Módulo do NetLearn para revisar (slug de /aulas/[slug]). */
  module: { slug: string; title: string };
};

export type DiagnoseLevel = BaseLevel & {
  kind: 'diagnose';
  prompt: string;
  commands: { cmd: string; output: string }[];
  /** Quantos comandos rodar antes de poder responder. */
  minCommands: number;
  question: string;
  options: { text: string; correct?: boolean; feedback: string }[];
};

export type ConfigField = { id: string; label: string; placeholder: string; prefix?: string };

export type ConfigLevel = BaseLevel & {
  kind: 'config';
  instruction: string;
  fields: ConfigField[];
  /** Retorna a lista de problemas encontrados; vazia = configuração correta. */
  validate: (values: Record<string, string>) => string[];
  /** Uma resposta correta, mostrada no fim e usada nos testes. */
  solution: Record<string, string>;
};

export type ClassifyLevel = BaseLevel & {
  kind: 'classify';
  instruction: string;
  buckets: { id: string; label: string; description: string }[];
  items: { id: string; label: string; bucket: string; why: string }[];
};

export type FirewallLevel = BaseLevel & {
  kind: 'firewall';
  instruction: string;
  requirements: string[];
  rules: { id: string; protocol: string; port: string; source: string; service: string; correct: 'allow' | 'deny'; why: string }[];
};

export type LogsLevel = BaseLevel & {
  kind: 'logs';
  instruction: string;
  file: string;
  lines: { id: string; text: string; suspicious: boolean; why: string }[];
};

export type SequenceLevel = BaseLevel & {
  kind: 'sequence';
  instruction: string;
  /** Etapas na ordem correta (a tela embaralha). */
  steps: { id: string; text: string }[];
};

export type Level = DiagnoseLevel | ConfigLevel | ClassifyLevel | FirewallLevel | LogsLevel | SequenceLevel;

export const KIND_LABEL: Record<Level['kind'], string> = {
  diagnose: 'Diagnóstico',
  config: 'Configuração',
  classify: 'Organização',
  firewall: 'Firewall',
  logs: 'Análise de logs',
  sequence: 'Sequência',
};
