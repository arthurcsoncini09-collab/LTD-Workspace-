# NetLearn

Projeto educacional de Fundamentos de Redes de Computadores.

## Estrutura

- 01-documentacao/
  - requisitos.md
  - roadmap.md
- 02-arquitetura/
  - arquitetura.md
  - fluxos.md
- 03-conteudo/ (gerado com `npm run docs:conteudo`)
  - modulos/ — um documento por módulo
  - aulas/ — índice das 43 aulas
  - quizzes/ — gabarito de cada quiz
  - glossario/ — 58 termos
- 04-front-end/
  - componentes/
  - paginas/
  - estilos/
- 05-scripts-e-dados/
  - seed-data/
  - scripts/
  - banco/

## Objetivo

Organizar o projeto para facilitar manutenção, expansão didática, palestras, documentação e evolução do produto.

## Como rodar

```bash
npm install
npm run dev            # http://localhost:3000
npx next dev -p 3001   # ou em outra porta, ex.: http://localhost:3001
npm run build && npm start   # produção
```

### Contas e progresso na nuvem (opcional)

Sem configuração extra o site funciona e o progresso fica só no navegador. Para ativar login e
salvar o progresso de cada aluno num banco Postgres (Neon):

1. Na Vercel, abra o projeto > **Storage** > **Create Database** > **Neon** e conecte ao projeto.
   Isso cria a variável `DATABASE_URL` automaticamente. Faça um novo deploy.
2. Para rodar localmente, copie `.env.example` para `.env.local` e cole a mesma `DATABASE_URL`
   (no painel da Neon: **Connect**). Opcional: `npm run db:migrate` para criar as tabelas e testar a conexão.

As tabelas são criadas sozinhas na primeira requisição. O schema está em
`05-scripts-e-dados/banco/schema-postgres.sql`.

O banco `db/netlearn.db` é gerado automaticamente na primeira requisição a partir do conteúdo em
`lib/content/` e não é versionado. Sempre que o conteúdo mudar, incremente `CONTENT_VERSION` em
`lib/content/index.ts`: o banco é recriado sozinho na próxima execução.

## Onde fica cada coisa

- `lib/content/modules/` — conteúdo dos 20 módulos (aulas, comandos, laboratório, quiz).
- `03-conteudo/` — o mesmo conteúdo em Markdown (módulos, aulas, quizzes com gabarito, glossário), gerado com `npm run docs:conteudo`.
- `lib/content/glossary.ts` — termos do glossário.
- `lib/netlearn-db.ts` — banco SQLite (seed versionado, consultas e busca).
- `lib/subnet.ts` e `lib/network-sim.ts` — lógica da calculadora de sub-redes e do simulador.
- `components/progress-store.ts` — progresso do aluno (módulos concluídos, notas, sequência): no navegador e, com login, sincronizado com o servidor.
- `lib/postgres.ts` — conexão e schema do Postgres (contas, sessões, progresso).
- `lib/auth.ts` e `app/api/auth/` — cadastro, login e sessão (senha com scrypt, cookie httpOnly).
- `lib/progress-db.ts` e `app/api/progress/` — leitura e gravação do progresso no Postgres.
- `app/entrar/` — página de login e cadastro.
