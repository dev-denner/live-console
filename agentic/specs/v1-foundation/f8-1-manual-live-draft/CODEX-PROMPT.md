# Prompt para o Codex — F8.1

Você está trabalhando no repositório `dev-denner/live-console`.

Implemente a F8.1 — montagem manual de repertório em rascunho — conforme os artefatos:

- `agentic/specs/v1-foundation/f8-1-manual-live-draft/PRD.md`;
- `agentic/specs/v1-foundation/f8-1-manual-live-draft/TECHNICAL-SPEC.md`;
- `agentic/specs/v1-foundation/f8-1-manual-live-draft/LAYOUT-SPEC.md`;
- `docs/aidd/adr/ADR-003-manual-live-draft-composition.md`;
- `agentic/skills/build-manual-live-draft/SKILL.md`.

Antes de alterar código, leia também as regras V1, as skills de domínio e as implementações atuais de catálogo, blocos, versões, mídia e `/legacy`.

## Resultado esperado

Criar uma tela V1 para montar uma live manualmente:

- duas colunas em desktop, aproximadamente 40% para o rascunho e 60% para o catálogo;
- catálogo em duas colunas de cards;
- abertura em seção própria, obrigatória somente se existir abertura ativa e reproduzível;
- abertura fixa na primeira posição, substituível mas nunca movível;
- blocos adicionados como unidades e movidos como unidades;
- músicas sem bloco adicionadas e movidas individualmente;
- músicas internas de bloco sem reordenação na montagem;
- somente músicas ativas e com mídia válida;
- áudio local, vídeo local e YouTube tratados igualmente;
- `xEmLives` visível em cards e itens selecionados;
- contagem de músicas regulares e duração estimada em horas, minutos e segundos;
- abertura fora da contagem e da duração;
- duração parcial quando houver versões sem duração;
- salvar, fechar e reabrir o rascunho;
- não alterar `xEmLives`, catálogo, histórico ou `/legacy`.

Clique em “Adicionar” deve ser o fluxo principal. Drag-and-drop pode existir como atalho, mas deve ter alternativa por teclado e botões. Prévia de bloco deve abrir por clique/popover, não somente por hover.

Não implemente seleção automática, vibe/clima/objetivo, execução, reconciliação, exportação para `/legacy` ou redesign visual definitivo.

## Processo obrigatório

1. Faça diagnóstico curto do estado atual.
2. Atualize/crie migrations, contratos, API, repositório e frontend somente no escopo aprovado.
3. Preserve APIs e comportamentos existentes.
4. Adicione testes unitários/API e teste browser real.
5. Execute:

```bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

6. Valide no navegador: `/v1`, criação do rascunho, abertura, bloco, música individual, movimentação permitida, duração, salvamento, reabertura e `/legacy`.
7. Atualize `EVIDENCE.md` com comandos, resultado, screenshots e limitações.
8. Abra uma PR draft separada contra `master`, sem fazer merge.

O corpo da PR deve ser Markdown real, com quebras de linha reais, títulos, listas e tabelas quando úteis. Nunca escreva sequências literais `\\n` ou `\\r\\n` no corpo.
