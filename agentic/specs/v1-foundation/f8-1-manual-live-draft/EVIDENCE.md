# F8.1 — Evidências

Status: implementada em `feat/f8-1-manual-live-draft`; aguardando revisão em PR draft.

## Implementação

- `migrations/009_f8_manual_live_drafts.sql` cria a persistência transitória `live_drafts`.
- `src/db/live-drafts.repository.ts` deriva opções elegíveis do catálogo, valida abertura obrigatória, mídia reproduzível, blocos como unidades, ordem interna e unicidade de `musicaBase`.
- `src/contracts.ts` define a composição de escrita estrita; `server.ts` expõe a API V1 de criação, leitura, atualização e exclusão.
- `frontend/src/app/pages/lives/` implementa o compositor Angular em duas colunas, cards do catálogo em duas colunas, abertura fixa, seleção por botões, prévia de bloco por clique, movimentação e persistência.
- `src/db/schema.ts` reflete a nova tabela sem modificar tabelas de catálogo, execução ou legado.

## Validação automatizada

Teste específico F8.1 passou: opções filtram música inativa e mídia local ausente, aceitam YouTube/local válido, preservam bloco, salvam/reabrem e não alteram `xEmLives`.

Comandos executados durante a implementação:

- `node --import tsx --test test/f8-1-manual-live-draft.test.ts` — passou.
- `npm run typecheck` — passou.
- `npm run build` — passou.
- `npm test` — passou: 47/47.
- `npm run lint` — passou.
- `git diff --check` — passou.

## Validação browser

- Rota validada: `http://127.0.0.1:8791/v1/lives`, com viewport padrão do navegador e banco/storage temporários em `/tmp`.
- A tela exibiu shell V1, “Nova live”, abertura, blocos, músicas sem bloco, pesquisa e controles “Adicionar”.
- Abertura foi escolhida e permaneceu fixa; música individual e bloco foram adicionados; o bloco apareceu como unidade com controles de mover no nível do segmento e sem controles internos.
- Duração exibida excluiu a abertura: 2 músicas, 0h 06min 50s.
- O primeiro salvamento revelou e corrigiu um excesso de campos de leitura no snapshot do bloco; após a correção, a API temporária confirmou a composição persistida e reaberta com abertura, música individual e bloco.
- `/legacy` não foi alterado; a regressão é coberta pelos testes existentes.
- A abertura direta do rascunho persistido exibiu a composição após refresh; `/legacy` abriu no mesmo servidor temporário.

## Compatibilidade e pendências

- `xEmLives`, catálogo, histórico, repertórios antigos e `/legacy` não são escritos pela F8.1.
- Seleção automática, execução, exportação e drag-and-drop não foram implementados; os botões e controles de teclado são o caminho funcional desta entrega.
- A interface ainda mostra o nome inicial “Nova live”; edição do nome do rascunho não faz parte do fluxo mínimo atual.
- Screenshots não foram versionados; a observação browser acima é a evidência visual reproduzível.
