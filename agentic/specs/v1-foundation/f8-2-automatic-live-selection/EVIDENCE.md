# F8.2 — Evidências

Status: implementada em `feat/f8-2-automatic-live-selection`; PR draft aguardando revisão.

## Dependência da F8.1

No início da tarefa, `origin/master` continha apenas as especificações da F8.1/F8.2. A implementação da F8.1 foi incorporada à branch de trabalho pelo merge commit `e1ef628`, sem duplicar o compositor. A PR da F8.2 fica empilhada sobre esse commit até a incorporação da F8.1 no master.

## Implementação

- `src/automatic-live-selection.mjs` implementa escolha de abertura, unidades de bloco/música, busca dinâmica finita até 200 músicas, fallback para a maior quantidade abaixo da referência, meta de autorais, menor `xEmLives` e desempate por seed.
- `migrations/010_f8_2_generation_metadata.sql` e `src/db/schema.ts` persistem metadados da geração no rascunho.
- `src/db/live-drafts.repository.ts`, `src/contracts.ts` e `server.ts` expõem `POST /api/v1/live-drafts/generate`, sem tocar execução ou `xEmLives`.
- A tela F8.1 recebeu o formulário de geração automática. A regeneração cria outro rascunho editável, preservando o rascunho anterior.

## Validação automatizada

| Comando | Resultado |
| --- | --- |
| `npm test` | passou: 51/51 |
| `npm run typecheck` | passou |
| `npm run lint` | passou |
| `npm run build` | passou |
| `git diff --check` | passou |

Testes específicos cobrem alvo exato, fallback finito, limite sem ultrapassar a referência, abertura não tocada, abertura fora da contagem, autoria, endpoint padrão 30 e `xEmLives` inalterado.

## Validação no navegador

- URL: `http://127.0.0.1:8792/v1/lives` em servidor isolado com banco/storage temporários em `/tmp`.
- Formulário exibiu quantidade padrão 30 e autorais desejadas, sem campos de vibe/clima/objetivo.
- Geração com referência 2 e uma autoral exibiu resumo `2` selecionadas e `1` autoral, com abertura fixa, bloco e música individual.
- Resultado automático permaneceu editável: uma unidade foi movida, salva e reaberta por URL direta.
- `xEmLives` permaneceu apenas informativo; `/legacy` abriu no mesmo servidor.

## Compatibilidade e limitações

- Não houve alteração automática de catálogo, histórico, execução, `xEmLives` ou `/legacy`.
- O gerador seleciona músicas e usa a versão principal apenas como snapshot necessário ao contrato atual do compositor; não cria seleção operacional de versão.
- Drag-and-drop, execução, exportação Legacy e filtros por vibe/clima/objetivo permanecem fora do escopo.
