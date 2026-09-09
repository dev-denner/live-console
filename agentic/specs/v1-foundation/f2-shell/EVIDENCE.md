# Evidências F2

## Estado

- **PR #28:** aberta, draft, branch `feat/foundation-f2-shell`.
- **Resultado da auditoria:** implementação atende à PRD e à especificação técnica observadas; nenhuma correção de produto foi necessária.
- **Escopo preservado:** esta validação não implementa catálogo, lives, blocos, execução ou geração automática de repertório.

## Implementação inspecionada

- Angular standalone em `frontend/`, TypeScript strict, Signals e rota lazy do shell.
- Cliente `HealthService` tipado para `GET /api/health`, com rejeição de payload inválido.
- Estados visuais `loading`, `success`, `error` e retry no shell.
- Fastify entrega `/v1` no mesmo processo, com fallback seguro para `dist/live-console-v1`.
- `/legacy` permanece um mount separado do console v0 baseado em JSON.
- `/legacy/catalogo`, `/legacy/lives`, `/legacy/blocos` e `/legacy/execucao` têm mount explícito 404.
- A árvore `legacy/` não difere do baseline da branch `master`.
- Nenhuma migration, banco, repositório, mídia, repertório pessoal ou regra de negócio foi alterada pela F2.

## Comandos executados

Executados no snapshot exato de `origin/feat/foundation-f2-shell`:

| Comando | Resultado |
| --- | --- |
| `npm install` | **OK**; instalação raiz e `postinstall` do frontend concluídos. O npm reportou 38 vulnerabilidades transitivas e avisos de pacotes deprecated; não foram aplicadas alterações automáticas. |
| `npm run build` | **OK**; Angular production e backend TypeScript compilados. |
| `npm run typecheck` | **OK**; TypeScript raiz e frontend Angular. |
| `npm run lint` | **OK**; script atual delega ao typecheck. |
| `npm test` | **OK**; 18 testes, 0 falhas. |
| `git diff --check` | **OK** na comparação `origin/master...origin/feat/foundation-f2-shell`. |

O servidor foi iniciado com `NO_OPEN=1 npm run dev` em `http://127.0.0.1:8787`.

## Smoke HTTP

| Rota | Status observado |
| --- | ---: |
| `/api/health` | 200 |
| `/` | 200 |
| `/catalogo` | 200 |
| `/lives` | 200 |
| `/blocos` | 200 |
| `/execucao` | 200 |
| `/legacy` | 200 |
| `/legacy/catalogo` | 404 |
| `/legacy/lives` | 404 |
| `/legacy/blocos` | 404 |
| `/legacy/execucao` | 404 |
| `/v1` | 200 |

## Evidência browser com `agent-browser`

Sessão isolada: `f2-shell-audit-20260909`.

- `/v1`: shell Angular renderizado com o título `Foundation pronta para evoluir.`; o estado exibiu `Backend local saudável` e `Backend local conectado.`
  - [shell em sucesso](/tmp/f2-v1-success.png)
- Erro: o request local `**/api/health` foi bloqueado somente no browser; o shell exibiu `Backend indisponível` e `Não foi possível consultar o backend local.` sem quebrar a tela.
  - [shell em erro](/tmp/f2-v1-error.png)
- Retry: o bloqueio foi removido, o botão `Tentar novamente` foi acionado e o estado voltou a `Backend local saudável`.
  - [retry recuperado](/tmp/f2-v1-retry-success.png)
- `/legacy`: o console exibiu `Console da Live`, carregou a fixture JSON fictícia `fixture.json`, mostrou `Canção de Teste`, `Artista Fictício` e `Interação de teste`, e o botão transitou para `Live em andamento`.
  - [legacy após carregar fixture](/tmp/f2-legacy-loaded.png)
  - [legacy em execução](/tmp/f2-legacy-running.png)
- A fixture foi temporária e fictícia; não foi adicionada ao Git. As referências de mídia/letra inexistentes foram tratadas pelo próprio console como pendentes, sem erro de renderização.

Comandos browser principais:

```text
agent-browser open http://127.0.0.1:8787/v1
agent-browser network route '**/api/health' --abort
agent-browser network unroute '**/api/health'
agent-browser open http://127.0.0.1:8787/legacy
agent-browser upload @e2 /tmp/live-console-f2-audit/fixture.json
agent-browser click @e4
```

## Integridade Git e dados locais

- `git diff --check` não encontrou whitespace problemático.
- A árvore rastreada da F2 não contém `.env`, `.mcp.json`, SQLite, mídia, repertórios pessoais, `node_modules`, `dist` ou segredos; os únicos caminhos `storage/` rastreados são `.gitkeep`.
- As regras de ignore cobrem `.env`, bancos SQLite/DB, `storage`, `musicas`, `letras`, `repertorios`, mídia, `dist` e `node_modules`. A alteração local pré-existente que adiciona `/tmp/` foi preservada e não foi incluída na entrega da F2.
- `.mcp.json` e artefatos locais permaneceram fora do escopo de staging/commit.

## Riscos e pendências

- **Risco não bloqueante:** `npm install` reportou 38 vulnerabilidades transitivas e avisos de dependências deprecated; tratar em tarefa própria de dependências, sem `npm audit fix` nesta F2.
- **Observação de fixture:** a fixture browser usada nesta auditoria foi sintética e não incluiu arquivos de mídia/letra reais; isso não altera o teste de carregamento e execução do console v0.
- **Pendência de processo:** a PR permanece draft até a decisão do responsável de marcar como pronta. Não foi feito merge.
