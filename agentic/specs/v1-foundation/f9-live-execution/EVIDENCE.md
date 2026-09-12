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

## Jornada visual completa — fixture V1 persistente

- Servidor recém-iniciado em PTY persistente na porta `8791`, com banco `/tmp/f9-browser-final.sqlite`, storage `/tmp/f9-browser-storage` e monitoramento periódico de `/api/health`; não houve queda, exceção ou encerramento durante a reprodução.
- O fixture foi criado pelo fluxo V1: `/api/v1/musicas` (abertura YouTube, áudio MP3, vídeo MP4, música adicional), `/api/v1/live-drafts`, atualização do draft e conversão para `lives`. MP3/MP4 eram arquivos pequenos e válidos em `/tmp`.
- Na mesma sessão browser `/v1/execucao/<liveId>`: repertório selecionado, live iniciada, áudio selecionado com versão explícita e letra UTF-8 exibida; player iniciou pausado, Play operacional registrou `200`/`tocando`, “Marcar tocada” habilitou e o item ficou inativo após confirmação.
- Vídeo local selecionado e exibido em player nativo pausado (`/tmp/f9-final-video.png`); abertura YouTube selecionada, iframe exibido e URL literal preservada (`/tmp/f9-persistent-youtube.png`).
- Música adicional foi selecionada no seletor (músicas já presentes estavam ausentes) e inserida no final; fila permaneceu sem ação de remoção. Drag-and-drop foi acionado, abertura permaneceu na primeira posição. O fixture não possuía blocos persistidos, portanto não foi possível demonstrar movimentação entre dois blocos nessa jornada.
- Skip manteve o item na fila; desfazer tocada abriu confirmação explícita e foi aceito; encerramento confirmado retornou o repertório como `executado` e a sessão como `encerrada`, com `/api/health` ainda respondendo `200`. Screenshot final: `/tmp/f9-final-journey.png`.
- A ordem real e a reconciliação única de `xEmLives` permanecem cobertas pelos testes F9 (61/61); `/legacy` permanece coberto pelo teste de regressão de fronteira.
