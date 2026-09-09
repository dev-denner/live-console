# Evidências F2

## Estado

- **IMPLEMENTAÇÃO EM PR DRAFT** — o shell Angular standalone foi criado sem substituir as páginas atuais.
- **Superfície V1:** `/v1`.
- **Legado preservado:** `/legacy` continua sendo exclusivamente o console v0 baseado em JSON.
- **Páginas atuais preservadas:** `/`, `/catalogo`, `/lives`, `/blocos` e `/execucao`.

## Implementação

- Frontend Angular standalone em `frontend/`, com TypeScript strict, Signals e roteamento lazy para o shell.
- Contrato mínimo tipado `HealthResponse` consumindo `GET /api/health`.
- Estados explícitos de carregamento, sucesso, erro e retry na tela do shell.
- Backend Fastify mantém a mesma instância local e expõe `/v1` como fronteira separada.
- `npm install` instala também as dependências do frontend via `postinstall`.
- NgRx SignalStore não foi introduzido: nesta fundação ainda não existe estado compartilhado de feature que justifique um store.

## Validações executadas localmente

- `npm run build` — aprovado; build Angular production e backend TypeScript.
- `npm run typecheck` — aprovado.
- `npm run lint` — aprovado.
- `npm test` — aprovado; todos os testes existentes passaram.
- `git diff --check` — aprovado.
- teste de injeção Fastify para `/v1` e `/legacy` — aprovado; a fronteira V1 não cai no catch-all e o legado continua respondendo.
- instalação do frontend com `npm --prefix frontend install --no-package-lock` — aprovada.

## Evidência pendente

A jornada browser desta PR deve ser executada no WSL com `agent-browser`:

1. abrir `http://localhost:8787/v1`;
2. confirmar o shell renderizado e o estado de sucesso da API;
3. interromper ou tornar indisponível a API e confirmar o estado de erro e o retry;
4. abrir `http://localhost:8787/legacy` e repetir a jornada com fixture JSON, sem alteração visual ou funcional do console v0;
5. registrar screenshots/resultado nesta seção.

A PR não deve ser marcada como concluída enquanto essa validação browser não estiver anexada.
