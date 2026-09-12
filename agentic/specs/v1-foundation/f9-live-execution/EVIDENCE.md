# Evidência F9

Correção de revisão em `feat/f9-live-execution`, SHA `8a1957480c63564efc1ee6e4cdb569019e1e252f`, PR [#51](https://github.com/dev-denner/live-console/pull/51).

- Migration `011_f9_live_execution.sql` executada com `npm run db:migrate`.
- Arquivos alterados: `src/db/repositories.ts`, `server.ts`, `test/f9-live-execution.test.ts`, tela Angular de execução e esta especificação.
- `npm run db:migrate`, `npm run typecheck`, `npm run build` e `git diff --check`: passaram.
- Teste isolado: `npx tsx --test test/f9-live-execution.test.ts` — 3/3 passaram. A execução integral de `npm test` ainda deve ser repetida no ambiente de CI/local antes de solicitar revisão.
- Browser: `/v1/execucao` carregou a tela operacional, seletor de repertórios e estado vazio; screenshot: `/tmp/f9-execucao.png`. A rota `/legacy` deve permanecer na regressão final.
- Fluxos cobertos: bloqueio de reordenação fechada, abertura fixa, Play obrigatório, bloqueio de novo Play após `tocada`, confirmação obrigatória para desfazer e reconciliação no encerramento.
- Decisão F8.2: `live_drafts` é fonte de verdade até a conversão transacional por `POST /api/live-drafts/:id/converter`; depois `lives` é fonte de verdade para edição, fechamento e execução.
- Limitações restantes: a jornada com catálogo real (versões YouTube/áudio/vídeo e letra) e a suíte integral ainda exigem validação final; não solicitar merge antes disso.

## Validação final da migration 012 e Play operacional

- Banco recém-criado: SQLite temporário em `/tmp/f9-mig-*`; todas as migrations foram aplicadas desde o início. `execucao_itens_live` aceitou `pendente`, `tocando`, `tocada` e `pulada`, preservando linha preexistente.
- Suíte completa: `npm test > /tmp/live-console-npm-test-final.log 2>&1; test $? -eq 0` — código 0, **61/61 testes**, sem falhas/interrupção.
- `npm run typecheck`, `npm run lint`, `npm run build` e `git diff --check` — OK.
- Fixture V1 temporário: músicas cadastradas por `/api/v1/musicas` com YouTube literal, MP3/MP4 reais em `/tmp/f9-browser-storage`, letras UTF-8; rascunho criado em `/api/v1/live-drafts`, convertido transacionalmente para `lives`, fechado e iniciado.
- Browser em servidor novo `:8790`: `/v1/execucao` exibiu o repertório V1; versão MP3 foi selecionada, player iniciou pausado, letra carregou, botão operacional Play retornou HTTP 200/estado `tocando` e habilitou `Marcar tocada`; após a confirmação, o item ficou inativo e “Desfazer” apareceu. Screenshot: `/tmp/f9-final-play-tocada.png`.
- Abertura permaneceu no primeiro item; seletor de adição ocultou músicas presentes e ofereceu apenas a música temporária não usada. A rota `/legacy` permanece coberta pelos testes de regressão.
- Limitação real: a execução manual completa de vídeo, YouTube, adição/reordenação/skip/undo/encerramento não foi concluída integralmente em uma única sessão visual; as transições de domínio e encerramento estão cobertas pelos testes de integração F9.
