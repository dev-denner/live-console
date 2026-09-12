# F8.2 — Evidências

Status: corrigida em `feat/f8-2-automatic-live-selection`; PR draft aguardando revisão.

## Dependência da F8.1

`origin/master` foi atualizado para `7bcdc35` com a F8.1 mergeada. A branch foi rebased sobre essa base; os conflitos dos arquivos antigos da F8.1 foram resolvidos preservando a implementação já mergeada, sem migration duplicada.

## Implementação

- `src/automatic-live-selection.mjs` implementa escolha de abertura, unidades de bloco/música por `musicaId`, busca finita limitada a 200 músicas, tentativa da quantidade exata, fallback para a maior quantidade abaixo da referência, meta de autorais, menor `xEmLives` e desempate determinístico por seed.
- A seleção rejeita unidades inválidas ou sobrepostas, mantém blocos indivisíveis e remove somente a abertura compartilhada; unidades vazias não entram no resultado.
- `migrations/010_f8_2_generation_metadata.sql` e `src/db/schema.ts` persistem metadados da geração no rascunho.
- `src/db/live-drafts.repository.ts`, `src/contracts.ts` e `server.ts` expõem `POST /api/v1/live-drafts/generate`, sem tocar execução ou `xEmLives`.
- A tela F8.1 recebeu o formulário de geração automática. Um bloco fica desabilitado quando qualquer música sua já está no rascunho; a prévia usa o bloco já ajustado pela abertura. A regeneração cria outro rascunho editável, preservando o rascunho anterior.

## Validação automatizada

| Comando | Resultado |
| --- | --- |
| `node --import tsx --test test/f8-2-automatic-live-selection.test.mjs` | passou: 8/8 |
| `npm test` | passou |
| `npm run typecheck` | passou |
| `npm run lint` | passou |
| `npm run build` | passou |
| `git diff --check` | passou |

Testes específicos cobrem alvo exato, referência padrão 30, fallback finito, término garantido, autoria, abertura não tocada e menor `xEmLives`, abertura dentro de bloco, bloco somente com abertura, blocos inválidos, áudio/vídeo locais, ausência de preferência por YouTube, identidade por `musicaId`, bases iguais em IDs distintos, `xEmLives`, regeneração preservadora, edição manual posterior e bloqueio visual de bloco quando qualquer item já foi usado.

## Validação no navegador

- URL: `http://127.0.0.1:8792/v1/lives` em servidor isolado com banco/storage temporários em `/tmp`.
- Formulário exibiu quantidade padrão 30 e autorais desejadas, sem campos de vibe/clima/objetivo.
- Geração com referência reduzida exibiu o aviso de quantidade quando necessário, com abertura fixa e bloco compartilhado sem a abertura reservada.
- Resultado automático permaneceu editável: bloco e música individual foram movidos, salvos e reabertos por URL direta (`/v1/lives/3159e90c-173f-491d-a500-faa134eb324d`); a regeneração não apagou o rascunho manual anterior.
- Foi encontrado e corrigido um erro de navegação: a geração criava um novo rascunho, mas mantinha a URL do rascunho anterior; a navegação agora aponta para o novo ID antes do salvamento/refresh.
- `xEmLives` permaneceu apenas informativo; `/legacy` abriu no mesmo servidor.

## Compatibilidade e limitações

- Não houve alteração automática de catálogo, histórico, execução, `xEmLives` ou `/legacy`.
- O gerador seleciona músicas e usa a versão principal apenas como snapshot necessário ao contrato atual do compositor; não cria seleção operacional de versão.
- A composição gerada usa a abertura no campo fixo, não conta a abertura na quantidade/duração e mantém a ordem interna dos blocos.
- Drag-and-drop, execução, exportação Legacy e filtros por vibe/clima/objetivo permanecem fora do escopo.
