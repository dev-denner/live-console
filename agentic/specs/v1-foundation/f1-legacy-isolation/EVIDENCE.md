# Evidências F1

## Estado e escopo

- **VERIFICADO** — branch `feat/foundation-f1-legacy-isolation`, commit `177fa8f`, PR draft [#25](https://github.com/dev-denner/live-console/pull/25).

- **VERIFICADO** — branch de trabalho criada a partir de `origin/master` após fast-forward; `.mcp.json` continua não rastreado.
- **VERIFICADO** — alteração de produção limitada a `server.ts`; sem migration/schema e sem alteração de dados locais.
- **VERIFICADO** — `server.ts` usa Fastify, serve HTML compilado de `dist` e mantém APIs em `/api/*`.

## Validações automatizadas

- **VERIFICADO** — `npm install`, `npm run build`, migration em SQLite temporário, `npm run typecheck`, `npm run lint`, `npm test` (17 testes aprovados) e `git diff --check` passaram.

## Smoke HTTP

- **VERIFICADO** — smoke compilado em SQLite temporário: 200 para `/api/health`, `/`, `/legacy`, `/legacy/catalogo`, `/legacy/lives`, `/legacy/blocos`, `/legacy/execucao` e `/catalogo-manual.js`.

## Jornadas browser

- **BLOQUEADO** — a ferramenta `agent-browser` não está instalada nesta sessão (`command not found`). Não foi possível abrir, clicar, recarregar ou capturar console do navegador.
- **NÃO VERIFICADO** — jornadas A–E visuais, estados de erro e ausência de falhas de asset/API no browser.

## Limitações e decisão

O mount é reversível e preserva os contratos, mas a aceitação integral da F1 depende de repetir as jornadas com navegador disponível. Recomenda-se não marcar a etapa como concluída até essa execução; F2 deve manter `/legacy` como superfície de compatibilidade.
