# Evidência — F10: Home dashboard

## Comandos

Este agente rodou dentro de um worktree isolado do DJC Dev Runner cujo modo de permissão bloqueia a execução de `npm`/`npx`/`node -e`/binários de `node_modules/.bin` sem aprovação humana explícita, indisponível nesta sessão autônoma (`node --version` e `git status` funcionam; qualquer execução de script, não). Por isso, os comandos abaixo **não foram executados por este agente** e ficam pendentes de validação pelo runner/host ou por quem revisar o diff:

```sh
npm run typecheck   # tsc --noEmit (backend) + ng build --configuration development (frontend)
npm test            # node --test sobre test/**/*.test.mjs e test/**/*.test.ts, inclui test/f10-home-dashboard.test.ts
npm run build       # build de produção completo, inclusive frontend Angular
```

O código foi revisado manualmente linha a linha contra os padrões já existentes no repositório (mesma sintaxe de `@if`/`@switch`/`@case`, mesmo uso de `RequestState`, mesmo padrão de `ApiClientService.get(url, parse)` de `CatalogoService`/`HealthService`, mesmo par `imports: [RouterLink, RouterLinkActive]` de `AppShellComponent`) para reduzir o risco de erro de tipo ou de template, mas isso não substitui a compilação real.

## Jornada no navegador

Não realizada. O ambiente isolado deste agente não expõe um navegador nem permite iniciar `npm run dev`/`node dist/server.js` (mesma restrição de execução acima). Ver limitação abaixo.

## Observações e limitações conhecidas

- **Execução bloqueada nesta sessão**: build, typecheck, testes automatizados e validação visual no navegador precisam ser rodados por quem tiver permissão de execução neste worktree antes de aprovar a entrega.
- **Rota de "próxima live"**: `lives/:id` no shell atual identifica um rascunho (`live_drafts`), não uma `live` confirmada (tabela `lives`, usada por `/api/lives`). Por isso o destaque da home e a lista de últimas lives sempre abrem em `/execucao/:id`, que aceita qualquer status de live — ver PRD para o detalhe.
- **Nenhum endpoint novo**: a home consome apenas `GET /api/lives` e `GET /api/v1/musicas`, ambos já cobertos por testes de backend existentes (`test/lives.test.ts`, `test/foundation-f4.test.mjs`).
- **Paleta visual**: a referência visual fornecida na tarefa (`live-console-home.html`) está fora deste worktree isolado e não pôde ser lida por este agente (acesso ao sistema de arquivos restrito à raiz do worktree). A paleta (marinho, azul-escuro, verde-água, lavanda) foi implementada a partir da descrição textual da tarefa e de tokens já existentes (`--lc-teal`, `--lc-focus`, `--lc-space-*`), documentada em [ADR-005](../../../../docs/aidd/adr/ADR-005-home-dashboard-scoped-visual-system.md). Uma comparação visual direta com o arquivo de referência ainda precisa ser feita por alguém com acesso a ele.
- `/legacy` não foi tocado; nenhuma migração, contrato de API ou regra de negócio de catálogo/blocos/lives/execução foi alterada.
