import { Pool, type PoolClient, type QueryResultRow } from 'pg';

// Banco Postgres (Neon) para os dados dos alunos: contas, sessões e progresso.
// O conteúdo das aulas continua no SQLite de lib/netlearn-db.ts, gerado a partir de lib/content.
//
// A integração Neon da Vercel cria DATABASE_URL (e POSTGRES_URL) automaticamente.
// Localmente, coloque a URL em .env.local (veja .env.example).

export function databaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
}

/** Sem URL configurada o site continua funcionando, com o progresso só no navegador. */
export function isDatabaseEnabled() {
  return databaseUrl() !== '';
}

export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);

  CREATE TABLE IF NOT EXISTS module_completions (
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_slug  TEXT NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, module_slug)
  );

  CREATE TABLE IF NOT EXISTS quiz_scores (
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_slug TEXT NOT NULL,
    correct     INTEGER NOT NULL CHECK (correct >= 0),
    total       INTEGER NOT NULL CHECK (total > 0 AND correct <= total),
    taken_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, module_slug)
  );

  CREATE TABLE IF NOT EXISTS study_days (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day     DATE NOT NULL,
    PRIMARY KEY (user_id, day)
  );

  CREATE TABLE IF NOT EXISTS user_state (
    user_id      BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    last_visited TEXT,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

// Reaproveita o pool entre recargas do `next dev` e entre requisições na mesma instância serverless.
const globalForPg = globalThis as unknown as { netlearnPool?: Pool; netlearnSchema?: Promise<void> };

function getPool() {
  if (!isDatabaseEnabled()) throw new Error('DATABASE_URL não configurada');
  if (!globalForPg.netlearnPool) {
    globalForPg.netlearnPool = new Pool({
      connectionString: databaseUrl(),
      max: Number(process.env.DATABASE_POOL_MAX) || 5,
      idleTimeoutMillis: 10_000,
    });
  }
  return globalForPg.netlearnPool;
}

/** Cria as tabelas na primeira consulta de cada instância (CREATE ... IF NOT EXISTS é seguro de repetir). */
function ensureSchema() {
  if (!globalForPg.netlearnSchema) {
    globalForPg.netlearnSchema = getPool()
      .query(SCHEMA_SQL)
      .then(() => undefined)
      .catch((error) => {
        globalForPg.netlearnSchema = undefined;
        throw error;
      });
  }
  return globalForPg.netlearnSchema;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  await ensureSchema();
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

/** Executa várias consultas numa transação; desfaz tudo se alguma falhar. */
export async function transaction<T>(work: (client: PoolClient) => Promise<T>) {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
