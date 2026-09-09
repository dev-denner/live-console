# Evidências F3

## Estado

- **IMPLEMENTADO E VALIDADO** — branch `feat/foundation-f3-application-shell`, baseada em `origin/master` no commit `ff6d3bc`.
- A F3 adiciona o AppShell, navegação interna V1, placeholders e contrato HTTP comum sem reescrever o backend ou a F2 visual preservada.
- PR draft será aberta após o commit e o push. Não há merge nesta etapa.

## Arquivos alterados

- `frontend/src/app/app.routes.ts` — AppShell com children e rotas `/v1/catalogo`, `/v1/lives`, `/v1/blocos` e `/v1/execucao`.
- `frontend/src/app/core/api/api-client.service.ts` — cliente base tipado sobre `HttpClient`.
- `frontend/src/app/core/api/api-error.ts` — `ApiError`, normalização de rede/HTTP e rejeição segura de payloads não-JSON.
- `frontend/src/app/core/models/request-state.ts` — estados `loading`, `success`, `empty` e `error`.
- `frontend/src/app/core/health.service.ts` — HealthService da F2 adaptado ao cliente base.
- `frontend/src/app/layout/` — AppShell, estilos e navegação V1.
- `frontend/src/app/pages/placeholder/` — placeholder reutilizável para as quatro áreas futuras.
- `test/foundation-f3.test.ts` — testes de normalização e fronteiras de navegação.
- `agentic/specs/v1-foundation/f3-application-shell/EVIDENCE.md` — esta evidência.

Não foram alterados `server.ts`, `legacy/`, `migrations/`, `src/db/`, SQLite, Drizzle, páginas HTML da raiz ou contratos do console v0.

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm install` | **OK**; instalação raiz e frontend concluídas. O npm reportou 38 vulnerabilidades transitivas e avisos de dependências deprecated; não foi executado `npm audit fix`. |
| `npm run build` | **OK**; Angular production e backend TypeScript compilados. |
| `npm run typecheck` | **OK**; TypeScript raiz e Angular em configuração development. |
| `npm run lint` | **OK**; script atual executa o typecheck. |
| `npm test` | **OK**; 20 testes, 0 falhas. Inclui normalização de erros estruturados, textuais, HTML e rede, além das fronteiras de navegação. |
| `git diff --check` | **OK**. |

O servidor foi iniciado com `NO_OPEN=1 npm run dev` em `http://127.0.0.1:8787`.

## Evidência browser

Sessão isolada: `f3-application-shell-20260909`.

### AppShell e rotas V1

- `/v1` redirecionou para `/v1/catalogo`, renderizou o AppShell, a navegação, o link `/legacy`, o health em sucesso e o placeholder `Catálogo em construção` com estado `empty`.
- `/v1/catalogo` mostrou `Catálogo em construção`.
- `/v1/lives` mostrou `Lives em construção`.
- `/v1/blocos` mostrou `Blocos em construção`.
- `/v1/execucao` mostrou `Execução em construção`.
- A navegação exibiu as quatro opções em todas as rotas; o link da rota atual foi destacado como ativo.

Screenshots:

- [Catálogo/AppShell em sucesso](/tmp/f3-v1-catalogo-success.png)
- [Lives placeholder com rota ativa](/tmp/f3-v1-lives-active.png)
- [Blocos placeholder](/tmp/f3-v1-blocos.png)
- [Execução placeholder](/tmp/f3-v1-execucao.png)

### Health, erro e retry

- Sucesso: `Backend local saudável`.
- Erro: com `**/api/health` bloqueado no browser, o shell mostrou `Não foi possível conectar ao backend local.` e `Tentar novamente`; nenhum HTML bruto ou stack trace foi exposto.
- Retry: após remover o bloqueio, o botão retornou o shell para `Backend local saudável`.

Screenshots:

- [Health em erro](/tmp/f3-v1-health-error.png)
- [Health recuperado por retry](/tmp/f3-v1-health-retry.png)

### Regressão do console v0

- `/legacy` abriu o console `Live Console · MVP`.
- A fixture JSON fictícia foi carregada, exibindo `Canção de Teste`, `Artista Fictício` e `Interação de teste`.
- `Iniciar live` transitou para `Live em andamento`.
- A fixture não foi adicionada ao Git e não contém dados pessoais.

Screenshots:

- [Legacy antes da fixture](/tmp/f3-legacy-before.png)
- [Legacy com fixture](/tmp/f3-legacy-loaded.png)
- [Legacy em execução](/tmp/f3-legacy-running.png)

### Páginas preservadas e 404

No browser, os títulos observados foram:

| Rota | Resultado |
| --- | --- |
| `/` | `Live Console` |
| `/catalogo` | `Catálogo · Live Console` |
| `/lives` | `Montador manual de lives` |
| `/blocos` | `Blocos reutilizáveis` |
| `/execucao` | `Execução de live` |
| `/legacy/catalogo` | corpo JSON de erro; HTTP 404 |
| `/legacy/lives` | corpo JSON de erro; HTTP 404 |
| `/legacy/blocos` | corpo JSON de erro; HTTP 404 |
| `/legacy/execucao` | corpo JSON de erro; HTTP 404 |

- [Página raiz preservada](/tmp/f3-root.png)

## Integridade e escopo Git

- `git diff origin/master...HEAD -- legacy server.ts migrations src/db package.json frontend/src/app/shell frontend/src/app/app.component.ts frontend/src/app/app.config.ts` não encontrou alterações.
- A varredura da árvore rastreada não encontrou `.env`, SQLite/DB, `node_modules`, `dist`, mídias, repertórios pessoais, exports ou nomes de segredo/credential.
- `git check-ignore -v` confirmou regras para banco, mídias, `musicas`, `letras`, `repertorios`, `.env`, `dist` e `node_modules`.
- `.gitignore` possui uma alteração local preexistente (`/tmp/`) e `.mcp.json` permanece não rastreado; ambos ficaram fora do staging da F3.
- Nenhuma dependência nova foi adicionada.

## Riscos e pendências

- **Não bloqueante:** npm reporta 38 vulnerabilidades transitivas e pacotes deprecated; manutenção de dependências fica fora da F3.
- **Fixture:** a fixture browser é sintética e usa referências de mídia/letra inexistentes; o console tratou-as como pendentes sem quebrar a jornada.
- **Processo:** a PR será aberta como draft e não será mergeada nesta tarefa.
