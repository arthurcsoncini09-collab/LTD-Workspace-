import type { ProgressState } from './progress-types';

// Regras dos certificados do NetLearn.
// Um módulo rende certificado quando está marcado como concluído E a melhor nota
// do quiz é de pelo menos 70%. Com os 20 certificados, sai o da trilha completa.

export const MIN_SCORE = 0.7;
export const TRAIL_SLUG = 'trilha-completa';
export const TRAIL_TITLE = 'Fundamentos de Redes de Computadores';

export type CertModule = {
  slug: string;
  title: string;
  order_index: number;
  lessonCount: number;
  questionCount: number;
};

export type ModuleCertStatus = {
  slug: string;
  completed: boolean;
  /** Nota em 0–1, ou null se o quiz ainda não foi feito. */
  score: number | null;
  scoreOk: boolean;
  eligible: boolean;
  /** Data de emissão (ISO): a data da melhor nota do quiz. */
  issuedAt: string | null;
};

export function moduleStatus(slug: string, state: ProgressState): ModuleCertStatus {
  const completed = state.completed.includes(slug);
  const quiz = state.quizScores[slug];
  const score = quiz ? quiz.correct / quiz.total : null;
  const scoreOk = score !== null && score >= MIN_SCORE;
  return { slug, completed, score, scoreOk, eligible: completed && scoreOk, issuedAt: completed && scoreOk ? quiz!.at : null };
}

export function trailStatus(modules: CertModule[], state: ProgressState) {
  const statuses = modules.map((m) => moduleStatus(m.slug, state));
  const earned = statuses.filter((s) => s.eligible);
  const eligible = modules.length > 0 && earned.length === modules.length;
  const issuedAt = eligible ? earned.map((s) => s.issuedAt!).sort().at(-1)! : null;
  // Média das melhores notas dos 20 quizzes.
  const average = earned.length ? earned.reduce((sum, s) => sum + (s.score ?? 0), 0) / earned.length : null;
  return { statuses, earnedCount: earned.length, eligible, issuedAt, average };
}

/**
 * Código do certificado, calculado a partir do nome, do módulo e da data.
 * Serve para identificar o documento impresso; não é uma verificação oficial.
 */
export function certificateCode(name: string, slug: string, issuedAt: string) {
  const text = `${name.trim().toLowerCase()}|${slug}|${issuedAt.slice(0, 10)}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < text.length; i += 1) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + c, 0x5bd1e995) >>> 0;
  }
  const part = (n: number) => n.toString(36).toUpperCase().padStart(7, '0').slice(-4);
  return `NL-${part(h1)}-${part(h2)}`;
}

export function formatDateLong(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(new Date(iso));
}

export function formatPercent(score: number) {
  return `${Math.round(score * 100)}%`;
}

/** "Módulo 5 — Subnetting" → "Subnetting" (o número já aparece no certificado). */
export function shortTitle(title: string) {
  return title.replace(/^Módulo \d+\s*—\s*/, '');
}
