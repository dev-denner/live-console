# Evidências F2

## Estado

- **PLANEJADO** — F2 cria o shell Angular e a fronteira local sem substituir páginas atuais.
- **PLANEJADO** — superfície temporária da V1: `/v1`.
- **PENDENTE** — implementação ainda não iniciada; este documento será atualizado durante a execução.

## Decisões registradas

- Angular standalone + TypeScript strict + Signals.
- NgRx SignalStore somente quando uma feature possuir estado compartilhado suficiente para justificar store.
- Fastify/TypeScript permanece no processo local existente.
- SQLite, Drizzle e migrations SQL continuam sob suas autoridades atuais.
- `/legacy` continua sendo o console v0 baseado em JSON.

## Evidências exigidas

- build do frontend e backend;
- typecheck e testes;
- smoke HTTP das superfícies raiz, `/legacy` e `/v1`;
- jornada browser em `/v1` com sucesso e erro da API;
- jornada browser regressiva em `/legacy` com fixture JSON;
- `git diff --check`;
- `git status` sem banco, mídia, repertório pessoal, export ou segredo.

## Resultado

Ainda não concluído. A implementação só poderá ser marcada pronta quando todas as evidências acima estiverem anexadas e a PR estiver revisada.
