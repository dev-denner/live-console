# Especificação técnica F1

## Estratégia

O Fastify adiciona uma única rota de página:

```text
/legacy
```

Essa rota serve `legacy/index.html`, extraído do commit histórico `1f8a2e6`, anterior ao SQLite e ao catálogo.

O documento é autocontido, lê o arquivo JSON pela File API e preserva o fluxo original de início de live.

## Mapeamento

| Rota | Comportamento |
|---|---|
| `/` | aplicação atual |
| `/catalogo` | catálogo atual |
| `/lives` | lives atuais |
| `/blocos` | blocos atuais |
| `/execucao` | execução atual |
| `/legacy` | console v0 histórico baseado em JSON |
| `/legacy/catalogo` | 404 |
| `/legacy/lives` | 404 |
| `/legacy/blocos` | 404 |
| `/legacy/execucao` | 404 |

O build copia `legacy/` para `dist/legacy`. Não existem páginas administrativas dentro de `/legacy`.

## Contratos preservados

Todas as APIs permanecem em `/api/*`, com os payloads JSON atuais.

SQLite, migrations, Drizzle, exportação legada, repertórios e invariantes de `xEmLives` não são alterados.

O console v0 continua aceitando o formato legado, incluindo:

```json
{
  "titulo": "...",
  "artista": "...",
  "fonte": "youtube",
  "youtube": "...",
  "arquivo": "...",
  "letra": "...",
  "observacao": "...",
  "interacoes": []
}
```

## Refresh e rollback

`/legacy` deve retornar o console histórico após refresh. Rotas administrativas atuais continuam sendo servidas na raiz.

Rotas desconhecidas do namespace legado retornam 404.

Reverter consiste em remover o handler de `/legacy`, o asset histórico e sua cópia no build. Nenhum dado persistido é afetado.

## Testes

Build, migration em SQLite temporário, typecheck, lint, testes unitários e smoke HTTP devem passar.

A jornada browser deve abrir diretamente `/legacy`, selecionar um fixture JSON, carregar a lista, iniciar a live, trocar de música, verificar letra/interações e tratar JSON inválido.

Se a ferramenta browser estiver indisponível, o resultado deve ser classificado como `BLOQUEADO`, nunca como sucesso.

## Arquivos alterados

A implementação altera apenas o necessário para:

- servir `/legacy`;
- copiar o asset histórico no build;
- manter o fixture/teste de regressão;
- documentar o contrato.

Não altera migrations, schema, repositórios ou dados locais.
