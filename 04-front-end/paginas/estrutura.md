# Páginas principais

| Rota | Página | Tipo |
| --- | --- | --- |
| `/` | Home (landing page) | estática |
| `/dashboard` | Dashboard com progresso real | estática + progresso no navegador |
| `/aprender` | Módulos agrupados por nível | estática |
| `/trilha` | Trilha com os 20 módulos e status de conclusão | estática + progresso no navegador |
| `/aulas/[módulo]` | Aula completa (20 páginas pré-renderizadas) | estática (SSG) |
| `/quizzes` | Quizzes de todos os módulos | estática |
| `/desafios` | Desafios práticos e Desafio Final | estática |
| `/labs` | Lista de laboratórios | estática |
| `/labs/subnetting` | Calculadora de sub-redes | interativa |
| `/labs/packet-journey` | Viagem do pacote passo a passo | interativa |
| `/labs/network-simulator` | Simulador de ping com diagnóstico | interativa |
| `/terminal` | Terminal educacional | interativa |
| `/glossario` | Glossário com busca (aceita `?q=`) | dinâmica |
| `/busca` | Busca global (`?q=`) | dinâmica |
| `/progresso` | Progresso por módulo | estática + progresso no navegador |
| `/perfil` | Perfil, nível e reinício do progresso | estática + progresso no navegador |
| `/api/modules`, `/api/modules/[slug]` | API JSON do conteúdo | API |
| qualquer rota inexistente | Página 404 | — |
