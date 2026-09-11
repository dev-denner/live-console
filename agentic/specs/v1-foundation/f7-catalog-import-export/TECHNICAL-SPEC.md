# F7 — Especificação técnica

## Backend

- `POST /api/importacao/previa` normaliza `versoes[]`/`fontes[]`, valida cada item e não grava.
- `POST /api/importacao/confirmar` repete a validação e aplica em transação, salvo quando `partial=true` for explicitamente enviado.
- `GET /api/exportacao` exporta o contrato V1 canônico com `status` booleano e `versoes[]`; `fontes[]` permanece apenas como entrada legada temporária.
- `src/importer.mjs` mantém a identidade da música e faz o merge aditivo das linhas em `fontes_musica`.

## Frontend

- `frontend/src/app/pages/importacao/` contém a tela standalone de seleção, prévia, relatório, confirmação e exportação.
- A rota é `/v1/importacao` e a navegação V1 expõe `Importar`.
- A tela possui estados de leitura, validação, sucesso e erro; a confirmação fica bloqueada quando há rejeições e o modo parcial não foi marcado.

## Integridade

O teste de catálogo cobre uma primeira importação com duas versões e uma segunda importação com uma versão existente atualizada e uma nova versão. O resultado deve manter três versões e o mesmo `xEmLives`.
