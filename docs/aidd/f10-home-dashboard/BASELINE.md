# Baseline congelada — F10 Home Dashboard

Data: 2026-09-20

Este documento registra o estado aprovado para interromper novas funcionalidades do Live Console e usar o repositório como laboratório do DJC Dev Runner.

## Referência funcional

- Branch: `feat/f9-live-execution`
- Commit da home: `217c149` (PR #55 mergeada)
- Rota principal: `/`
- Console legado preservado em: `/legacy`
- PR da implementação: https://github.com/dev-denner/live-console/pull/55

## Massa de teste

O fixture reproduzível está em `scripts/seed-layout-fixture.mjs` e cria:

- 50 músicas;
- fontes YouTube, áudio local e vídeo local;
- letras e fontes marcadas como abertura;
- blocos com 3, 5, 7, 8 e 10 músicas;
- 17 músicas fora de blocos;
- cinco lives executadas, uma fechada e uma em rascunho;
- nenhuma música compartilhada entre blocos.

Comandos:

```sh
node --import tsx scripts/seed-layout-fixture.mjs
LIVE_CONSOLE_DB="$PWD/data/live-console.sqlite" \
LIVE_CONSOLE_STORAGE="$PWD/storage" \
PORT=8787 npm start
```

## Validação registrada

- Build Angular/Node: aprovado após a merge da PR #55.
- API `GET /api/v1/musicas`: 50 músicas retornadas.
- Rota `/`: servindo `HomePageComponent`.
- Nova home: visualmente aprovada como baseline para os próximos testes.
- Duração da implementação pelo runner: aproximadamente 14m38s.
- Alterações da implementação: 15 arquivos, 776 linhas adicionadas e 15 removidas.
- Métricas de tokens: não persistidas pela run; ficam como lacuna para a Fase 2 do runner.

## Regra de congelamento

Novas alterações de produto devem ser feitas apenas como cenários de teste do runner. O Live Console só deve receber novas funcionalidades depois da melhoria de economia de tokens, feedback, retry/resume e validação visual do runner.

## Referência visual

Wireframe aprovado:

`/Users/dennerzacarias/.codex/visualizations/2026/09/17/01a0b04f-3b39-7b13-970f-dd4cd4e7e6df/live-console-home.html`
