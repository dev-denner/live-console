# F1 — Isolamento executável do Live Console v0

## Problema e objetivo

O v0 era servido diretamente na raiz, sem uma fronteira explícita para a futura aplicação v1. Esta fase expõe as mesmas páginas em `/legacy`, sem alterar regras, dados ou APIs.

## Escopo

Mount explícito das páginas existentes (`index`, catálogo, lives, blocos e execução), preservando scripts, links de API, referências literais de mídia/letras e o comportamento da raiz. Não há Angular, páginas v1, migration ou mudança de schema.

## Usuários e jornadas

Operadores locais continuam usando catálogo, lives, blocos, montagem e execução através de `/legacy`. As jornadas detalhadas e sua evidência estão em `EVIDENCE.md`.

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
