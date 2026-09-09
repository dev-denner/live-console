# F1 — Isolamento executável do Live Console v0

## Problema e objetivo

O console v0 original, baseado em arquivo JSON, não pode ser confundido com as páginas administrativas atuais. Esta fase oferece esse console em uma única entrada `/legacy`, sem alterar regras, dados ou APIs atuais.

## Escopo

Isolamento do asset histórico `index.html` (commit `1f8a2e6`), preservando seleção de JSON, reprodução, letras e interações. Não há páginas administrativas em `/legacy`, Angular, migration ou mudança de schema. Catálogo, lives, blocos e execução permanecem na raiz.

## Usuários e jornadas

Operadores locais usam `/legacy` para carregar um repertório JSON e iniciar a live sem SQLite; as páginas administrativas continuam em `/catalogo`, `/lives`, `/blocos` e `/execucao`.

## Aceitação

- As cinco rotas `/legacy*` respondem com as páginas atuais.
- Links entre páginas permanecem no namespace legado; `/api/*`, `/local` e assets continuam literais.
- Refresh/deep-link não alteram o contrato do v0.
- Testes automatizados e smoke HTTP passam; browser é requisito explícito e, se indisponível, a entrega fica bloqueada.

## Riscos e compatibilidade

O principal risco é duplicar ou reescrever HTML e quebrar links relativos. O mount transforma apenas atributos `href` de páginas internas; scripts, APIs e referências não são normalizados. Rollback: remover as rotas e o helper, sem tocar no banco.

## Privacidade

Nenhum dado de catálogo, mídia, SQLite, repertório ou segredo é copiado. `.mcp.json` permanece local e ignorado.

## Pendência para F2

Executar jornadas completas com navegador disponível e decidir a primeira superfície Angular, mantendo `/legacy` até a substituição ser comprovada.
