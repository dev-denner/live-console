# Evidência F7

- [x] Formato documentado em `docs/import-format/musicas.schema.json` e `musicas.example.json`.
- [x] Importador aceita `musicas[]`, `versoes[]` e o formato legado `fontes[]`.
- [x] Contrato V1 usa `status` booleano; `ativo`, `principal`, duração no topo e campos de classificação descontinuados ficam somente no adaptador legado.
- [x] `musicaBase` identifica a obra lógica e `ordem: 1` identifica a versão principal.
- [x] Merge aditivo de versões coberto por teste automatizado.
- [x] Campos editáveis da música são atualizados sem alterar `xEmLives` existente.
- [x] Tela `/v1/importacao` tem prévia e confirmação explícita.
- [ ] Validação visual no navegador e publicação em PR ainda pendentes.
