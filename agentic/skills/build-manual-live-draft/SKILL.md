---
name: build-manual-live-draft
description: Implementar e validar o compositor manual de rascunhos de live do Live Console V1, com abertura fixa, blocos móveis e músicas individuais, sem seleção automática ou alteração do histórico.
---

# Build manual live draft

Use esta skill somente para a F8.1 do Live Console. Leia antes:

- `agentic/rules/live-console-v1.md`;
- `agentic/skills/aidd-feature/SKILL.md`;
- `agentic/specs/v1-foundation/f8-1-manual-live-draft/PRD.md`;
- `agentic/specs/v1-foundation/f8-1-manual-live-draft/TECHNICAL-SPEC.md`;
- `agentic/specs/v1-foundation/f8-1-manual-live-draft/LAYOUT-SPEC.md`;
- `docs/aidd/adr/ADR-003-manual-live-draft-composition.md`.

## Invariantes

- não implementar seleção automática;
- não exigir quantidade total de músicas;
- abertura fixa na primeira posição, substituível mas não arrastável;
- abertura fora da contagem e da duração;
- só exibir músicas ativas e mídias reproduzíveis;
- blocos movem como unidades e preservam a ordem interna;
- músicas sem bloco movem individualmente;
- impedir duplicação por `musicaBase`;
- exibir `xEmLives` sem alterá-lo;
- não alterar `/legacy`, catálogo ou histórico de execução.

## Procedimento

1. Inspecionar rotas, contratos, migrations, componentes e testes V1 atuais.
2. Implementar primeiro o contrato de opções e validação atômica do rascunho.
3. Implementar a composição Angular em duas colunas, com clique como interação principal.
4. Adicionar drag-and-drop somente com zonas explícitas e alternativas acessíveis.
5. Cobrir abertura, blocos, músicas sem bloco, conflitos, duração parcial e persistência.
6. Validar no navegador criação, seleção, substituição da abertura, movimentação, salvamento, reabertura e `/legacy`.
7. Atualizar `EVIDENCE.md`, mantendo o corpo da PR em Markdown real.

Não faça merge automaticamente. Ao concluir, crie commit semântico, abra PR draft contra `master` e informe SHA, testes, evidências e pendências.
