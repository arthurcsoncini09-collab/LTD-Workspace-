-- Tabelas de contas e progresso do NetLearn (Postgres / Neon).
-- Gerado a partir de SCHEMA_SQL em lib/postgres.ts; o site aplica este schema sozinho.
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
