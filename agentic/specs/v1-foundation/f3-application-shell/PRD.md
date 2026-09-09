# F3 — Shell da aplicação e contrato frontend/backend

## Status

Proposta aprovada para implementação em PR própria. Esta spec não implementa funcionalidades de catálogo, lives, blocos ou execução.

## Objetivo

Evoluir o shell Angular criado na F2 para uma fundação de aplicação reutilizável, com:

- layout base da V1;
- navegação interna preparada para os módulos futuros;
- fronteira clara entre páginas, componentes compartilhados e serviços;
- cliente HTTP tipado;
- tratamento consistente de carregamento, sucesso e erro;
- contrato de erros estável para o frontend.

A aplicação atual da raiz e o console v0 em `/legacy` continuam preservados.

## Problema

A F2 provou a execução do Angular em `/v1`, mas ainda possui uma tela única de fundação. Antes de iniciar o catálogo, precisamos definir o esqueleto de navegação e os contratos de comunicação para evitar que cada feature crie seus próprios padrões.

## Resultado esperado

Ao final da F3:

1. `/v1` terá um AppShell reutilizável.
2. A navegação V1 possuirá fronteiras para:
   - Catálogo;
   - Lives;
   - Blocos;
   - Execução.
3. As rotas poderão exibir placeholders de “Em construção”, sem simular funcionalidades ainda inexistentes.
4. O frontend terá um cliente HTTP tipado e uma normalização comum de erros.
5. Estados de tela seguirão o mesmo padrão de loading, success, empty e error.
6. O backend continuará no mesmo processo Fastify/TypeScript.
7. `/`, páginas atuais e `/legacy` continuarão funcionando sem alteração de contrato.

## Escopo incluído

- AppShell Angular standalone.
- Header, navegação, área principal e indicação de rota ativa.
- Rotas internas sob `/v1`.
- Páginas placeholder para as quatro futuras áreas.
- Tipos compartilhados do frontend para resposta, erro e estado de requisição.
- Serviço HTTP base usando `HttpClient`.
- Adaptação do health check existente ao cliente base.
- Estados visuais consistentes.
- Testes unitários ou de componente adequados à stack escolhida.
- Evidência browser das rotas V1 e regressão das rotas preservadas.

## Fora do escopo

- CRUD de músicas.
- Importação ou exportação de JSON.
- Upload de áudio, vídeo ou letras.
- Alteração de migrations, schema SQLite ou Drizzle.
- Fabricação automática de repertório.
- Migração das páginas atuais para Angular.
- Alteração do console v0 ou do formato de repertórios legados.
- Introdução de NgRx SignalStore sem estado compartilhado real.
- Autenticação, usuários ou nuvem.

## Requisitos funcionais

### RF-01 — Shell V1

O sistema deve renderizar um shell comum com identificação do Live Console V1, navegação e outlet principal.

### RF-02 — Navegação

A navegação deve expor as rotas V1 de Catálogo, Lives, Blocos e Execução. Cada rota ainda poderá mostrar uma tela placeholder claramente identificada como não implementada.

### RF-03 — Rota ativa

A navegação deve indicar a rota atual sem depender de manipulação manual de URL.

### RF-04 — Cliente HTTP

Chamadas HTTP da V1 devem passar por um serviço base tipado, preservando o endpoint `/api/health` existente.

### RF-05 — Erro normalizado

O frontend deve converter falhas de rede e respostas HTTP inválidas em um formato interno estável, sem expor stack trace ao usuário.

### RF-06 — Estados

Componentes que aguardam dados devem distinguir loading, success, empty e error. O placeholder pode usar esses estados para validar o padrão.

### RF-07 — Compatibilidade

As rotas `/`, `/catalogo`, `/lives`, `/blocos`, `/execucao` e `/legacy` devem continuar acessíveis. `/legacy/catalogo`, `/legacy/lives`, `/legacy/blocos` e `/legacy/execucao` devem continuar inexistentes.

## Critérios de aceite

- `npm install`, build, typecheck, lint e testes passam.
- `/v1` abre o AppShell.
- Cada rota V1 possui placeholder explícito e navegável.
- O health check usa o cliente HTTP base.
- Um erro de rede/HTTP apresenta estado error e possibilidade de retry quando aplicável.
- O console v0 carrega uma fixture JSON e inicia uma live.
- As páginas atuais continuam respondendo.
- Não há alteração em banco, mídias, repertórios pessoais ou segredos.
- A EVIDENCE.md registra comandos, resultados, screenshots e pendências.
- Não existe implementação de catálogo ou fabricação automática nesta F3.

## Riscos

- Criar navegação duplicada ou confundir a V1 com as páginas atuais.
- Definir um contrato de erro rígido antes de conhecer todos os endpoints.
- Adicionar dependência de gerenciamento de estado sem necessidade.

## Decisões

- A V1 permanece sob `/v1`.
- O legado permanece exclusivamente sob `/legacy`.
- Signals são suficientes nesta etapa.
- NgRx SignalStore somente será avaliado quando uma feature possuir estado compartilhado concreto.
