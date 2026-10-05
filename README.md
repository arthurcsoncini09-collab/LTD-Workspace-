# NetLearn

Projeto educacional de Fundamentos de Redes de Computadores.

## Estrutura

- 01-documentacao/
  - requisitos.md
  - roadmap.md
- 02-arquitetura/
  - arquitetura.md
  - fluxos.md
- 03-conteudo/
  - modulos/
  - aulas/
  - quizzes/
  - glossario/
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

O banco `db/netlearn.db` é gerado automaticamente na primeira requisição a partir do conteúdo em
`lib/content/` e não é versionado. Sempre que o conteúdo mudar, incremente `CONTENT_VERSION` em
`lib/content/index.ts`: o banco é recriado sozinho na próxima execução.

## Onde fica cada coisa

- `lib/content/modules/` — conteúdo dos 20 módulos (aulas, comandos, laboratório, quiz).
- `lib/content/glossary.ts` — termos do glossário.
- `lib/netlearn-db.ts` — banco SQLite (seed versionado, consultas e busca).
- `lib/subnet.ts` e `lib/network-sim.ts` — lógica da calculadora de sub-redes e do simulador.
- `components/progress-store.ts` — progresso do aluno (módulos concluídos, notas, sequência), salvo no navegador.
