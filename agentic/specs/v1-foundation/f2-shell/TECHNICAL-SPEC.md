# F2 — Especificação técnica

## Arquitetura alvo desta fase

```text
browser
  ├── /legacy  ── asset histórico v0 baseado em JSON
  ├── raiz     ── páginas atuais preservadas
  └── /v1      ── shell Angular standalone

/v1 ── cliente HTTP tipado ── Fastify local ── contratos Zod ── repositórios existentes
                                                        └── SQLite/Drizzle
```

O diagrama descreve fronteiras, não autoriza a migração das páginas atuais.

## Estrutura mínima proposta

Os nomes finais podem ser ajustados pela implementação, mas a separação deve ser explícita:

```text
frontend/
  angular.json
  package.json
  src/app/
    core/       # cliente HTTP, configuração e serviços transversais
    shell/      # layout e rota inicial
    shared/     # componentes realmente compartilhados

backend existente/
  server.ts
  src/contracts.ts
  src/db/

agentic/specs/v1-foundation/f2-shell/
```

Se manter um único `package.json` for tecnicamente mais seguro nesta transição, a aplicação Angular pode ser adicionada em `frontend/` com scripts orquestrados pelo package raiz. Não criar microserviço ou segundo servidor.

## Roteamento e entrega

- `GET /v1` entrega o shell Angular.
- Assets do shell devem usar uma base URL explícita e funcionar em refresh direto de `/v1`.
- `/legacy` continua servido pelo mount histórico atual, sem compartilhar componentes Angular.
- `/`, `/catalogo`, `/lives`, `/blocos` e `/execucao` mantêm seus contratos atuais.
- Não criar `/legacy/catalogo`, `/legacy/lives`, `/legacy/blocos` ou `/legacy/execucao`.

## Contrato mínimo de saúde

O frontend deve consumir `GET /api/health` através de um serviço tipado. O contrato deve manter o payload já publicado; se houver necessidade de alteração, criar schema compatível e teste antes de mudar o servidor.

Estados obrigatórios no shell:

- `loading`: a chamada está em andamento;
- `success`: API local respondeu e o shell mostra a versão/estado;
- `error`: API indisponível ou payload inválido, com mensagem acionável e opção de tentar novamente.

## Estado

- Usar Signals para estado local do shell.
- Não introduzir store global apenas por antecipação.
- Quando houver estado compartilhado entre componentes de uma feature futura, usar NgRx SignalStore com estado, selectors/computed e métodos de intenção explícitos.
- Não usar Akita nesta fase: o padrão escolhido é o nativo de Signals, com SignalStore apenas quando a complexidade justificar.

## Fronteira de contratos

- Fastify valida entrada e saída HTTP com Zod.
- O cliente Angular não acessa SQLite, Drizzle ou filesystem.
- Regras de domínio continuam no backend/repositórios; o shell não duplica elegibilidade, montagem ou contagem de execução.
- Evitar `any`; erros devem ser representados por estados/contratos estáveis.

## Build e execução

A implementação deve adicionar comandos claros, sem quebrar os atuais:

```bash
npm install
npm run build
npm run typecheck
npm test
npm run dev
```

O servidor local deve entregar a V1 e o legacy no mesmo processo. Não usar proxy externo, container ou serviço remoto para validar a foundation.

## Testes e evidências

- teste de contrato para `/api/health`;
- teste de entrega de `/v1` e `/legacy`;
- teste de que as quatro rotas administrativas legadas continuam 404;
- teste browser do carregamento de `/v1`, estado success e estado error;
- smoke browser regressivo em `/legacy` com fixture JSON já aprovada;
- `git diff --check` e verificação de arquivos ignorados.

## Rollback

Remover o mount `/v1` e os assets Angular, mantendo `server.ts`, migrations, páginas raiz e `/legacy` intactos. Nenhum rollback pode apagar banco, storage, repertórios ou mídias.
