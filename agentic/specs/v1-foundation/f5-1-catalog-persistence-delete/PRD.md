# F5.1 — Persistência e exclusão do catálogo

Status: aprovado para implementação  
Tipo: correção complementar da F5

## Problema

A tela F5 permite preencher música, letra, versões e mídia, mas o salvamento falha porque o frontend chama `POST /api/v1/musicas` e a rota de persistência não está disponível. A exclusão do catálogo também ainda não está fechada.

## Objetivo

Fechar o ciclo básico do catálogo:

- criar música;
- editar música;
- carregar uma música completa para edição;
- excluir uma música com confirmação;
- persistir letra, versões e arquivos locais;
- remover relações e artefatos associados sem afetar o legacy.

## Escopo

Incluído:

- `POST /api/v1/musicas`;
- `GET /api/v1/musicas/:id`;
- `PUT /api/v1/musicas/:id`;
- `DELETE /api/v1/musicas/:id`;
- finalização dos uploads staged;
- salvamento atômico da letra Markdown;
- exclusão das relações de bloco existentes;
- remoção dos arquivos locais pertencentes à música;
- atualização da lista após criar, editar ou excluir;
- testes API, persistência, rollback e browser.

Fora do escopo:

- cadastro de blocos;
- importação/exportação JSON;
- fabricação automática de lives;
- histórico de execução;
- alteração do `/legacy`;
- mudança de `xEmLives`.

## Exclusão

A exclusão exige confirmação explícita informando que também removerá:

- versões;
- letra `.md`;
- arquivos locais de áudio;
- arquivos locais de vídeo;
- vínculos com blocos.

Links do YouTube não possuem arquivo físico para remover.

A música deve desaparecer do catálogo somente depois que suas relações forem removidas. Uma música excluída não pode continuar vinculada a bloco.

## Critérios de aceite

- Salvar uma música preenchida pela tela retorna sucesso e cria o registro.
- Fechar e reabrir a música recupera título, artista, letra e versões.
- Editar uma música persiste as alterações.
- Upload staged é promovido somente no salvamento final.
- Falha no salvamento não deixa registro incompleto nem mídia promovida órfã.
- Excluir uma música remove versões, letra, mídias locais e vínculos de bloco.
- Arquivos compartilhados, se encontrados, não são apagados silenciosamente; a API informa conflito.
- Excluir música somente com YouTube funciona sem tentar apagar URL.
- Cancelar a confirmação não altera nada.
- `xEmLives` permanece inalterado.
- `/legacy` continua funcionando.
- O teste completo termina com código de saída.
