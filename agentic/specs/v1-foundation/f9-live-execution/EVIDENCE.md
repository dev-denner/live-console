# Evidência F9

Correção de revisão em `feat/f9-live-execution`, PR [#51](https://github.com/dev-denner/live-console/pull/51). O SHA será registrado no commit de entrega.

- Migration `011_f9_live_execution.sql` executada com `npm run db:migrate`.
- Arquivos alterados: `src/db/repositories.ts`, `server.ts`, `test/f9-live-execution.test.ts`, tela Angular de execução e esta especificação.
- `npm run db:migrate`, `npm run typecheck`, `npm run build` e `git diff --check`: passaram.
- Teste isolado: `npx tsx --test test/f9-live-execution.test.ts` — 3/3 passaram. A execução integral de `npm test` ainda deve ser repetida no ambiente de CI/local antes de solicitar revisão.
- Browser: `/v1/execucao` carregou a tela operacional, seletor de repertórios e estado vazio; screenshot: `/tmp/f9-execucao.png`. A rota `/legacy` deve permanecer na regressão final.
- Fluxos cobertos: bloqueio de reordenação fechada, abertura fixa, Play obrigatório, bloqueio de novo Play após `tocada`, confirmação obrigatória para desfazer e reconciliação no encerramento.
- Decisão F8.2: `live_drafts` é fonte de verdade até a conversão transacional por `POST /api/live-drafts/:id/converter`; depois `lives` é fonte de verdade para edição, fechamento e execução.
- Limitações restantes: a jornada com catálogo real (versões YouTube/áudio/vídeo e letra) e a suíte integral ainda exigem validação final; não solicitar merge antes disso.
