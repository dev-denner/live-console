# Evidências F1

## Estado e escopo

- **VERIFICADO** — branch `feat/foundation-f1-legacy-isolation`, HEAD `aafaa58`, PR #25.
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

- **BLOQUEADO** — `agent-browser` não está instalado nesta sessão (`command not found`).
- **NÃO VERIFICADO** — seleção de fixture JSON, reprodução, letra, interações, troca de música, recarregamento e erro visual de JSON.
- **NÃO VERIFICADO** — ausência de erros no console do navegador.

A F1 não deve ser declarada visualmente concluída até que essas jornadas sejam executadas com navegador disponível.

## Resultado

A estrutura de código está consistente com o escopo aprovado: `/legacy` é somente o console v0 baseado em JSON, enquanto as páginas atuais continuam na raiz.

A limitação browser permanece registrada para a próxima validação. A PR pode ser integrada como isolamento estrutural/documental, desde que essa limitação permaneça explícita e a futura verificação visual seja mantida como pendência.
