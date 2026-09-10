# F4 — Especificação técnica

## Diagnóstico da base

O branch padrão pós-PR #31 é `master`, no merge `b9c572610f0889a3b61cb66e84e3b94730a8355d`. A aplicação V1 é Angular 20 standalone com TypeScript strict sob `frontend/`, servida pelo Fastify em `/v1`.

O contrato existente já atende à leitura: `GET /api/musicas` chama `listMusic(database, request.query)` e devolve `{ musicas: [...] }`. `listMusic` aceita `q`, `status`, `autoral`, `bloco` e `clima`, ordena por artista/título e anexa `fontes`. O schema SQL autoritativo é `migrations/001_catalogo.sql`; os campos de leitura são `musica_base`, `x_em_lives`, `autoral`, `bloco`, `clima` e as fontes `tipo`/`nome`. Não foi necessário criar endpoint ou migration.

## Plano

1. Modelar o payload snake_case atual e a resposta `{ musicas }`.
2. Criar serviço de leitura com query string tipada e validação de forma.
3. Substituir somente o placeholder da rota `catalogo` por uma página de listagem.
4. Implementar filtros, estados e layout responsivo sobre o sistema visual F3.
5. Cobrir contrato/endpoint e executar browser com dados sintéticos em banco temporário.
6. Auditar acessibilidade/UX, documentar evidências e publicar draft sem merge.

## Arquivos permitidos

- `frontend/src/app/app.routes.ts`;
- `frontend/src/app/pages/catalogo/`;
- `test/foundation-f4.test.mjs`;
- `agentic/specs/v1-foundation/f4-catalog-read/`.

Não alterar `legacy/`, HTML antigo da raiz, backend de escrita, migrations, schema, banco, mídia, repertórios ou contratos legados.

## Contratos

```ts
GET /api/musicas?q=&status=&autoral=true|false&bloco=&clima=
{ musicas: CatalogMusic[] }
```

`CatalogMusic` preserva os nomes snake_case devolvidos pelo repositório. A fonte principal (ou a primeira, se não houver principal) fornece `mídia = tipo` e `versão = nome`; nenhuma URL de mídia é exibida ou enviada a serviço externo.

## Estados e interação

- `loading`: skeleton com `aria-busy`;
- `success`: tabela com contagem e dados;
- `empty`: mensagem e ação para limpar filtros;
- `error`: mensagem normalizada e botão `Tentar novamente`;
- mudança de filtro: nova leitura; busca acompanha a digitação;
- foco visível, labels, região de erro e layout tabular com cabeçalhos semânticos visuais.

Signals locais permanecem suficientes; não adicionar store nem `@angular/forms`, ausente da base.

## Segurança e compatibilidade

O endpoint usado é GET e não há mutação na página. O cliente rejeita payload incompatível, não registra referências, não inclui arquivos pessoais e não altera a separação `/legacy`. Os placeholders das demais rotas permanecem intactos.

## Validação

Executar `npm run build`, `npm run typecheck`, `npm run lint`, `npm test`, `git diff --check`; validar browser os cinco estados, filtros, notebook/tablet e `/legacy`.
