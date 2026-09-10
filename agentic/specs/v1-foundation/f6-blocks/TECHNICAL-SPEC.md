# F6 — Especificação técnica

## Contrato de dados

As tabelas existentes `blocos` e `musicas_do_bloco` continuam sendo a autoridade. A migration `007_f6_blocos_regras.sql` adiciona triggers para impedir novas associações da mesma música-base em blocos diferentes e para limitar cada bloco a dez itens. Nenhum dado antigo é apagado automaticamente.

## API V1

As rotas `/api/v1/blocos` são a fronteira consumida pelo Angular:

| Método | Rota | Resultado |
| --- | --- | --- |
| GET | `/api/v1/blocos` | resumo dos blocos |
| POST | `/api/v1/blocos` | cria bloco |
| GET | `/api/v1/blocos/:id` | bloco com músicas ordenadas |
| PATCH | `/api/v1/blocos/:id` | altera nome/descrição |
| DELETE | `/api/v1/blocos/:id` | remove bloco e vínculos |
| GET | `/api/v1/blocos/:id/opcoes-musicas` | músicas e disponibilidade |
| POST | `/api/v1/blocos/:id/musicas` | adiciona música-base |
| DELETE | `/api/v1/blocos/:id/musicas/:musicaId` | remove vínculo |
| PUT | `/api/v1/blocos/:id/musicas/ordem` | substitui ordem completa |

`opcoes-musicas` retorna `disponivel`, `blocoAtualId`, `blocoAtualNome` e `motivo` para que a UI possa desabilitar a opção sem tratar regra de domínio somente no navegador.

Conflitos de exclusividade, música inativa e limite retornam HTTP 409. Payload inválido retorna HTTP 400; recurso inexistente retorna HTTP 404.

## Frontend

`BlocosPageComponent` usa Signals e um serviço tipado. A tela possui lista de blocos, detalhe selecionado, formulário de bloco e painel de seleção de músicas. A UI nunca remove silenciosamente uma opção indisponível: mostra o motivo e mantém a decisão do domínio no backend.

## Limites

Não alterar rotas antigas `/api/blocos`, `/api/musicas`, schema de lives, exportação legada, upload, cadastro de música ou execução. Não adicionar dependência externa, serviço de nuvem ou OpenDesign runtime.
