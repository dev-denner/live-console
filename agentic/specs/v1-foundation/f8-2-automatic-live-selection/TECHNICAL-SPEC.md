# F8.2 — Especificação técnica

## Fronteira

Angular mantém a interface V1. Fastify mantém a API local. SQLite continua sendo a persistência. A geração automática apenas cria ou substitui a composição de um rascunho.

Nenhuma regra deve ser implementada no \`/legacy\`.

## Entrada

Recomenda-se:

\`POST /api/v1/live-drafts/generate\`

A rota estática deve ser registrada antes de \`/api/v1/live-drafts/:id\`.

Payload:

\`\`\`json
{
  "quantidadeReferencia": 30,
  "autoraisDesejadas": 2,
  "aberturaId": null,
  "seed": null
}
\`\`\`

A quantidade de referência deve ser inteira e positiva, com limite razoável definido pela aplicação. O padrão é 30.

## Resposta

\`\`\`json
{
  "rascunho": {},
  "geracao": {
    "quantidadeReferencia": 30,
    "quantidadeGerada": 30,
    "autoraisDesejadas": 2,
    "autoraisGeradas": 2,
    "seed": "…",
    "algoritmo": "f8.2",
    "avisos": []
  }
}
\`\`\`

## Construção das candidatas

1. Buscar somente músicas com \`ativo = true\`.
2. Remover músicas sem mídia reproduzível.
3. Identificar músicas pertencentes a blocos.
4. Criar unidades de bloco, preservando a ordem interna.
5. Criar unidades individuais apenas para músicas sem bloco.
6. Reservar a abertura.
7. Remover do bloco a música reservada pela abertura.
8. Remover unidades vazias ou inválidas.
9. Garantir que cada \`musicaId\` apareça em no máximo uma unidade.

A versão não é escolhida pelo gerador. A validade da música depende de existir uma fonte reproduzível; a resolução da versão fica para a execução.

## Seleção limitada

Cada unidade possui:

- \`quantidade\`: número de músicas;
- \`autorais\`: quantidade de autorais;
- \`musicaIds\`: IDs ocupados;
- pontuação de desempate baseada em \`xEmLives\` e \`seed\`.

Usar uma busca finita, como programação dinâmica ou abordagem equivalente, indexada por quantidade até \`quantidadeReferencia\` e quantidade de autorais. Cada unidade é processada uma vez.

Critério lexicográfico:

1. maior quantidade alcançada sem ultrapassar a referência;
2. menor diferença para \`autoraisDesejadas\`;
3. menor soma de \`xEmLives\`;
4. desempate por \`seed\`.

A implementação deve ter limite explícito e nunca usar tentativas aleatórias indefinidas.

## Ordenação

Depois de escolher as unidades:

- abertura permanece primeiro;
- blocos e músicas individuais podem aparecer em qualquer ordem;
- a ordem entre unidades usa a \`seed\`;
- a ordem interna dos blocos não muda.

## Identidade

O rascunho usa \`musicaId\` para impedir repetição. \`musicaBase\` não participa da seleção automática.

O cadastro deve ser responsável por impedir duplicidade de artista/título. Versões continuam sendo filhas da mesma música.

## Metadados

Guardar no rascunho ou em coluna própria:

\`\`\`json
{
  "modo": "automatico",
  "quantidadeReferencia": 30,
  "autoraisDesejadas": 2,
  "quantidadeGerada": 30,
  "autoraisGeradas": 2,
  "seed": "…",
  "algoritmo": "f8.2",
  "geradoEm": "…",
  "avisos": []
}
\`\`\`

Esses campos são informativos e não restringem a edição manual posterior.

## Concorrência e catálogo alterado

A API deve validar novamente a composição antes de persistir. Se o catálogo mudar durante a geração, deve retornar aviso ou erro compreensível, sem escrever uma composição inválida.

## Não alteração de execução

A geração não cria execução, não incrementa \`xEmLives\` e não grava evento de música tocada.
