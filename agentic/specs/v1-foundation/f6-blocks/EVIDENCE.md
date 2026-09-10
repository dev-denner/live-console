# Evidências — F6 Blocos

## Escopo entregue

Registrar aqui a implementação do cadastro de blocos, associação exclusiva de músicas-base, ordem e tela Angular V1.

## Validação automatizada

| Comando | Resultado |
| --- | --- |
| `npm test` | 38/38 testes passaram |
| `npm run typecheck` | passou |
| `npm run lint` | passou |
| `npm run build` | passou |
| `git diff --check` | passou |

## Casos de domínio

- duas associações da mesma música em blocos diferentes;
- décima primeira música;
- reordenação completa;
- exclusão de bloco sem exclusão da música;
- música inativa na seleção;
- `/legacy` e `xEmLives` preservados.

Os casos de exclusividade, limite, opções indisponíveis, API V1 e rota Angular estão cobertos por `test/f6-blocks.test.ts`. A suíte existente de blocos continua cobrindo inserção atômica em live e ordenação.

## Validação browser

Registrar a revisão humana da rota `/v1/blocos`, incluindo criação, edição, seleção, associação, remoção, reordenação, conflito visual e exclusão confirmada.

Validação browser automatizada ficou pendente nesta execução; a API foi exercitada por `Fastify.inject` e o bundle Angular foi compilado em produção. A revisão visual local deve conferir a rota antes do merge.
