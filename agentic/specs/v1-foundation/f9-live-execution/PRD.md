# PRD — F9: Execução de repertórios de lives

## Objetivo

Transformar um repertório planejado em uma operação de live controlada, permitindo executar músicas em ordem diferente da planejada, registrar a sequência real e reconciliar `xEmLives` somente no encerramento confirmado.

O produto passa a tratar **repertório de live** como entidade persistente. `rascunho` é apenas um estado; vários repertórios podem coexistir para dias diferentes.

## Estados do repertório

- `rascunho`: editável.
- `fechado`: planejamento congelado, aguardando execução.
- `em_execucao`: operação iniciada.
- `executado`: live encerrada e reconciliada.
- `cancelado`: não será executado.

Um repertório `fechado` ou `executado` não pode ser reaberto para edição. Para alterar um repertório fechado/executado, o usuário deve duplicá-lo e trabalhar em um novo rascunho.

## Duplicação

A duplicação copia, quando ainda existirem no catálogo:

- músicas;
- blocos;
- sequência planejada;
- metadados úteis do repertório.

Itens ausentes no catálogo não são recriados. O sistema deve informar claramente quais músicas ou blocos foram omitidos. A duplicação de um repertório executado copia o planejamento, não o histórico de execução nem incrementa `xEmLives`.

## Planejamento

- A abertura ocupa sempre a primeira posição.
- As demais músicas podem ser reordenadas a partir da segunda posição.
- Uma música só pode aparecer uma vez no repertório, identificada por `musicaId`.
- Ao adicionar música, ela entra no final.
- O seletor de adição não deve exibir músicas já presentes no repertório atual.
- Blocos limitam a seleção/organização do planejamento, mas são apenas um conceito visual no repertório salvo.
- O planejamento pode ser editado enquanto estiver em `rascunho`.

## Execução

- Ao iniciar, o sistema cria uma sessão de execução baseada no repertório fechado.
- Durante a execução, não é permitido remover músicas do repertório.
- O usuário pode mover músicas, inclusive entre blocos, sem restrição de planejamento.
- O usuário pode adicionar músicas do catálogo; elas entram no final e podem ser movidas depois.
- Uma música que não será tocada deve ser marcada como `pulada`, sem ser removida.
- A abertura continua fixa na primeira posição.
- `Marcar tocada` só fica habilitado depois que o usuário acionar `Play`.
- Ao marcar tocada, a música fica inativa.
- Para retirar o estado de tocada, o usuário deve confirmar explicitamente em um diálogo.

## Registro real

O histórico registra somente a ordem final efetivamente executada. A ordem planejada não precisa ser persistida como histórico operacional.

Para cada música tocada, registrar:

- `musicaId`;
- versão/referência efetivamente usada;
- horário do `Play`;
- ordem real de execução;
- origem (`planejada` ou `adicionada_durante_execucao`);
- confirmação de tocada.

O horário de início é o momento do `Play`, não o momento posterior do clique em “Marcar tocada”. Fim automático pode ser registrado quando o player fornecer esse evento; nunca deve ser inventado para YouTube.

## Reconciliação

- `xEmLives` não muda ao planejar, fechar, iniciar, adicionar ou marcar provisoriamente.
- Ao encerrar a live, o sistema confirma a execução e incrementa `xEmLives` uma única vez por `musicaId` tocado.
- A reconciliação é idempotente.
- Abertura não incrementa `xEmLives` quando for um elemento operacional sem música.

## Fora de escopo

- seleção automática de repertório;
- mudanças de layout antes da aprovação do desenho operacional;
- execução de músicas externas não cadastradas;
- edição do repertório original após fechamento/execução;
- exclusão física de mídia.
