# Evidências F0

## Classificação

- `VERIFICADO`: checkout `master`, HEAD `c5b2a74`, árvore sem alterações rastreadas; `.mcp.json` permanece não rastreado.
- `VERIFICADO`: `npm install`, `npm run build`, `npm run db:migrate`, `npm run typecheck`, `npm run lint`, `npm test` e `git diff --check` executados; a suíte existente passou (16 testes na última execução registrada).
- `VERIFICADO`: smoke SQLite temporário: `/api/health` 200, `/` 200, `/catalogo` 200, `/lives` 200, `/blocos` 200.
- `VERIFICADO`: endpoints e páginas foram identificados no `server.ts`; migrations `001`–`005`, executor, schemas e repositórios foram inspecionados.
- `VERIFICADO`: arquivos locais/ignorados incluem SQLite, `storage`, mídia, letras, repertórios, `dist` e `node_modules`.
- `BLOQUEADO`: jornadas clicáveis no navegador; `agent-browser` não está instalado e nenhum navegador conectado foi disponibilizado.
- `NÃO VERIFICADO`: persistência/reload via interação visual, montagem automática pela tela, execução operacional pela tela, mensagens visuais e screenshots.
- `VERIFICADO`: fontes canônicas atualizadas foram lidas integralmente: regras v1, skills AIDD/domain, contexto atual, README da foundation, ADR proposta, pesquisa de skills e `agentic/specs/live-console-v0.1/`.
- `NÃO VERIFICADO`: o caminho histórico literal `agentic/specs/v0.1/` não existe; o material equivalente está em `agentic/specs/live-console-v0.1/`.

## Jornadas observáveis

| Jornada | Esperado | Observado |
|---|---|---|
| A — raiz | console e links | HTTP 200; clique não verificado |
| B — catálogo | pesquisa, filtros, formulário | HTTP 200 e HTML; interação bloqueada |
| C — live manual | criar/selecionar/ordenar | APIs presentes; browser bloqueado |
| D — montagem | prévia/confirmação explicável | APIs presentes; browser bloqueado |
| E — execução | iniciar/tocar/pular/encerrar | APIs presentes; browser bloqueado |

## Recomendação F1

Adotar diretório/mount explícito `/legacy`, primeiro com cópia de assets e contrato de base URL, mantendo APIs e banco intocados. Resolver a capacidade de browser automation antes de declarar jornadas visuais verificadas.
