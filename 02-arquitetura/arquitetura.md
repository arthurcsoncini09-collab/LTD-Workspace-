# Arquitetura do Projeto

## Visão geral
A plataforma usa Next.js (App Router). O conteúdo pedagógico é escrito em TypeScript em
`lib/content`, carregado num banco SQLite e lido pelas páginas no servidor. O progresso do aluno fica no navegador
e, quando ele entra na conta, é salvo num banco Postgres (Neon).

## Camadas
| Camada | Onde | Responsabilidade |
| --- | --- | --- |
| Conteúdo | `lib/content/modules/*.ts`, `lib/content/glossary.ts` | Fonte única dos 20 módulos, quizzes e glossário |
| Dados | `lib/netlearn-db.ts` | Cria e popula o SQLite, consultas e busca |
| Lógica dos labs | `lib/subnet.ts`, `lib/network-sim.ts` | Cálculo de sub-redes e simulação de ping |
| Páginas | `app/` | Rotas; aulas pré-renderizadas no build |
| Componentes | `components/` | Layout, quiz, cartões de seção, visões de progresso |
| Progresso | `components/progress-store.ts` | Módulos concluídos, notas e sequência no `localStorage`, sincronizados com a API quando há login |
| Contas | `lib/auth.ts`, `app/api/auth/*`, `app/entrar` | Cadastro, login, sessão por cookie |
| Dados do aluno | `lib/postgres.ts`, `lib/progress-db.ts`, `app/api/progress` | Postgres (Neon): contas, sessões e progresso |
| Documentação gerada | `03-conteudo/`, `05-scripts-e-dados/seed-data/` | Markdown e JSON gerados por `npm run docs:conteudo` |

## Banco de dados
- Arquivo `db/netlearn.db` (ou `/tmp/netlearn/netlearn.db` na Vercel), gerado automaticamente e fora do git.
- Seed versionado: `CONTENT_VERSION` (em `lib/content/index.ts`) é comparado com `PRAGMA user_version`.
  Se forem diferentes, as tabelas são recriadas a partir de `lib/content`.
- O seed roda numa transação `IMMEDIATE`, para que os vários processos do `next build` não colidam.
- Tabelas: `modules` (com `details` em JSON), `lessons`, `quiz_questions`, `glossary`.

## Banco de dados dos alunos (Postgres / Neon)
- Ativado pela variável `DATABASE_URL` (criada pela integração Neon da Vercel). Sem ela, o login fica
  indisponível e o site segue salvando o progresso só no navegador.
- Tabelas: `users`, `sessions`, `module_completions`, `quiz_scores`, `study_days`, `user_state`
  (schema em `05-scripts-e-dados/banco/schema-postgres.sql`). São criadas na primeira requisição.
- Senhas guardadas com scrypt + sal; o cookie de sessão é `httpOnly` e no banco fica só o hash do token.
- API: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`,
  `GET /api/progress` e `POST /api/progress` (ações `complete`, `quiz`, `visit`, `reset`, `merge`).
- Sincronização: a tela atualiza na hora; o servidor devolve o estado oficial. O progresso feito antes
  de entrar (ou que falhou por rede) é enviado com a ação `merge`, que soma sem apagar nada.

## Como atualizar o conteúdo
1. Edite o módulo em `lib/content/modules/`.
2. Incremente `CONTENT_VERSION` em `lib/content/index.ts`.
3. Rode `npm run docs:conteudo` para atualizar a documentação em `03-conteudo/`.
4. Rode `npm run build` para validar.

## Fluxo
1. Usuário acessa a landing page
2. Navega pelos módulos e aulas
3. Faz os quizzes e marca os módulos como concluídos
4. Pratica nos laboratórios e desafios
5. Acompanha a evolução no dashboard e conclui o Desafio Final
