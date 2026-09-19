# Arquitetura

O Live Console mantém SQLite local como armazenamento autoritativo. As migrations SQL em `migrations/` são aplicadas pelo executor existente; schemas e repositórios Drizzle usam a mesma conexão e não introduzem uma cadeia de migrations paralela.

## Superfícies web

A aplicação Angular é a superfície principal e é servida na raiz (`/`), com navegação interna em `/catalogo`, `/lives`, `/blocos`, `/importacao` e `/execucao`. O servidor entrega o `index.html` Angular como fallback para essas rotas e para refresh direto. O console histórico baseado em JSON é mantido isoladamente em `/legacy`; não há páginas administrativas sob esse namespace. Rotas antigas com prefixo `/v1` apenas redirecionam para a equivalente na raiz.

Os endpoints HTTP da aplicação permanecem sob `/api` e `/api/v1`, preservando os contratos já usados pelo frontend e pelos clientes existentes. Essa mudança de mount não altera banco, migrations, mídia ou repertórios legados.

Blocos reutilizáveis são `blocos` ligados a `musicas` por `musicas_do_bloco`. É uma relação muitos-para-muitos com ordem única e positiva por bloco. Ela é distinta do campo textual histórico `musicas.bloco`, que permanece uma classificação do catálogo sem sincronização automática.

Ao adicionar um bloco a uma live em rascunho, a aplicação copia a referência principal literal de cada música para novos itens, em uma única transação. Itens existentes, seus campos de observação/interações, o catálogo e `xEmLives` não são alterados.
