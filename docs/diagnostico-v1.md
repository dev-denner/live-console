# Diagnóstico e evolução v1.0 local

## Estado encontrado

- Stack: Node.js ESM sem dependências; `index.html` contém o frontend atual e
  `server.mjs` entrega os arquivos locais.
- O console abre repertórios JSON locais e consome os campos históricos
  `youtube`, `arquivo`, `letra`, `observacao` e `interacoes`.
- Registros de execução são produzidos no navegador; não há banco, API de
  catálogo, testes, README ou migrations ainda.
- Há catálogo XLSX, repertórios, músicas e letras pessoais no diretório de
  trabalho. O repositório ainda não possui commit inicial.

## Riscos tratados primeiro

O `.gitignore` impede versionar banco SQLite, mídias, letras, importações,
exportações e repertórios pessoais. Nenhum arquivo existente foi removido.

## Evolução incremental

1. `src/` recebe a camada SQLite, migration e importador idempotente.
2. `server.mjs` mantém o console legado e adiciona API local de catálogo/upload.
3. Uma tela de catálogo é adicionada sem alterar o carregamento de JSON antigo.
4. O modelo recebe tabelas de live/execução, mas não gera repertórios nesta etapa.
