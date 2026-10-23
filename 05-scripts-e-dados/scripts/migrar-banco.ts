// Cria as tabelas de contas e progresso no Postgres (Neon).
// Uso: npm run db:migrate   (lê DATABASE_URL do ambiente ou de .env.local)
//
// Não é obrigatório: o site cria as tabelas sozinho na primeira requisição.
// Serve para preparar o banco antes do deploy ou conferir se a conexão funciona.

import { existsSync, readFileSync } from 'node:fs';
import { Client } from 'pg';
import { SCHEMA_SQL, databaseUrl } from '../../lib/postgres';

for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?(.*?)"?\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
  }
}

async function main() {
  const url = databaseUrl();
  if (!url) {
    console.error('DATABASE_URL não definida. Crie .env.local a partir de .env.example.');
    process.exit(1);
  }
  const client = new Client({ connectionString: url });
  await client.connect();
  await client.query(SCHEMA_SQL);
  const { rows } = await client.query<{ table_name: string }>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
  );
  await client.end();
  console.log('Banco pronto. Tabelas:', rows.map((r) => r.table_name).join(', '));
}

main().catch((error) => {
  console.error('Falha na migração:', error.message);
  process.exit(1);
});
