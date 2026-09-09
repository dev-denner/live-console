# Arquitetura

O Live Console mantém SQLite local como armazenamento autoritativo. As migrations SQL em `migrations/` são aplicadas pelo executor existente; schemas e repositórios Drizzle usam a mesma conexão e não introduzem uma cadeia de migrations paralela.

Blocos reutilizáveis são `blocos` ligados a `musicas` por `musicas_do_bloco`. É uma relação muitos-para-muitos com ordem única e positiva por bloco. Ela é distinta do campo textual histórico `musicas.bloco`, que permanece uma classificação do catálogo sem sincronização automática.

Ao adicionar um bloco a uma live em rascunho, a aplicação copia a referência principal literal de cada música para novos itens, em uma única transação. Itens existentes, seus campos de observação/interações, o catálogo e `xEmLives` não são alterados.
