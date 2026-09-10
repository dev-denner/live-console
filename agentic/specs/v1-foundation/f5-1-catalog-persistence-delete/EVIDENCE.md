# F5.1 — Evidências

Status: especificação preparada; implementação pendente.

## Escopo validado

- [ ] POST de criação funcionando.
- [ ] GET de detalhe funcionando.
- [ ] PUT de edição funcionando.
- [ ] DELETE com confirmação funcionando.
- [ ] Relações de bloco removidas.
- [ ] Letra Markdown removida.
- [ ] Áudio/vídeo local removidos.
- [ ] URLs YouTube preservadas como referência.
- [ ] Staging promovido somente no salvamento final.
- [ ] Rollback sem registro incompleto ou mídia órfã.
- [ ] `xEmLives` inalterado.
- [ ] `/legacy` preservado.

## Arquivos alterados

- pendente

## Comandos

- pendente

## Testes

- pendente: testes API/repositório
- pendente: testes F5 existentes
- pendente: `npm test` com encerramento normal
- pendente: typecheck
- pendente: lint
- pendente: build
- pendente: git diff --check

## Browser

- pendente: criação
- pendente: edição
- pendente: cancelamento da exclusão
- pendente: exclusão e limpeza
- pendente: regressão `/legacy`

## Riscos

- remoção física precisa ser protegida contra referências compartilhadas;
- falhas de filesystem devem deixar diagnóstico operacional;
- janitor TTL de staging continua sendo follow-up da F5;
- F6 permanece fora deste escopo.
