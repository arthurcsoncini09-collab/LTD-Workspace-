import type { PoolClient, QueryResultRow } from 'pg';
import { query, transaction } from './postgres';
import { EMPTY_PROGRESS, STUDY_DAYS_LIMIT, type ProgressAction, type ProgressState } from './progress-types';

// Progresso do aluno no Postgres: módulos concluídos, melhor nota de cada quiz,
// último módulo visitado e dias de estudo (para a sequência).

const SLUG = /^[a-z0-9-]{1,80}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_ITEMS = 200;

type Run = <T extends QueryResultRow>(text: string, params: unknown[]) => Promise<T[]>;

/** Lê o progresso; dentro de uma transação, usa a mesma conexão (uma conexão por requisição). */
export async function getProgress(userId: string, client?: PoolClient): Promise<ProgressState> {
  const run: Run = client ? async (text, params) => (await client.query(text, params)).rows : query;

  const completed = await run<{ module_slug: string }>(
    'SELECT module_slug FROM module_completions WHERE user_id = $1 ORDER BY completed_at',
    [userId],
  );
  const scores = await run<{ module_slug: string; correct: number; total: number; taken_at: Date }>(
    'SELECT module_slug, correct, total, taken_at FROM quiz_scores WHERE user_id = $1',
    [userId],
  );
  const days = await run<{ day: string }>(
    `SELECT to_char(day, 'YYYY-MM-DD') AS day FROM study_days WHERE user_id = $1 ORDER BY day DESC LIMIT ${STUDY_DAYS_LIMIT}`,
    [userId],
  );
  const state = await run<{ last_visited: string | null }>('SELECT last_visited FROM user_state WHERE user_id = $1', [userId]);

  return {
    completed: completed.map((row) => row.module_slug),
    quizScores: Object.fromEntries(
      scores.map((row) => [row.module_slug, { correct: row.correct, total: row.total, at: new Date(row.taken_at).toISOString() }]),
    ),
    lastVisited: state[0]?.last_visited ?? null,
    studyDays: days.map((row) => row.day).reverse(),
  };
}

export async function applyProgressAction(userId: string, action: ProgressAction): Promise<ProgressState> {
  return transaction(async (client) => {
    switch (action.type) {
      case 'complete':
        if (action.done) {
          await client.query(
            'INSERT INTO module_completions (user_id, module_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, action.slug],
          );
        } else {
          await client.query('DELETE FROM module_completions WHERE user_id = $1 AND module_slug = $2', [userId, action.slug]);
        }
        await addStudyDay(client, userId, action.day);
        break;
      case 'quiz':
        await saveBestScore(client, userId, action.slug, action.correct, action.total, new Date());
        await addStudyDay(client, userId, action.day);
        break;
      case 'visit':
        await setLastVisited(client, userId, action.slug, true);
        await addStudyDay(client, userId, action.day);
        break;
      case 'reset':
        await client.query('DELETE FROM module_completions WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM quiz_scores WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM study_days WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM user_state WHERE user_id = $1', [userId]);
        await addStudyDay(client, userId, action.day);
        break;
      case 'merge': {
        const { state } = action;
        for (const slug of state.completed) {
          await client.query(
            'INSERT INTO module_completions (user_id, module_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, slug],
          );
        }
        for (const [slug, score] of Object.entries(state.quizScores)) {
          await saveBestScore(client, userId, slug, score.correct, score.total, new Date(score.at));
        }
        for (const day of state.studyDays) await addStudyDay(client, userId, day);
        // Não sobrescreve o último módulo visitado já salvo na conta.
        if (state.lastVisited) await setLastVisited(client, userId, state.lastVisited, false);
        break;
      }
    }
    return getProgress(userId, client);
  });
}

async function addStudyDay(client: PoolClient, userId: string, day: string) {
  await client.query('INSERT INTO study_days (user_id, day) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, day]);
}

/** Guarda a nota só se for melhor que a anterior (mesma regra do navegador). */
async function saveBestScore(client: PoolClient, userId: string, slug: string, correct: number, total: number, at: Date) {
  await client.query(
    `INSERT INTO quiz_scores (user_id, module_slug, correct, total, taken_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, module_slug) DO UPDATE
       SET correct = EXCLUDED.correct, total = EXCLUDED.total, taken_at = EXCLUDED.taken_at
       WHERE EXCLUDED.correct::float / EXCLUDED.total >= quiz_scores.correct::float / quiz_scores.total`,
    [userId, slug, correct, total, Number.isNaN(at.getTime()) ? new Date() : at],
  );
}

async function setLastVisited(client: PoolClient, userId: string, slug: string, overwrite: boolean) {
  await client.query(
    `INSERT INTO user_state (user_id, last_visited) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET last_visited = EXCLUDED.last_visited, updated_at = now()
     ${overwrite ? '' : 'WHERE user_state.last_visited IS NULL'}`,
    [userId, slug],
  );
}

// ---------------------------------------------------------------------------
// Validação do que chega do navegador: nada é gravado sem passar por aqui.

const isSlug = (value: unknown): value is string => typeof value === 'string' && SLUG.test(value);
const isDay = (value: unknown): value is string => typeof value === 'string' && DAY.test(value) && !Number.isNaN(Date.parse(value));
const isScore = (correct: unknown, total: unknown): boolean =>
  Number.isInteger(correct) && Number.isInteger(total) && (total as number) > 0 && (total as number) <= 1000 && (correct as number) >= 0 && (correct as number) <= (total as number);

function parseState(value: unknown): ProgressState | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<Record<keyof ProgressState, unknown>>;
  const completed = Array.isArray(raw.completed) ? raw.completed.filter(isSlug).slice(0, MAX_ITEMS) : [];
  const studyDays = Array.isArray(raw.studyDays) ? raw.studyDays.filter(isDay).slice(-STUDY_DAYS_LIMIT) : [];
  const quizScores: ProgressState['quizScores'] = {};
  if (raw.quizScores && typeof raw.quizScores === 'object') {
    for (const [slug, score] of Object.entries(raw.quizScores as Record<string, unknown>).slice(0, MAX_ITEMS)) {
      const s = score as { correct?: unknown; total?: unknown; at?: unknown } | null;
      if (isSlug(slug) && s && isScore(s.correct, s.total)) {
        quizScores[slug] = { correct: s.correct as number, total: s.total as number, at: typeof s.at === 'string' ? s.at : new Date().toISOString() };
      }
    }
  }
  return { ...EMPTY_PROGRESS, completed, quizScores, studyDays, lastVisited: isSlug(raw.lastVisited) ? raw.lastVisited : null };
}

export function parseProgressAction(body: unknown): ProgressAction | null {
  if (!body || typeof body !== 'object') return null;
  const a = body as Record<string, unknown>;
  switch (a.type) {
    case 'complete':
      return isSlug(a.slug) && typeof a.done === 'boolean' && isDay(a.day) ? { type: 'complete', slug: a.slug, done: a.done, day: a.day } : null;
    case 'quiz':
      return isSlug(a.slug) && isScore(a.correct, a.total) && isDay(a.day)
        ? { type: 'quiz', slug: a.slug, correct: a.correct as number, total: a.total as number, day: a.day }
        : null;
    case 'visit':
      return isSlug(a.slug) && isDay(a.day) ? { type: 'visit', slug: a.slug, day: a.day } : null;
    case 'reset':
      return isDay(a.day) ? { type: 'reset', day: a.day } : null;
    case 'merge': {
      const state = parseState(a.state);
      return state ? { type: 'merge', state } : null;
    }
    default:
      return null;
  }
}
