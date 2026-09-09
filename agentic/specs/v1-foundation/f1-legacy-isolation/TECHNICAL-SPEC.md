# Especificação técnica F1

## Estratégia

O Fastify adiciona uma única rota `/legacy` que serve `legacy/index.html`, extraído do commit histórico `1f8a2e6` (antes do SQLite e catálogo). O documento é autocontido e lê JSON via File API; `/local` continua disponível apenas para referências locais quando o iniciador/servidor é usado.

## Mapeamento

| Rota | Arquivo |
|---|---|
| `/legacy` | `legacy/index.html` |

O build copia `legacy/` para `dist/legacy`. Não existem rotas de página `/legacy/catalogo`, `/legacy/lives`, `/legacy/blocos` ou `/legacy/execucao`; a raiz e essas páginas atuais não são redirecionadas.

## Contratos preservados

Todas as APIs permanecem em `/api/*`, com os payloads JSON atuais. SQLite, migrations, Drizzle, exportação legada, repertórios e invariantes de `xEmLives` não são alterados.

## Refresh, deep links e rollback

Cada rota possui handler próprio antes do wildcard; refresh devolve o mesmo documento e desconhecidos retornam 404. Reverter consiste em remover os handlers/helper e o diretório de especificação; nenhum dado persistido é afetado.

## Testes

Build, migration em SQLite temporário, typecheck, lint, testes unitários, smoke HTTP das páginas/API e verificação de CSS/JS. Jornadas browser devem ser executadas quando o agente de navegador estiver disponível; indisponibilidade é `BLOQUEADO`, não evidência de sucesso.

## Arquivos de produção alterados

Somente `server.ts`; nenhuma migration, schema, repositório, HTML ou asset foi reescrito.
