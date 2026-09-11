# F8.1 — Especificação técnica

## Fronteira

Angular continua responsável pela tela V1; Fastify permanece como API local; SQLite/Drizzle e migrations existentes continuam sendo a camada de persistência. Nenhuma regra é implementada no `/legacy`.

## Modelo do rascunho

Usar uma entidade `live_draft` com composição JSON validada na fronteira da API. O rascunho é uma composição editável e transitória; não é ainda um registro de execução.

Campos mínimos:

- `id` estável;
- `nome` opcional;
- `status = draft`;
- `composicao_json`;
- `criada_em`;
- `atualizada_em`.

Documento de composição:

```json
{
  "abertura": {
    "musicaId": "uuid",
    "versaoId": "uuid",
    "titulo": "...",
    "artista": "...",
    "nomeVersao": "...",
    "duracao": null,
    "xEmLives": 0
  },
  "segmentos": [
    {
      "tipo": "bloco",
      "blocoId": "uuid",
      "nome": "Pop 1",
      "itens": [
        {
          "musicaId": "uuid",
          "versaoId": "uuid",
          "titulo": "...",
          "artista": "...",
          "musicaBase": "...",
          "duracao": 210,
          "xEmLives": 0
        }
      ]
    },
    {
      "tipo": "musica",
      "musicaId": "uuid",
      "versaoId": "uuid",
      "titulo": "...",
      "artista": "...",
      "musicaBase": "...",
      "duracao": null,
      "xEmLives": 2
    }
  ]
}
```

O backend deve validar que os IDs ainda existem, estão ativos, têm mídia válida e não violam `musicaBase`. Os snapshots preservam o que foi escolhido no momento do salvamento, mas a API deve avisar se o catálogo mudou ao reabrir.

## API mínima

- `GET /api/v1/live-drafts` — lista rascunhos.
- `POST /api/v1/live-drafts` — cria rascunho vazio.
- `GET /api/v1/live-drafts/:id` — retorna composição e opções elegíveis.
- `PUT /api/v1/live-drafts/:id` — substitui composição inteira de forma atômica.
- `DELETE /api/v1/live-drafts/:id` — exclui somente o rascunho, mediante confirmação da UI.

A resposta de opções deve separar `aberturas`, `blocos` e `musicasSemBloco`, sempre filtrando status e disponibilidade de mídia.

## Regras de composição

- `abertura` é opcional quando não existem aberturas elegíveis.
- Quando existem aberturas elegíveis, `PUT` sem abertura retorna erro de validação.
- A abertura não pertence a `segmentos` e não pode ser reordenada.
- Cada bloco mantém os itens na ordem recebida do cadastro; a API rejeita uma composição que tente reordená-los.
- Segmentos do tipo `bloco` e `musica` possuem ordem pela posição do array.
- A soma de duração considera apenas `segmentos`; `null` torna o total parcial.
- `xEmLives` é somente leitura e nunca é alterado ao salvar o rascunho.

## Estado Angular

Usar Signals para estado local do diálogo e NgRx SignalStore, se necessário, para o rascunho, opções, loading, erros, seleção de abertura e persistência. O API é a autoridade após salvar.

## Interação

- Botões explícitos “Adicionar bloco” e “Adicionar música” são obrigatórios.
- Drag-and-drop pode ser usado para adicionar em uma zona indicada e mover segmentos.
- Abertura não tem handle de arraste.
- Bloco tem um único handle de arraste no segmento; itens internos não têm handle.
- Música individual tem handle próprio.
- Fornecer também controles de teclado/botões para mover para cima/baixo.
- Prévia de bloco abre por clique em popover/drawer, não depende apenas de hover.

## Testes

- contrato de opções filtra inativas e mídia inexistente;
- abertura obrigatória somente quando aplicável;
- abertura fixa e substituível;
- bloco preserva ordem interna;
- música individual pode mover;
- bloco pode mover;
- mesma `musicaBase` é rejeitada ou reservada sem duplicação;
- duração soma segundos e indica parcial;
- salvar/reabrir preserva composição;
- `xEmLives` permanece inalterado;
- browser cobre criação, seleção, drag/click, movimentação, salvamento e reabertura;
- `/legacy` continua respondendo.
