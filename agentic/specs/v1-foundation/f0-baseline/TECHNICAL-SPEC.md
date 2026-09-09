# F0 — Especificação técnica

## Diagnóstico

Stack verificada: Node.js ESM, TypeScript, Fastify 5, Zod, `node:sqlite`/DatabaseSync, Drizzle ORM com `sqlite-proxy`, HTML/CSS/JavaScript sem framework. Scripts: `build`, `start`, `dev`, `db:migrate`, `typecheck`, `lint`, `test`. Entrypoint de produção: `server.ts` compilado para `dist/server.js`; migrations são copiadas para `dist/migrations` e o executor é `src/migrate.mjs`.

## Mapa de rotas

| Método | Caminho | Finalidade | Risco |
|---|---|---|---|
| GET | `/` | console legado | alto: links/assets relativos |
| GET | `/catalogo` | catálogo | alto: HTML inline + APIs |
| GET | `/lives` | lives manuais | alto: contrato legado |
| GET | `/blocos` | blocos N:N | médio |
| GET | `/execucao` | execução local | médio |
| GET | `/api/health` | saúde | baixo |
| CRUD | `/api/musicas*` | catálogo/fontes/letras | alto |
| POST | `/api/importacao/*` | prévia/confirmação | alto |
| GET | `/api/exportacao` | exportação legada | alto |
| CRUD | `/api/lives*` | planejamento | alto |
| CRUD | `/api/blocos*` | agrupamentos | médio |
| POST/GET | `/api/lives/:id/montagem/*` | montagem determinística | médio |
| POST/GET | `/api/lives/:id/execucao*` | execução/histórico | alto |

## Contratos e invariantes

Migrations `001`–`005` e `src/migrate.mjs` são a autoridade. Repositórios de produção estão em `src/db/repositories.ts`, schemas em `src/db/schema.ts`; `src/db.mjs` é compatibilidade. O catálogo preserva `x_em_lives`, status literal `OK`, `musica_base`, fontes e letras. Execução registra estados/eventos e só altera `x_em_lives` em transição explícita para `tocada`.

O repertório legado preserva `titulo`, `artista`, `fonte`, `youtube`, `arquivo`, `letra`, `observacao` e `interacoes`; referências são opacas/literais.

## Arquivos e privacidade

`data/`, `storage/`, `musicas/`, `letras/`, `repertorios/`, `node_modules/`, `dist/` e SQLite são locais/ignorados. `.mcp.json` está não rastreado. Uploads são limitados ao storage e extensões permitidas; desvinculação não remove arquivos físicos.

## Isolamento futuro `/legacy`

1. Montar assets atuais sob `/legacy`: menor mudança, mas exige revisão de links relativos.
2. Diretório próprio servido pelo Fastify: melhor isolamento e testes, com adaptação de caminhos.
3. Rewrite: preserva URLs, mas aumenta complexidade e risco de APIs/assets divergirem.

Recomendação F1: diretório próprio servido pelo Fastify, com contrato explícito de base URL e testes browser; é reversível e compatível com Angular sem alterar APIs.

## Testes/rollback

Repetir build, migrations, typecheck, lint, testes, smoke e jornadas browser antes de cada mudança. Rollback da F1 deve ser remoção do mount/rewrite mantendo o servidor v0 e migrations intactos; não apagar banco ou arquivos.
