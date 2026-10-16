export type SectionTable = {
  headers: string[];
  rows: string[][];
};

export type LessonSection = {
  title: string;
  content?: string;
  example?: string;
  items?: string[];
  steps?: string[];
  code?: string;
  table?: SectionTable;
  /** Exibe a seção recolhida (ex.: dicas e soluções que o aluno abre quando quiser). */
  collapsed?: boolean;
};

export type LessonSeed = {
  slug: string;
  title: string;
  introduction: string;
  why_it_matters: string;
  real_world: string;
  explanation: string;
  exercise: string;
  exercise_answer: string;
  challenge: string;
  keywords: string[];
  sections: LessonSection[];
};

export type QuizSeed = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type CommandExample = {
  title: string;
  platform: 'Windows' | 'Linux' | 'Cisco IOS' | 'Linux/macOS' | 'Multiplataforma';
  code: string;
  note?: string;
};

export type ModuleDetails = {
  objectives: string[];
  keyPoints: string[];
  commands: CommandExample[];
  pitfalls: Array<{ problem: string; solution: string }>;
  security: string[];
  lab: {
    title: string;
    goal: string;
    tools: string;
    steps: string[];
    expected: string;
  };
  references: string[];
};

export type ModuleSeed = {
  slug: string;
  title: string;
  stage: 'Básico' | 'Intermediário' | 'Avançado' | 'Projeto';
  description: string;
  accent: string;
  objective: string;
  summary: string;
  lessons: LessonSeed[];
  quizQuestions: QuizSeed[];
  details: ModuleDetails;
};

export type GlossarySeed = {
  term: string;
  definition: string;
  technical_definition: string;
  example: string;
  related: string;
};
