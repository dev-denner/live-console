# Live Console

Console legado em `/` e catálogo local em `/catalogo`. Requer Node.js **22.13.0 ou superior**, pois usa `node:sqlite`.

## Arquitetura

A aplicação está em migração incremental para TypeScript estrito. O servidor de entrada agora é `server.ts`, usa Fastify e valida os contratos HTTP com Zod. A camada SQLite e o importador continuam compatíveis com o catálogo publicado, para que a transição não altere dados, URLs, caminhos ou o formato dos repertórios legados.

Não há NestJS nesta fase: para uma aplicação local de um único processo, Fastify mantém a API estruturada sem introduzir módulos, decorators e infraestrutura que ainda não são necessários. Quando houver autenticação, jobs, integrações externas e módulos de domínio maiores, essa decisão poderá ser reavaliada.

```bash
npm run db:migrate
npm start
npm run typecheck
npm test
```

`npm run dev` inicia o servidor TypeScript em modo observação. `npm run lint` usa o verificador do TypeScript; a suíte cobre tanto a compatibilidade legada quanto o contrato da nova aplicação Fastify.

Abra `http://localhost:8787/` para o console legado e `http://localhost:8787/catalogo` para o catálogo. O banco é `data/live-console.sqlite` e é criado pelas migrations transacionais. Faça backup copiando esse arquivo com a aplicação parada e, ao mudar de computador, copie também `storage/`.

O catálogo permite criar, editar, pesquisar, filtrar, importar/exportar JSON e manter referências de YouTube, áudio e vídeo. A identidade da importação é `artista + titulo + musicaBase` (com `musicaBase=titulo` quando ausente); uma referência é identificada por `tipo + referencia`. URLs e caminhos são tratados literalmente. A prévia não grava nada; a confirmação revalida, é atômica por padrão e aceita modo parcial explícito. `xEmLives` existente nunca é atualizado pela importação.

Uploads aceitam áudio, vídeo e letras `.txt`/`.md`, com nomes aleatórios sob `storage/audio`, `storage/video` e `storage/letras`. O cliente nunca escolhe o caminho de destino. Banco, uploads, repertórios pessoais e mídias estão no `.gitignore`; desvincular um cadastro não remove o arquivo físico.

O console legado continua carregando seus JSONs sem migração e preserva `youtube`, `arquivo`, `letra`, `observacao` e `interacoes` como estavam. Uma fixture fictícia em testes cobre esse formato.

Formato: veja `docs/import-format/musicas.schema.json` e `musicas.example.json`. A exportação JSON pode ser reimportada em um banco vazio.

## Blocos reutilizáveis

`/blocos` mantém grupos reutilizáveis em uma relação N:N com músicas, com ordem independente em cada bloco. Um bloco pode ser incluído manualmente apenas em uma live em rascunho: a referência principal atual é copiada literalmente para cada novo item, sem alterar catálogo ou `xEmLives`. Duplicatas já presentes são informadas e ignoradas; qualquer música sem fonte principal interrompe toda a inclusão. O campo textual histórico `bloco` do catálogo continua independente e nunca é sincronizado com esses vínculos.
