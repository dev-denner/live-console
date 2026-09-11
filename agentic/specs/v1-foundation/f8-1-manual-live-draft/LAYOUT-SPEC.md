# F8.1 — Layout e interação

## Desktop

```text
┌──────────────────────────────────────────────────────────────────┐
│ Nova live   [Salvar rascunho]       12 músicas   1h 18min 04s    │
├──────────────────────────┬───────────────────────────────────────┤
│ REPERTÓRIO (40%)         │ CATÁLOGO (60%)                        │
│                          │ Aberturas                             │
│ ★ Abertura fixa          │ [card] [card]                         │
│                          │                                       │
│ 1. Bloco Pop 1           │ Blocos                                │
│    1. Música             │ [bloco] [bloco]                       │
│    2. Música             │                                       │
│ 2. Música individual     │ Músicas sem bloco                    │
│                          │ [música] [música]                     │
│                          │ [música] [música]                     │
└──────────────────────────┴───────────────────────────────────────┘
```

## Comportamento visual

- O painel esquerdo permanece visível durante a seleção em telas largas.
- O catálogo usa cards compactos em duas colunas.
- Cada card mostra título, artista, versão disponível, tipo de mídia e `xEmLives`.
- Cards já utilizados ficam marcados e não podem duplicar a mesma obra.
- Clique no bloco abre sua prévia; o botão de adicionar fica explícito.
- Abertura selecionada fica destacada e fixa no topo do painel esquerdo.
- Zonas de arraste aparecem somente durante o arraste para reduzir acidentes.
- Dentro de bloco, não há controles de reordenação por música.

## Acessibilidade

- Toda ação de arraste possui alternativa por botão.
- Foco e teclado devem funcionar para selecionar abertura, adicionar item, mover segmento e remover.
- Popover de bloco fecha com Escape e restaura foco.
- Mensagens de conflito e duração parcial usam `role="status"` ou `role="alert"` conforme a gravidade.
