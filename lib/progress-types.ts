// Tipos do progresso do aluno, compartilhados entre o navegador (components/progress-store.ts)
// e o servidor (lib/progress-db.ts, app/api/progress).

export type QuizScore = { correct: number; total: number; at: string };

export type ProgressState = {
  completed: string[];
  quizScores: Record<string, QuizScore>;
  lastVisited: string | null;
  studyDays: string[];
};

export const EMPTY_PROGRESS: ProgressState = { completed: [], quizScores: {}, lastVisited: null, studyDays: [] };

/** Quantos dias de estudo são guardados (o suficiente para calcular a sequência). */
export const STUDY_DAYS_LIMIT = 60;

/**
 * Ações enviadas ao servidor. Cada uma é idempotente: repetir a mesma ação não muda o resultado,
 * o que permite reenviar com segurança se a rede falhar.
 */
export type ProgressAction =
  | { type: 'complete'; slug: string; done: boolean; day: string }
  | { type: 'quiz'; slug: string; correct: number; total: number; day: string }
  | { type: 'visit'; slug: string; day: string }
  | { type: 'reset'; day: string }
  /** Soma ao banco o progresso feito no navegador antes de entrar (ou enquanto estava offline). */
  | { type: 'merge'; state: ProgressState };

export type AccountUser = { id: string; name: string; email: string };
