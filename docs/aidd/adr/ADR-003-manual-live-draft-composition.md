# ADR-003: Composição manual de live em rascunho

- Status: proposed for approval
- Date: 2026-09-11
- Scope: Live Console V1 / F8.1

## Contexto

O catálogo V1 já possui músicas, versões, blocos, status ativo, mídias locais/YouTube e `xEmLives`. A próxima necessidade é montar uma live manualmente, sem transformar essa montagem em execução e sem causar alterações no catálogo.

## Decisões

1. A tela será um compositor manual, não um gerador automático.
2. Aberturas são versões com `abertura: true`, ficam fora da contagem e da duração das músicas e permanecem fixas na primeira posição.
3. Abertura é obrigatória somente quando existir uma opção ativa e reproduzível.
4. O catálogo mostra apenas músicas ativas e mídias válidas.
5. Blocos são unidades móveis; a ordem interna pertence ao cadastro do bloco e não pode ser alterada no rascunho.
6. Músicas sem bloco são unidades móveis individuais.
7. A mesma `musicaBase` não pode ser incluída duas vezes.
8. O rascunho será persistido como composição JSON validada, com snapshots dos itens selecionados. A normalização para histórico de execução fica para uma fase posterior.
9. A interação principal será por clique em “Adicionar”; drag-and-drop será atalho, sempre com alternativa por teclado/botões.
10. `xEmLives` será exibido como informação de apoio e não será modificado.

## Consequências

- A montagem fica previsível e reversível.
- A abertura não pode ser deslocada acidentalmente.
- A ordem interna dos blocos permanece centralizada no cadastro.
- A persistência do rascunho não exige antecipar todo o modelo de execução.
- Será necessário detectar alterações do catálogo ao reabrir um rascunho.

## Fora desta decisão

- seleção automática por vibe, clima ou objetivo;
- reconciliação de execução;
- exportação para `/legacy`;
- redesign visual definitivo;
- incremento de `xEmLives`.
