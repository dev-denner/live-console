# F2 — Shell Angular e fronteira local da V1

## Problema e objetivo

O Live Console já possui páginas operacionais na raiz e o console v0 está protegido em `/legacy`. A V1 precisa de uma superfície própria para evoluir sem substituir prematuramente o catálogo, as lives, os blocos ou a execução existentes.

Esta fase cria somente o shell executável da V1 e a fronteira explícita com o backend local. Ela não migra páginas de negócio, não remodela o catálogo e não altera o console legado.

## Decisão de alto nível

- Frontend: Angular standalone, TypeScript strict e Signals.
- Estado compartilhado de feature: NgRx SignalStore quando necessário; estado local simples permanece em Signals.
- Backend: Fastify + TypeScript estrito, no processo local já existente.
- Contratos HTTP: schemas Zod na fronteira do backend; tipos compartilhados somente por contrato, sem duplicar regra de negócio.
- Persistência: SQLite, Drizzle e migrations SQL existentes permanecem intactos.
- Superfície de validação: `/v1` durante a foundation. As rotas atuais da raiz e `/legacy` não são substituídas nesta fase.

## Escopo

- Criar o workspace ou aplicação Angular standalone dentro da estrutura acordada.
- Criar roteamento inicial da V1, layout mínimo, cliente HTTP tipado e estados de loading, sucesso e erro.
- Criar cliente HTTP tipado para `/api/health` e uma chamada de contrato de leitura não destrutiva.
- Expor o shell em `/v1` pelo servidor local.
- Documentar como qualquer agente pode executar, testar e validar o shell.
- Preservar a execução do console em `/legacy` e das páginas atuais na raiz.

## Fora de escopo

- Cadastro, edição ou exclusão de músicas.
- Importação/exportação de catálogo.
- Montagem automática ou manual de repertório.
- Alterações em SQLite, migrations, Drizzle ou `xEmLives`.
- Migração de `catalogo.html`, `lives.html`, `blocos.html` ou `execucao.html`.
- Autenticação, nuvem, microserviços ou envio de mídia para serviços externos.

## Jornadas de aceitação

1. `GET /legacy` continua abrindo o console v0 baseado em JSON.
2. As páginas atuais da raiz continuam acessíveis sem redirecionamento.
3. `GET /v1` abre o shell Angular.
4. O shell exibe uma mensagem identificável de V1 e um estado de saúde obtido pelo cliente HTTP.
5. Falha da API exibe estado de erro compreensível, sem tela quebrada.
6. Recarregar `/v1` preserva a rota e não interfere no `/legacy`.
7. Build, typecheck, testes e validação browser passam.

## Critérios de saída

- PRD, especificação técnica e evidência atualizados.
- Nenhum dado pessoal, mídia, SQLite, repertório, export ou segredo versionado.
- O shell é executável por qualquer agente seguindo `README.md` e `agentic/`.
- A primeira feature de negócio fica explicitamente reservada para F4.
