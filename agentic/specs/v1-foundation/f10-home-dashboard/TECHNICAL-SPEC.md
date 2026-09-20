# Especificação técnica — F10: Home dashboard

## Contrato de API e UI

Nenhum endpoint novo. A home consome, em paralelo:

- `GET /api/lives` → `{ lives: Live[] }`, campos usados: `id`, `titulo`, `data`, `status`, `itens` (length).
- `GET /api/v1/musicas` → `{ musicas: Music[] }`, campos usados: `id`, `titulo`, `artista`, `xEmLives`.

`xEmLives` só é incrementado no encerramento idempotente de uma execução (F9, `endExecution`), portanto já representa histórico real de reprodução — não é um contador de UI.

## Fronteira Angular e posse de estado

- `frontend/src/app/pages/home/home.models.ts`: tipos `HomeLive`, `HomeMusic`, `HomeDashboardData`.
- `frontend/src/app/pages/home/home.selectors.ts`: funções puras, sem Angular, testáveis diretamente com `node:test`/`tsx` (mesmo padrão de `frontend/src/app/layout/navigation.ts` em `test/foundation-f3.test.ts`):
  - `greeting(now: Date): string`
  - `statusLabel(status: string): string`
  - `selectNextLive(lives, now?): HomeLive | null` — prioriza `status === 'em_execucao'`; senão, a menor `data` futura entre `rascunho`/`fechado`/`em_execucao` com `data` parseável e `>= now`.
  - `selectRecentLives(lives, limit=5)` — usa a ordenação já entregue por `listLives` (mais recentes primeiro).
  - `selectTopPlayed(musicas, limit=5)` — filtra `xEmLives > 0`, ordena decrescente.
- `frontend/src/app/pages/home/home.service.ts`: `HomeService.loadDashboard()` faz `forkJoin` das duas chamadas via `ApiClientService`, validando o formato da resposta como os demais serviços (`CatalogoService`, `HealthService`).
- `frontend/src/app/pages/home/home-page.component.ts`: componente standalone, `OnPush`, um único `RequestState<HomeDashboardData>` agregando as duas chamadas; `computed()` deriva `nextLive`, `recentLives`, `topPlayed`, `totalLives`, `totalMusicas` a partir do estado.
- A home é uma rota irmã de `AppShellComponent` em `app.routes.ts` (ver ADR-005), não uma filha — evita duas navegações na mesma árvore.
- `PlaceholderPageComponent` (já existente) é reaproveitado para `/configuracoes`, filha de `AppShellComponent`, com `data: { title: 'Configurações', description: '...' }`, seguindo o mesmo padrão de dados de rota já usado.
- Pequeno acréscimo aditivo em `CatalogoPageComponent`: se `?novo=1` estiver na query string ao entrar na rota, abre o diálogo de cadastro (`newMusic()`) automaticamente. Não altera nenhuma regra de cadastro existente.

## Impacto em backend/repositório/migração

Nenhum. Não há alteração em `server.ts`, repositórios, schema Drizzle ou migrações SQL.

## Validação e comportamento de erro

- Estado único agregado: `loading` enquanto qualquer uma das duas chamadas está pendente; `error` se qualquer uma falhar (mensagem da `ApiError`, botão "Tentar novamente" que refaz ambas as chamadas); `empty` quando não há lives nem músicas; `success` caso contrário.
- Estados vazios granulares dentro do `success`: "nenhuma live" na lista de últimas lives e "nenhuma música tocada ainda" no gráfico, mesmo que o outro conjunto tenha dados.
- Indicador de conexão da sidebar reaproveita `HealthService`, com os mesmos três estados (`loading`/`success`/`error`) já usados por `AppShellComponent`.

## Acessibilidade

- Link de pular para o conteúdo (`.skip-link`), landmark `<aside aria-label>` para a navegação e `<main id="home-main" tabindex="-1">`.
- Todos os atalhos e itens de navegação são `<a>`/`<button>` nativos; `:focus-visible` usa o token `--lc-focus` já existente.
- A visualização de músicas mais tocadas expõe a contagem como texto (`N×`) ao lado da barra — a informação nunca depende só do comprimento da barra ou de cor.
- Badges de status combinam texto (`statusLabel`) com uma cor, nunca só cor.

## Plano de teste

- `test/f10-home-dashboard.test.ts` (novo, `node:test` + `tsx`, mesmo padrão de `test/foundation-f3.test.ts`):
  - `selectNextLive` prioriza `em_execucao` sobre data futura.
  - `selectNextLive` ignora `executado`/`cancelado` e datas passadas; retorna `null` sem candidatos.
  - `selectRecentLives` respeita o limite e a ordem de entrada.
  - `selectTopPlayed` filtra `xEmLives <= 0` e ordena decrescente.
  - `greeting` cobre manhã/tarde/noite.
  - Verificação textual de que `app.routes.ts` serve `HomePageComponent` na raiz fora do `AppShellComponent` e que `/configuracoes` existe (mesmo padrão usado por `test/f6-blocks.test.ts`/`test/f7-import-export.test.mjs`).
- Comandos executados nesta entrega: `npm run typecheck`, `npm test`, `npm run build`.
- Validação visual: navegador real não disponível neste ambiente isolado (ver limitações no EVIDENCE.md); build de produção do Angular foi inspecionado como evidência indireta.

## Plano de rollback/compatibilidade

Mudança é aditiva e reversível: reverter para `redirectTo: 'catalogo'` na rota raiz e remover a pasta `pages/home` restaura o comportamento anterior sem tocar em dados, contratos ou `/legacy`.
