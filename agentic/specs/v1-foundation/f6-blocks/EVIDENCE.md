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

## Revisão visual complementar

### Causa encontrada

- A rota correta `/v1/blocos` já servia o bundle Angular e consultava `/api/v1/blocos`; o estado vazio era real no banco temporário, não um problema de rota, build ou API.
- O diálogo usava o backdrop como única área de rolagem e não limitava sua altura à viewport.
- O foco programático era aplicado ao `<section>` do diálogo, deixando o primeiro controle sem foco explícito.
- A edição enviava o campo `id` também no corpo do `PATCH`, embora o contrato V1 aceite o identificador somente na URL; a API respondia HTTP 400.

### Correções

- `frontend/src/app/pages/blocos/blocos-page.component.css`: limite de altura relativo à viewport, rolagem interna protegida e raio do limite alinhado ao token de controle; nomes longos continuam quebrando linha.
- `frontend/src/app/pages/blocos/blocos-page.component.ts`: diálogo inicia com `scrollTop = 0`, foca campo/ação correto e edição envia apenas `nome` e `descricao`.
- `frontend/src/app/pages/blocos/blocos-page.component.html`: nomes de blocos têm tooltip nativo acessível e botões de seleção têm rótulo completo.
- `test/f6-blocks.test.ts`: cobertura documental da rota, tooltip, limite visual e foco/scroll.

### Validação browser

Rota validada: `http://127.0.0.1:8788/v1/blocos` (equivalente local da rota solicitada `/v1/blocos`), servindo `main-JMB6ZJTY.js`. `/api/health` retornou `{"ok":true}` e `/api/v1/blocos` retornou estado vazio inicialmente. O console e a coleta de erros do browser não registraram erros.

Em banco temporário isolado, sem dados pessoais, foram validados:

- estado vazio com mensagem e ação `Criar primeiro bloco`;
- criação e seleção de bloco;
- edição e recarga do nome após correção do payload PATCH;
- seleção manual de música-base, contador `2/10`, ordem numerada e reordenação;
- música inativa desabilitada;
- música já pertencente a outro bloco desabilitada com o nome do bloco exibido;
- música já adicionada desabilitada com `Já adicionada`;
- foco inicial no campo de nome e scroll do diálogo em `0`;
- fechamento por Escape observado no diálogo de criação;
- `/legacy` permaneceu coberto pela suíte de regressão.

Screenshot: `/tmp/f6-before.png` registra o estado vazio e `/tmp/f6-after.png` registra a lista com opções disponíveis e indisponíveis. Fixtures foram gravadas somente em `/tmp/live-console-f6-visual.sqlite`.

### Validação automatizada

| Comando | Resultado |
| --- | --- |
| `npm test` | 38/38 testes passaram |
| `npm run typecheck` | passou |
| `npm run lint` | passou |
| `npm run build` | passou |
| `git diff --check` | passou |

Riscos/pendências: o browser headless não captura validação visual em todos os breakpoints físicos; a suíte confirma a responsividade por CSS e a validação manual foi feita na viewport padrão. PR #40 já estava `MERGED`; esta evidência acompanha a correção em uma PR de follow-up.
