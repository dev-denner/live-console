# Especificação técnica — F9

## Entidades

### Repertório de live

Campos mínimos:

- `id`, `nome`, `dataPlanejada`;
- `status` (`rascunho`, `fechado`, `em_execucao`, `executado`, `cancelado`);
- `quantidadeAlvo` apenas como orientação do automatizador;
- `criadoEm`, `atualizadoEm`, `fechadoEm`, `executadoEm`.

### Item planejado

- `repertorioId`;
- `musicaId`;
- `posicaoPlanejada`;
- `blocoId` opcional;
- `ehAbertura`;
- snapshot literal da referência necessária para reprodução.

Restrição: um `musicaId` não pode ocorrer duas vezes no mesmo repertório. A abertura é única e deve permanecer na posição zero.

### Sessão de execução

- `id`, `repertorioId`;
- `iniciadaEm`, `encerradaEm`;
- `status` (`ativa`, `encerrada`, `cancelada`);
- `reconciliadaEm` e chave de idempotência.

### Item de execução

- `sessaoId`, `musicaId`;
- `ordemReal`;
- `origem` (`planejada`, `adicionada_durante_execucao`);
- `estado` (`tocando`, `tocada`, `pulada`);
- `iniciadaEm`, `finalizadaEm`, `confirmadaEm`;
- referência/versão usada no momento do play.

Itens executados não podem ser removidos. A reversão de “tocada” é uma correção auditável e exige confirmação; não apaga silenciosamente o evento original.

## Transições permitidas

```text
rascunho -> fechado -> em_execucao -> executado
rascunho -> cancelado
fechado -> cancelado
```

Não existe transição de volta para `rascunho` e não existe edição estrutural de `fechado`, `em_execucao` ou `executado`.

## API mínima

- `POST /api/repertorios/:id/fechar`
- `POST /api/repertorios/:id/duplicar`
- `POST /api/repertorios/:id/executar`
- `POST /api/execucoes/:id/adicoes`
- `POST /api/execucoes/:id/itens/:itemId/play`
- `POST /api/execucoes/:id/itens/:itemId/marcar-tocada`
- `POST /api/execucoes/:id/itens/:itemId/pular`
- `POST /api/execucoes/:id/itens/:itemId/desfazer-tocada`
- `POST /api/execucoes/:id/reordenar`
- `POST /api/execucoes/:id/encerrar`

Toda alteração deve validar o estado atual no servidor. O cliente não pode contornar a imutabilidade ou a unicidade por `musicaId`.

## Regras de duplicação

Duplicar é uma operação de leitura do repertório fonte e criação de novo `rascunho`. Cada item é revalidado contra o catálogo atual. O resultado inclui `copiados`, `omitidos` e motivos. Não copiar histórico, timestamps de execução ou contadores.

## Regras de seleção ao adicionar

O endpoint de catálogo deve receber o `repertorioId`/`sessaoId` e excluir todos os `musicaId` já presentes. Essa exclusão deve existir tanto na consulta quanto na validação de inclusão.

## Reconcilição de `xEmLives`

Encerramento deve executar transação idempotente:

1. validar sessão ativa;
2. obter itens com `estado = tocada`;
3. inserir registros de execução confirmada com chave única `(sessaoId, musicaId)`;
4. incrementar `xEmLives` somente para inserções novas;
5. marcar sessão como encerrada e reconciliada.

Falhas não podem deixar contadores parcialmente incrementados.

## Compatibilidade

Preservar `/legacy`, URLs e caminhos literais. O player deve usar a referência gravada no item, sem reconstruir links.

## Integração F8.2

`live_drafts` é a fonte de verdade enquanto a seleção automática está sendo montada. O endpoint `POST /api/live-drafts/:id/converter` faz a promoção transacional para `lives`: resolve cada `versaoId` contra o catálogo atual, preserva abertura, blocos, ordem e referências literais, cria os itens e remove o draft somente após sucesso. A partir daí `lives` é a fonte de verdade para editar, fechar e executar; não há recadastro manual nem cópia de histórico de execução.
