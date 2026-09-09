# Especificação técnica F1

## Estratégia

O Fastify mantém os arquivos na raiz e adiciona um mount explícito com mapa de páginas. `sendLegacyPage` lê o mesmo HTML usado pelo v0 e altera somente `href` absolutos que apontam para páginas internas (`/`, `/catalogo`, `/lives`, `/blocos`, `/execucao`). Chamadas `/api/*`, `/local`, uploads, letras, mídia e scripts permanecem sem transformação.

## Mapeamento

| Rota | Arquivo |
|---|---|
| `/legacy`, `/legacy/` | `index.html` |
| `/legacy/catalogo` | `catalogo.html` |
| `/legacy/lives` | `lives.html` |
| `/legacy/blocos` | `blocos.html` |
| `/legacy/execucao` | `execucao.html` |

Assets continuam sendo servidos pelo wildcard existente a partir do diretório compilado; portanto `/catalogo-manual.js` e demais referências conservam sua base previsível. A raiz `/` não é redirecionada.

## Contratos preservados

Todas as APIs permanecem em `/api/*`, com os payloads JSON atuais. SQLite, migrations, Drizzle, exportação legada, repertórios e invariantes de `xEmLives` não são alterados.

## Refresh, deep links e rollback

Cada rota possui handler próprio antes do wildcard; refresh devolve o mesmo documento e desconhecidos retornam 404. Reverter consiste em remover os handlers/helper e o diretório de especificação; nenhum dado persistido é afetado.

## Testes

Build, migration em SQLite temporário, typecheck, lint, testes unitários, smoke HTTP das páginas/API e verificação de CSS/JS. Jornadas browser devem ser executadas quando o agente de navegador estiver disponível; indisponibilidade é `BLOQUEADO`, não evidência de sucesso.

## Arquivos de produção alterados

Somente `server.ts`; nenhuma migration, schema, repositório, HTML ou asset foi reescrito.
