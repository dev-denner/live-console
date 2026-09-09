# Evidências F1

## Estado e escopo

- **VERIFICADO** — branch `feat/foundation-f1-legacy-isolation`, PR #25.
- **VERIFICADO** — implementação aditiva: a raiz mantém catálogo, lives, blocos e execução; `/legacy` expõe somente o console v0 histórico.
- **VERIFICADO** — origem histórica escolhida: commit `1f8a2e6`, arquivo original `index.html`.
- **VERIFICADO** — `.mcp.json` continua não rastreado.
- **VERIFICADO** — nenhuma migration, schema, repositório ou dado local foi alterado.

## Validações automatizadas

- **VERIFICADO** — `npm install`.
- **VERIFICADO** — `npm run build`.
- **VERIFICADO** — migration em SQLite temporário.
- **VERIFICADO** — `npm run typecheck`.
- **VERIFICADO** — `npm run lint`.
- **VERIFICADO** — `npm test`: 17 testes aprovados.
- **VERIFICADO** — `git diff --check`.

## Smoke HTTP

- **VERIFICADO** — 200 para:
  - `/api/health`;
  - `/`;
  - `/catalogo`;
  - `/lives`;
  - `/blocos`;
  - `/execucao`;
  - `/legacy`.
- **VERIFICADO** — 404 para:
  - `/legacy/catalogo`;
  - `/legacy/lives`;
  - `/legacy/blocos`;
  - `/legacy/execucao`.

## Jornadas browser

- **VERIFICADO** — `agent-browser` abriu `http://localhost:8787/legacy` e exibiu o console v0 histórico.
- **VERIFICADO** — fixture real `repertorios/live-2026-08-08.json` foi carregada por seleção de arquivo.
- **VERIFICADO** — repertório carregado com 28 músicas, incluindo título, artista e duração.
- **VERIFICADO** — controles de repertório, letra, interações, anterior, próxima e “Feita + próxima” foram renderizados.
- **VERIFICADO** — “Iniciar live” transitou para “Live em andamento”; “Terminar live” e “Registro” ficaram habilitados.
- **VERIFICADO** — screenshot de evidência foi capturado durante a live em execução; o arquivo permaneceu fora do Git.
- **VERIFICADO** — ao acionar “Terminar live”, o console exibiu a confirmação `Terminar a live e gerar o registro das músicas tocadas?`; a confirmação não foi aceita para evitar gerar um registro de execução real durante a validação.
- **VERIFICADO** — não houve alteração de código, banco, repertório ou mídia durante a jornada.
- **PENDENTE NÃO BLOQUEANTE** — a fixture contém caminhos legados Windows para mídia/letras, como `G:\\Meu Drive\\...`; o console preserva e exibe a referência literalmente, mas o arquivo não é encontrado no WSL. A resolução portátil de arquivos pertence a uma etapa posterior.

## Resultado

A F1 está visualmente validada. A pendência de caminhos legados é esperada e não altera o contrato do console v0.
