# Requisitos do Projeto

## Objetivo
Criar uma plataforma de aprendizado interativa e gratuita para redes de computadores.

## Funcionalidades
| Funcionalidade | Status | Onde |
| --- | --- | --- |
| Landing page profissional | ✅ | `/` |
| Dashboard do aluno com progresso real | ✅ | `/dashboard` |
| Trilha de aprendizado (20 módulos) | ✅ | `/trilha`, `/aprender` |
| Aulas por módulo com exercícios, comandos e laboratório | ✅ | `/aulas/[módulo]` |
| Quizzes interativos com nota salva | ✅ | fim de cada aula e `/quizzes` |
| Desafios práticos e projeto final | ✅ | `/desafios`, `/aulas/desafio-final` |
| Laboratórios interativos | ✅ | `/labs` |
| Glossário técnico com busca | ✅ | `/glossario` |
| Busca global (módulos, aulas, glossário, labs) | ✅ | `/busca` |
| Interface moderna e responsiva | ✅ | todas as páginas |
| Contas de usuário | ⏳ | futuro — hoje o progresso fica no navegador |

## Público-alvo
- Iniciantes em TI
- Estudantes de redes (base para CCNA e Network+)
- Pessoas interessadas em infraestrutura e suporte

## Tecnologias
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- SQLite (better-sqlite3)
