# F7.1 — Importação V1 visível e verificável

## Contexto

A implementação de F7 já possui uma página Angular de importação, rota, navegação e endpoints. Porém, a funcionalidade não está aparecendo visualmente no ambiente acessado pelo operador. A causa ainda deve ser investigada: rota publicada, navegação, build servido pelo Fastify, cache, erro de bootstrap ou falha de renderização.

O `/legacy` continua sendo uma ponte temporária para as importações antigas. Ele não deve receber a interface V1 nem ser tratado como destino definitivo.

## Objetivo

Fazer a importação V1 aparecer e funcionar no navegador, em `/v1/importacao`, preservando o contrato canônico e sem alterar o fluxo legado.

## Resultado esperado

Ao abrir `http://localhost:<porta>/v1`:

1. a navegação V1 mostra `Importar`;
2. o link leva para `/v1/importacao` sem 404 ou retorno ao catálogo;
3. a página mostra título, seleção de JSON, validação de prévia, relatório, confirmação e exportação;
4. a prévia não grava no banco;
5. a confirmação grava respeitando o merge aditivo de versões;
6. a interface mostra estados de leitura, carregamento, erro e sucesso;
7. `/legacy` continua carregando os repertórios antigos sem alteração.

## Escopo

- investigar a diferença entre código-fonte Angular e artefato realmente servido;
- corrigir rota, navegação, build, fallback SPA, asset/base href, bootstrap ou CSS quando necessário;
- validar visualmente a jornada no navegador;
- adicionar testes que evitem regressão da rota visível;
- documentar a evidência real no navegador.

## Fora de escopo

- redesign final do shell;
- mudança do contrato JSON V1;
- remoção do `/legacy`;
- fabricação automática de repertório;
- envio de mídias para serviços externos.

## Critérios de aceite

- `npm run build` gera o artefato que o servidor local efetivamente serve;
- a rota `/v1/importacao` responde com a aplicação Angular correta após reiniciar o servidor;
- `Importar` aparece na navegação e possui estado ativo quando a rota está aberta;
- a página de importação é visível em viewport desktop e mobile;
- um JSON V1 de fixture pode ser selecionado, pré-visualizado e confirmado;
- a confirmação não apaga versões anteriores;
- erro de JSON inválido é visível e acessível;
- a exportação continua acessível;
- `/legacy` continua funcionando;
- testes, typecheck, lint, build e validação visual passam.
