# Evidências F1

## Estado e escopo

- **VERIFICADO** — branch `feat/foundation-f1-legacy-isolation`, commits `177fa8f`, `7a41c42` e correção atual, PR draft [#25](https://github.com/dev-denner/live-console/pull/25).

- **VERIFICADO** — branch de trabalho criada a partir de `origin/master` após fast-forward; `.mcp.json` continua não rastreado.
- **VERIFICADO** — alteração de produção limitada a `server.ts`, `package.json` e asset histórico `legacy/index.html`; sem migration/schema e sem alteração de dados locais.
- **VERIFICADO** — `server.ts` usa Fastify, serve HTML compilado de `dist` e mantém APIs em `/api/*`.

## Validações automatizadas

- **VERIFICADO** — `npm install`, `npm run build`, migration em SQLite temporário, `npm run typecheck`, `npm run lint`, `npm test` (17 testes aprovados) e `git diff --check` passaram.

## Smoke HTTP

- **VERIFICADO** — smoke compilado em SQLite temporário: 200 para `/api/health`, `/`, `/catalogo`, `/lives`, `/blocos`, `/execucao` e `/legacy`; `/legacy/catalogo`, `/legacy/lives`, `/legacy/blocos` e `/legacy/execucao` retornam 404.

## Jornadas browser

- **BLOQUEADO** — a ferramenta `agent-browser` não está instalada nesta sessão (`command not found`). Não foi possível abrir, clicar, recarregar ou capturar console do navegador. A jornada deve abrir diretamente `/legacy`; não há validação visual disponível.
- **NÃO VERIFICADO** — jornada visual do console JSON, seleção de arquivo, reprodução, letra e erro de JSON no browser.

## Limitações e decisão

O mount é reversível e preserva os contratos, mas a aceitação integral da F1 depende de repetir as jornadas com navegador disponível. Recomenda-se não marcar a etapa como concluída até essa execução; F2 deve manter `/legacy` como superfície de compatibilidade.
