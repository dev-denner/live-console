# Evidência — F7.1 Verificação visual da importação

## Disponibilidade dos artefatos solicitados

Os arquivos `PRD.md`, `TECHNICAL-SPEC.md`, `EVIDENCE.md`, o ADR-002 e a skill `live-console-import-visual-verification` não existiam neste checkout. A implementação encontrada corresponde à F7 canônica documentada em `agentic/specs/v1-foundation/f7-catalog-import-export/` e à PR #42, já incorporada em `master`. Esta evidência registra a revisão complementar executada sobre essa implementação.

## Diagnóstico

- `git status` iniciou limpo em `master`; a PR relacionada é a #42 (`feat/f7-catalog-import-export`), já `MERGED`.
- O build Angular foi executado e serviu `main-XJNDVL54.js`, com `base href="/v1/"`.
- `/v1` redirecionou para o shell Angular; `/v1/importacao` e refresh direto carregaram `ImportacaoPageComponent`.
- `Importar` apareceu na navegação V1.
- Prévia funcionava, mas confirmação falhava com `table musicas has no column named status_ativo`.
- A causa era o build incremental: `cp -R migrations dist/migrations` copiava para um destino já existente e criava `dist/migrations/migrations`; o servidor `dist/server.js` usava o mesmo worktree, mas o bundle runtime não tinha a migration `008_v1_status_canonical.sql` na raiz esperada.

## Correção

- `package.json`: limpa somente `dist/migrations`, `dist/docs` e `dist/legacy` antes de repopular os artefatos gerados.
- `test/f7-import-export.test.mjs`: protege o contrato visual da rota e a limpeza do build.
- Este arquivo documenta a validação visual complementar solicitada.

Não foram alterados `/legacy`, repertórios antigos, contratos legados, `xEmLives`, nem a API funcional da importação.

## Validação browser

Servidor temporário: `http://127.0.0.1:8788`, com banco `/tmp/live-console-f7-visual.sqlite` e storage temporário. Ambos os processos observados tinham cwd `/home/denner/projects/denner/live-console`; a porta foi confirmada no processo criado para o build corrigido.

Viewport headless: `1280x576`.

Fluxo executado:

1. `/v1` abriu o shell e exibiu `Importar`.
2. `/v1/importacao` abriu diretamente e após refresh.
3. A fixture oficial `docs/import-format/musicas.example.json` foi selecionada.
4. A prévia exibiu: 1 música nova, 0 atualizadas, 2 versões acrescentadas, 0 atualizadas, 0 existentes e 0 rejeitadas.
5. A confirmação exibiu `Importação concluída sem substituir versões anteriores.`.
6. O link `Exportar catálogo` apontou para `/api/exportacao`.
7. `/legacy` abriu o console histórico.
8. Console e coleta de erros do navegador não registraram erros.

Screenshots: `/tmp/f7-import-idle.png` e `/tmp/f7-preview.png`.

Contrato exportado após confirmação: `status` booleano, ausência de `ativo`, `versoes[]` presente, duração `240` na versão e `xEmLives` igual a `0`.

## Validação automatizada

| Comando | Resultado |
| --- | --- |
| `npm test` | passou: 38/38 |
| `npm run typecheck` | passou |
| `npm run lint` | passou |
| `npm run build` | passou; migration 008 presente em `dist/migrations/` |
| `git diff --check` | passou |

Resultado: PASS. A PR de correção deve permanecer draft até revisão/aprovação; não fazer merge automático.


## Artefatos de arquitetura adicionados após a implementação

- PRD e especificação técnica F7.1 adicionados ao mesmo diretório.
- ADR-002 registra que a importação canônica deve ser validada no bundle servido em `/v1/importacao`.
- Skill e prompt operacional adicionados para repetir a verificação no Codex.
