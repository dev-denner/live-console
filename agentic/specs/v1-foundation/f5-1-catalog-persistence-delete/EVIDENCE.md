# F5.1 — Evidências

Status: implementação validada localmente; PR draft separado, sem merge.

## Escopo validado

- [x] POST de criação funcionando.
- [x] GET de detalhe funcionando.
- [x] PUT de edição funcionando.
- [x] DELETE com confirmação funcionando.
- [x] Relações de bloco removidas.
- [x] Letra Markdown removida.
- [x] Áudio/vídeo local removidos.
- [x] URLs YouTube preservadas como referência.
- [x] Staging promovido somente no salvamento final.
- [x] Rollback sem registro incompleto ou mídia órfã.
- [x] `xEmLives` inalterado.
- [x] `/legacy` preservado.

## Arquivos alterados

- `server.ts` — rotas V1, validação, staging, rollback, quarentena e URLs HTTP.
- `src/db/repositories.ts` — snapshot/remoção transacional do agregado e vínculos.
- `frontend/src/app/pages/catalogo/` — exclusão confirmada, cancelamento, reload e referências locais.
- `test/f5-music-registration.test.ts` — DELETE, compartilhamento, rollback e IDs inexistentes.
- `EVIDENCE.md` — esta evidência.

## Comandos

- `npm test` — passou, 29 testes.
- `npm run typecheck` — passou.
- `npm run lint` — passou.
- `npm run build` — passou.
- `git diff --check` — passou.

## Testes

- API/repositório: POST, GET, PUT, DELETE, Markdown UTF-8, versões/ordens, YouTube literal, áudio/vídeo staged, rollback, compartilhamento, vínculos de bloco, ID 404 e `xEmLives`.
- F5 existente: 4 testes passaram.
- F5.1 novo: 3 testes passaram.
- `npm test`: 29/29 passaram e o processo encerrou normalmente.

## Browser

- criação: música com letra e versão YouTube apareceu no catálogo; requisição observada em `POST /api/v1/musicas` (201).
- edição: reabertura carregou a letra; edição retornou 200, fechou o diálogo e atualizou a lista.
- cancelamento da exclusão: diálogo explícito permaneceu cancelável e a música continuou listada.
- exclusão e limpeza: confirmação removeu o item e exibiu o estado vazio; teste automatizado confirmou remoção de letra, áudio, vídeo e vínculo, sem apagar URL YouTube.
- regressão `/legacy`: navegador exibiu o console histórico com “Abrir live”, “Adicionar pasta” e “Iniciar live”.
- navegador: `agent-browser`, sessão `f51-live-console`, `http://127.0.0.1:8788/v1/catalogo`; dados temporários em `/tmp`.

## Riscos

- remoção física precisa ser protegida contra referências compartilhadas;
- falhas de filesystem devem deixar diagnóstico operacional;
- janitor TTL de staging continua sendo follow-up da F5;
- F6 permanece fora deste escopo.

## Compatibilidade e segurança

- Exclusão bloqueia referências compartilhadas e vínculos com lives para não alterar planejamento/execution data.
- Artefatos exclusivos são movidos para quarentena antes da transação e restaurados se ela falhar; falha pós-commit da limpeza retorna erro operacional com a quarentena identificada.
- O cliente nunca envia `xEmLives`, nem recebe caminho absoluto; mídia local usa `/media/musicas/...` ou `/media/videos/...`.
- `/legacy`, blocos, importação e geração automática de lives não foram alterados.

## Correção complementar F5.1 — campo ativo e apresentação V1

- [x] Criação usa `ativo = true` por padrão e aceita `ativo = false`.
- [x] Edição persiste alternância ativo/inativo; GET de detalhe e listagem V1 devolvem o valor.
- [x] Listagem V1 usa `ATIVA`, badges `Ativa`/`Inativa` e filtros `Todas`/`Ativas`/`Inativas`.
- [x] Interface V1 não exibe status legado, bloco, clima ou base; `/api/musicas` e `/legacy` permanecem compatíveis.
- [x] Título completo tem quebra responsiva e tooltip/label acessível.
- [x] Mídia e versão usam rótulos amigáveis; ordem 1 aparece como `Versão principal`.
- [x] Diálogos iniciam no topo, permanecem na viewport e preservam foco/Escape na hierarquia pai-filho.

## Validação complementar

- `npm test` — passou, 30 testes.
- `npm run typecheck` — passou.
- `npm run lint` — passou.
- `npm run build` — passou.
- `git diff --check` — passou.
- Navegador: catálogo V1 confirmou filtros, coluna `ATIVA`, ausência de filtros bloco/clima, checkbox rotulado, diálogo pai no topo, diálogo filho com foco/Escape e restauração do foco.
- Navegador com banco/storage temporários: criação ativa e edição/reabertura foram exercitadas; a cobertura API confirmou criação inativa, alternância e filtros.
- `/legacy` não foi alterado e a rota continua separada da V1.
