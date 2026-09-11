# F8.1 — Montagem manual de repertório em rascunho

## Problema

O catálogo V1 já permite importar, cadastrar e editar músicas, versões, blocos e mídias. Falta uma tela operacional para montar uma live manualmente, usando apenas músicas ativas, sem duplicar obras e sem alterar o catálogo durante a montagem.

## Objetivo

Criar um rascunho de repertório com abertura opcional/obrigatória conforme a disponibilidade do catálogo, blocos e músicas individuais, mantendo a ordem interna dos blocos e permitindo reorganizar somente blocos inteiros e músicas individuais.

Esta fase não implementa seleção automática, histórico de execução, incremento de `xEmLives`, exportação para `/legacy` ou redesign visual definitivo.

## Fluxo principal

1. O usuário abre “Nova live” e cria um rascunho sem informar quantidade total.
2. Se existir pelo menos uma versão ativa, com mídia válida e `abertura: true`, a tela exige a escolha de uma abertura.
3. A abertura escolhida fica fixa na primeira posição. Pode ser substituída, mas não movida.
4. O usuário adiciona blocos inteiros ou músicas individuais.
5. O usuário pode mover blocos e músicas individuais dentro do repertório.
6. A ordem interna de um bloco é somente leitura e vem do cadastro do bloco.
7. O rascunho pode ser salvo, fechado e reaberto.

## Layout proposto

Em telas largas, usar duas colunas:

- **40% à esquerda — Repertório em montagem**: abertura fixa, blocos/músicas escolhidos, controles de mover/remover, contagem e duração.
- **60% à direita — Catálogo para seleção**: aberturas no topo, blocos em cards e músicas sem bloco em grade de duas colunas.

Em telas estreitas, as colunas passam a uma sequência vertical, mantendo o repertório acessível e fixo durante a seleção quando possível.

O clique em “Adicionar” é a interação principal e acessível. Arrastar um bloco ou música para uma zona explícita da lista é permitido como atalho visual, mas não pode ser a única forma de uso.

## Regras de elegibilidade

- Música inativa nunca aparece para seleção.
- Uma versão local só é elegível se o arquivo existir e puder ser servido pela API.
- Uma versão YouTube é elegível se possuir referência válida.
- A seleção não prioriza YouTube: áudio local, vídeo local e YouTube são equivalentes quando válidos.
- A mesma `musicaBase` não pode aparecer duas vezes no rascunho.
- A abertura reserva sua `musicaBase` e impede nova inclusão da mesma obra.
- Blocos sem músicas ativas e elegíveis não aparecem ou ficam indisponíveis.

## Aberturas

As aberturas ficam em uma seção própria no topo do catálogo. Cada opção mostra música, artista, versão, mídia e `xEmLives`.

Se a abertura escolhida também pertencer a um bloco:

- o bloco continua disponível;
- a música reservada aparece como “Usada na abertura” e não é adicionada novamente;
- as demais músicas do bloco preservam a ordem do cadastro.

Se o bloco ficar sem nenhuma música elegível, não pode ser adicionado.

## Blocos e músicas

- Clicar em um bloco adiciona o bloco como uma unidade.
- Os itens internos permanecem na ordem cadastrada no bloco.
- Não é permitido reordenar músicas dentro do bloco nesta fase.
- Para alterar a ordem interna, o usuário edita o cadastro do bloco.
- Músicas sem bloco são adicionadas individualmente e podem ser movidas livremente.
- Um bloco com conflito de `musicaBase` já selecionada informa o conflito antes de adicionar; não duplica silenciosamente.

## Informação operacional

Cada música exibe `xEmLives`, tanto nos cards individuais quanto dentro da prévia/lista de um bloco.

O resumo do rascunho exibe:

- quantidade de músicas regulares selecionadas;
- quantidade de blocos;
- duração estimada das músicas regulares em horas, minutos e segundos;
- indicação de duração parcial quando alguma versão não tiver duração cadastrada.

A abertura não entra na quantidade nem na duração, pois é tratada como uma introdução independente.

## Critérios de aceite

- Abertura obrigatória somente quando houver abertura elegível.
- Abertura sempre na primeira posição e substituível sem ser arrastável.
- Inativas e mídias inválidas não aparecem como opções.
- Blocos podem ser adicionados e movidos como unidades.
- Músicas individuais podem ser adicionadas e movidas.
- Músicas internas de bloco não podem ser reordenadas na montagem.
- `xEmLives` aparece em todas as opções relevantes.
- Duração soma versões selecionadas e formata horas, minutos e segundos.
- Rascunho persiste e reabre sem alterar `xEmLives` ou o catálogo.
- `/legacy` permanece inalterado.
