# Evidências — F3 Visual System

## Estado

Implementação focada no AppShell V1 e nos placeholders compartilhados. O console legado, páginas raiz, backend, banco, migrations e contratos existentes ficaram fora do diff.

## Auditoria anterior

O AppShell existente já tinha as quatro rotas, health check e retry, porém usava `Inter/system-ui`, fundo azul-marinho, navegação em container arredondado, cores sem tokens, ausência de skip link/foco explícito/reduced motion e placeholders com linguagem predominantemente técnica.

## Mudanças implementadas

- tokens de tema em `frontend/src/styles.css`;
- marca LC, header com link de retorno ao console legado e navegação de leitura rápida;
- estados health com semântica visual âmbar/teal/coral;
- skip link, foco visível, `color-scheme`, `theme-color` e reduced motion;
- placeholder V1 com estado vazio mais orientado e tipografia responsiva;
- nenhuma dependência nova.

## Validação automatizada

| Comando | Resultado |
| --- | --- |
| `npm run build` | OK — Angular production e backend TypeScript compilados |
| `npm run typecheck` | OK — raiz e frontend Angular |
| `npm run lint` | OK — script atual executa o typecheck |
| `npm test` | OK — 14 testes, 0 falhas, com loopback autorizado para o teste HTTP |
| `git diff --check` | OK |

## Evidência browser

Registrar nesta seção os caminhos absolutos das capturas finais:

- `/tmp/f3-visual-v1-catalogo.png` — AppShell, catálogo e health;
- `/tmp/f3-visual-v1-lives.png` — rota ativa Lives;
- `/tmp/f3-visual-v1-tablet.png` — composição em viewport tablet;
- `/tmp/f3-visual-legacy.png` — regressão visual do `/legacy`.

Browser check adicional: `/v1/catalogo`, `/v1/lives`, `/v1/blocos` e `/v1/execucao` retornaram os headings esperados e cada uma exibiu sua própria rota ativa. A captura tablet foi feita em `1024 × 768`. O snapshot de acessibilidade encontrou skip link, navegação nomeada, quatro links de rota e heading hierárquico.

Consulta das Web Interface Guidelines atualizadas: aplicada semântica de links/botão, `aria-live`, foco visível, skip link, `color-scheme: dark`, `theme-color`, reduced motion, estados de erro com próxima ação e reticências tipográficas.

## Git e publicação

- Branch alvo: `feat/foundation-f3-application-shell` (ou branch de trabalho equivalente).
- Commit semântico: `feat(v1): establish live console visual system`.
- PR: draft, sem merge.
- Antes do staging, confirmar exclusão de `.env`, `node_modules`, `dist`, SQLite, mídias, repertórios e alterações locais não relacionadas.

Auditoria final: `.env`, `node_modules`, `dist`, SQLite, mídias, repertórios e segredos não entram no escopo; alterações locais pré-existentes permanecem fora do staging.
