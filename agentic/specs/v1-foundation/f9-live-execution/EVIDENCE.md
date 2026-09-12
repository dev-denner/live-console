# Evidência F9

Implementação validada na branch `feat/f9-live-execution`, SHA `b083cf4` (`b083cf4867649e719443a30e056815256aea9736`), PR [#51](https://github.com/dev-denner/live-console/pull/51).

- Migration `011_f9_live_execution.sql` executada com `npm run db:migrate`.
- Testes F9 cobrem fechamento, Play obrigatório, execução fora da ordem, skip, duplicidade por `musicaId`, duplicação sem histórico e reconciliação idempotente de `xEmLives`.
- Suíte completa: 60 testes, 60 passaram.
- `npm run lint`, `npm run typecheck`, `npm run build` e `git diff --check`: passaram.
- Browser: `/v1/execucao` renderizou o layout operacional com seletor de repertórios e estado vazio; `/legacy` continuou renderizando o console histórico. Screenshot temporário: `/tmp/f9-execucao.png`.
- Limitação: a composição detalhada de rascunhos F8 ainda usa `live_drafts`; a execução F9 usa a entidade persistente `lives` e suas APIs compatíveis.
