# F8.2 — Seleção automática de músicas para rascunho

Status: especificação aprovada para implementação.

## Objetivo

Adicionar uma seleção automática que gere uma pré-seleção em um rascunho compatível com a F8.1. O usuário poderá revisar, remover, adicionar e reorganizar o resultado livremente antes de salvar a composição final.

A seleção automática não executa a live, não altera o catálogo e não incrementa \`xEmLives\`.

## Parâmetros

- \`quantidadeReferencia\`: quantidade usada pelo algoritmo como orientação; padrão 30.
- \`autoraisDesejadas\`: quantidade de autorais que o algoritmo tentará alcançar.
- abertura opcional escolhida pelo usuário; quando ausente, o sistema escolhe automaticamente;
- \`seed\` técnica opcional para reproduzir ou regenerar o resultado.

A quantidade de referência não é uma regra da live. O rascunho pode terminar com qualquer quantidade após edição manual.

## Elegibilidade

Uma música só pode ser candidata se:

- \`ativo = true\`;
- possuir pelo menos uma mídia reproduzível;
- ainda não estiver selecionada pelo mesmo \`musicaId\`;
- não estiver reservada como abertura.

Não usar \`status = OK\`, vibe, clima ou objetivo como critérios da F8.2. Esses conceitos não fazem parte do catálogo atual.

A validação de duplicidade do catálogo deve impedir registros duplicados de artista/título. Dentro do rascunho, a identidade é o \`musicaId\`; \`musicaBase\` não é chave da seleção.

## Abertura

Se houver abertura elegível:

1. preferir uma que não tenha sido tocada na live anterior, quando esse histórico existir;
2. na ausência dessa informação, preferir menor \`xEmLives\`;
3. desempatar por ordem estável e \`seed\`.

A abertura fica na primeira posição, não entra na quantidade de referência nem na duração e pode ser trocada depois na F8.1.

Se a abertura pertencer a um bloco, sua música é reservada e omitida do bloco; os demais itens preservam a ordem cadastrada.

## Blocos e músicas individuais

As unidades candidatas são:

- bloco inteiro;
- música individual sem bloco.

Não há prioridade fixa para bloco ou música individual. O resultado pode começar por qualquer uma das duas unidades.

Blocos são indivisíveis. Suas músicas internas permanecem na ordem cadastrada. Blocos sem itens elegíveis não entram na seleção.

## Quantidade alcançada

O algoritmo tenta alcançar a quantidade de referência sem ultrapassá-la automaticamente.

Se não houver combinação exata:

- procura a maior quantidade possível abaixo da referência;
- testa 30, depois 29, 28 e assim por diante, conceitualmente;
- salva o melhor resultado encontrado;
- informa a quantidade solicitada e a quantidade gerada.

Exemplo:

> Referência: 32 músicas. Foram geradas 30. Não foi encontrada combinação válida com 31 ou 32.

A quantidade final pode ser alterada livremente pelo usuário depois.

## Preferência

Entre combinações com a mesma quantidade:

1. aproximação da quantidade desejada de autorais;
2. menor soma de \`xEmLives\`;
3. desempate determinístico por \`seed\`.

\`xEmLives = 0\` é preferido antes de 1, depois 2 e assim por diante. Não há prioridade de fonte: YouTube, áudio local e vídeo local são equivalentes quando válidos.

## Versões

O algoritmo seleciona músicas, não versões. A versão principal, na posição 0, será resolvida na execução. O usuário poderá trocar a versão antes de tocar.

A tela automática não exibe seletor de versões.

## Resultado

A geração produz:

- rascunho compatível com a F8.1;
- abertura, quando aplicável;
- blocos e músicas individuais;
- quantidade gerada;
- autorais alcançadas;
- duração informativa;
- avisos de quantidade ou autorais não atingidas;
- metadados da geração.

O usuário pode editar o resultado sem ficar preso à quantidade de referência.

## Fora de escopo

- seleção por vibe, clima ou objetivo;
- execução da live;
- histórico completo de execução;
- alteração automática de \`xEmLives\`;
- exportação para Legacy;
- escolha automática de versão;
- otimização por duração;
- aprendizado por audiência.
