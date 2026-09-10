# F5.1 — Especificação técnica

## Contrato HTTP

Usar a API V1 com caminhos sem acento:

```http
POST   /api/v1/musicas
GET    /api/v1/musicas/:id
PUT    /api/v1/musicas/:id
DELETE /api/v1/musicas/:id
```

O contrato deve reutilizar os tipos existentes da F5, com validação Zod na borda Fastify.

O payload de criação/edição contém:

- dados da música;
- letra Markdown;
- versões ordenadas;
- IDs de uploads staged;
- referências literais do YouTube.

O servidor não aceita `xEmLives` vindo do cliente.

## Criação e edição

1. Validar o agregado completo.
2. Validar que as ordens das versões são positivas e únicas.
3. Validar tipo, extensão e tamanho dos uploads.
4. Abrir transação SQLite.
5. Criar ou atualizar música e versões.
6. Escrever a letra UTF-8 de forma atômica.
7. Promover uploads staged para `storage/musicas/` ou `storage/videos/`.
8. Confirmar a transação.
9. Retornar o agregado persistido com referências HTTP.

Se uma etapa falhar:

- desfazer a transação;
- remover arquivos promovidos naquela operação;
- manter o registro anterior intacto em edição;
- limpar ou manter identificados os staged files para limpeza segura;
- retornar erro estruturado.

A resposta nunca deve conter caminho absoluto de Windows ou WSL.

## Exclusão

O endpoint `DELETE` deve:

1. validar o ID;
2. carregar música, versões, letra, mídias locais e vínculos de bloco;
3. verificar se algum artefato físico está compartilhado por outro registro;
4. mover temporariamente os artefatos exclusivos para uma quarentena privada da operação;
5. executar em transação:
   - remover vínculos de bloco;
   - remover versões;
   - remover referência da letra;
   - remover a música;
6. após o commit, apagar definitivamente a quarentena;
7. se a transação falhar, restaurar os arquivos da quarentena;
8. retornar relatório dos artefatos removidos.

O banco não deve apontar para arquivos depois da exclusão. Se a remoção física definitiva falhar, não responder sucesso silencioso: retornar aviso/erro operacional identificável e registrar o caminho em quarentena.

Arquivos permitidos para remoção:

- letra Markdown da música;
- áudio local das versões;
- vídeo local das versões.

URLs do YouTube são apenas referências e não são removidas como arquivos.

## Segurança

- Exclusão somente por ação explícita da interface.
- Não aceitar caminho físico arbitrário vindo do cliente.
- Resolver artefatos a partir de referências persistidas e de diretórios permitidos.
- Nunca seguir `../` ou caminhos absolutos.
- Não apagar arquivo referenciado por outra música.
- Não alterar arquivos do `/legacy`.

## Frontend

- Corrigir o cliente para chamar exatamente `/api/v1/musicas`.
- Após criação/edição, fechar diálogo e atualizar a lista.
- Após exclusão, remover o item da lista e exibir confirmação.
- A confirmação deve dizer que letra, áudio, vídeo e vínculos de bloco serão removidos.
- Erros de API devem preservar o rascunho de edição.
- O fluxo de staging deve permitir cancelar sem persistir.

## Testes obrigatórios

### API/repositório

- POST cria música com campos opcionais nulos.
- GET recupera letra e versões.
- PUT atualiza música e versões.
- DELETE remove música e relações de bloco.
- DELETE remove `.md`, áudio e vídeo exclusivos.
- DELETE não apaga URL do YouTube como arquivo.
- DELETE rejeita ou informa artefato compartilhado.
- Falha na criação remove promoção parcial.
- Falha na edição preserva o registro e a mídia anterior.
- `xEmLives` não muda em create/update/delete.
- ID inexistente retorna 404.

### Browser

- criar música e salvar;
- reabrir e editar;
- cancelar exclusão;
- confirmar exclusão;
- verificar que a música desapareceu;
- verificar que o upload/Markdown não é mais acessível;
- confirmar regressão `/legacy`.

## Compatibilidade

Usar migrations SQL aditivas e repositories existentes. Não executar reset, baseline paralelo ou migração destrutiva. Manter contratos legados e a rota `/legacy`.
