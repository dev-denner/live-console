# F3 — Especificação técnica

## 1. Fronteiras

### Frontend

O frontend continua em `frontend/` como aplicação Angular standalone.

A estrutura esperada é:

```text
frontend/
  src/app/
    core/
      api/
      models/
    layout/
    pages/
      catalogo/
      lives/
      blocos/
      execucao/
    app.routes.ts
```

Os nomes podem ser adaptados se a implementação preservar as responsabilidades.

### Backend

O backend continua sendo o Fastify/TypeScript atual, no mesmo processo local. A F3 não cria servidor separado nem altera o banco.

### Namespaces

| Namespace | Responsabilidade |
| --- | --- |
| `/` | Páginas atuais preservadas |
| `/legacy` | Console v0 baseado em JSON |
| `/v1` | Aplicação Angular em evolução |
| `/api` | API local existente |

## 2. Roteamento V1

A rota base deve permanecer `/v1/`.

Rotas previstas nesta etapa:

| Rota | Estado |
| --- | --- |
| `/v1` | redireciona para uma entrada V1 definida pela implementação |
| `/v1/catalogo` | placeholder “Catálogo em construção” |
| `/v1/lives` | placeholder “Lives em construção” |
| `/v1/blocos` | placeholder “Blocos em construção” |
| `/v1/execucao` | placeholder “Execução em construção” |

O servidor deve continuar entregando os assets compilados do Angular sem permitir traversal de diretório. Rotas de assets inexistentes devem retornar o comportamento definido pela implementação, sem expor arquivos arbitrários.

## 3. AppShell

O AppShell deve conter:

- marca/título da V1;
- navegação para as quatro áreas;
- link ou indicação clara de que o console legado está em `/legacy`;
- outlet para a página atual;
- estado visual coerente com a linguagem da F2;
- responsividade mínima para viewport desktop e mobile.

Não deve incorporar iframe, script ou HTML do console legado dentro da V1.

## 4. Cliente HTTP

Criar um serviço base tipado, por exemplo:

```ts
export interface ApiError {
  code: string;
  message: string;
  status: number | null;
  details?: unknown;
}

export type RequestState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'error'; error: ApiError };
```

Os nomes podem variar, desde que a semântica seja preservada.

O cliente deve:

- usar `HttpClient`;
- preservar respostas válidas sem normalização destrutiva;
- capturar erro de rede;
- capturar status HTTP não-2xx;
- rejeitar payloads incompatíveis quando o endpoint exigir validação;
- não registrar segredos ou dados de mídia em logs.

O `HealthService` da F2 deve consumir esse cliente base.

## 5. Contrato de erro

A API local deve evoluir gradualmente. Nesta F3 o frontend deve possuir uma normalização tolerante para:

- resposta JSON com `error`;
- resposta JSON com `code` e `message`;
- resposta não JSON;
- falha de conexão.

Não é necessário alterar todos os endpoints existentes. Caso um endpoint seja alterado para retornar erro estruturado, utilizar:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos.",
    "details": null
  }
}
```

Códigos iniciais recomendados:

- `VALIDATION_ERROR`;
- `NOT_FOUND`;
- `CONFLICT`;
- `NETWORK_ERROR`;
- `INTERNAL_ERROR`.

O frontend não deve depender do texto da mensagem para controlar fluxo.

## 6. Estados de tela

Criar uma convenção visual e de código para:

- loading;
- success;
- empty;
- error;
- retry quando houver uma operação repetível.

Os placeholders devem demonstrar pelo menos success e empty. O health check deve continuar demonstrando success, loading e error.

## 7. Estado

Usar Signals locais para estado de tela e navegação derivada.

Não adicionar NgRx, Akita ou outra biblioteca de store nesta F3. A decisão será reavaliada quando o catálogo possuir estado compartilhado entre listagem, filtros, edição e seleção.

## 8. Testes

A implementação deve cobrir:

- criação do shell;
- navegação para as quatro rotas;
- indicação de rota ativa;
- normalização de sucesso;
- normalização de erro HTTP;
- normalização de falha de rede;
- health check usando o cliente base;
- preservação do mount legado e das rotas atuais.

A ferramenta de teste pode ser a já existente no projeto ou a solução Angular mínima que não introduza complexidade desnecessária.

## 9. Segurança

- não usar caminhos absolutos de máquina no frontend;
- não expor diretórios locais;
- manter `/legacy` isolado;
- preservar validação de traversal do backend;
- não enviar mídias ou letras para serviços externos;
- não incluir fixtures pessoais.

## 10. Definição de pronto técnica

A F3 estará pronta somente quando:

1. PRD e esta especificação estiverem atendidas.
2. Build, typecheck, lint e testes passarem.
3. Browser validar todas as rotas V1.
4. Browser validar regressão do `/legacy`.
5. Rotas atuais responderem sem regressão.
6. EVIDENCE.md estiver atualizada.
7. PR estiver pronta para revisão e sem alterações locais não explicadas.
