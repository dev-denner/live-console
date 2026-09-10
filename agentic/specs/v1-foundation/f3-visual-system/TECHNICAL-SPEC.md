# F3 — Especificação técnica do sistema visual

## Fronteiras

Alterações permitidas nesta etapa:

- `frontend/src/styles.css`;
- `frontend/src/index.html`;
- `frontend/src/app/layout/`;
- `frontend/src/app/pages/placeholder/`;
- esta pasta de especificação.

Não alterar `legacy/`, HTMLs da raiz, `server.ts`, `src/`, `migrations/`, SQLite ou contratos de API.

## Tokens

| Grupo | Tokens principais | Uso |
| --- | --- | --- |
| Palco | `--lc-stage #0d1115`, `--lc-stage-raised #131a1f` | fundo global e elevação baixa |
| Superfície | `--lc-surface #192228`, `--lc-surface-strong #202b31` | navegação, estados e painéis |
| Texto | `--lc-ink #f4f1e8`, `--lc-muted #aab7b7`, `--lc-quiet #718182` | leitura primária, apoio e metadados |
| Ação | `--lc-amber #e5a83b`, `--lc-amber-bright #f2be58` | rota ativa, marca e chamadas principais |
| Live | `--lc-teal #5dd0b4` | health/sucesso e estado vivo |
| Falha | `--lc-danger #f18486`, `--lc-danger-soft #3b2328` | erro e retry |
| Foco | `--lc-focus #f5ce7c` | indicador de teclado |

Tipografia usa `Avenir Next`, `Segoe UI` e fallback sans-serif; dados e estados usam pilha monoespaçada com algarismos tabulares. Títulos têm tracking negativo, `text-wrap: balance` e linhas curtas.

Espaçamento usa escala de `.375rem` a `4rem`. Painéis têm raio de `18px`; controles, `10px`; a marca usa um canto cortado para criar assinatura sem transformar toda a interface em pills.

## Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ LC  Live Console · V1 / O palco antes do ar    Console legado │
├──────────────────────────────────────────────────────────────┤
│ Navegar   Catálogo  Lives  Blocos  Execução                  │
├──────────────────────────────────────────────────────────────┤
│ ● Conexão  Backend local saudável                            │
├──────────────────────────────────────────────────────────────┤
│ Próximo módulo                                               │
│ Catálogo                                                      │
│ em construção                                                 │
│ descrição                                                     │
│                                                               │
│ [ estado atual ]                                             │
└──────────────────────────────────────────────────────────────┘
```

O shell usa largura máxima de `1220px`, alinhamento à esquerda e `min-height: 100dvh`. Em tablet, o rótulo `Navegar` sobe para sua própria linha e os links distribuem-se em duas colunas. Não há sidebar: a navegação fica no topo para reduzir deslocamento ocular durante apresentação.

## Estados e acessibilidade

- Loading: ponto âmbar + `Verificando conexão com o backend local…`.
- Success: ponto teal + mensagem de backend saudável.
- Error: borda coral, mensagem útil e botão `Tentar novamente`.
- Empty: placeholder informa que a área está reservada e que nenhum dado foi alterado.
- `aria-live="polite"` fica no health e no estado do placeholder.
- Skip link aponta para `#main-content`; main recebe `tabindex="-1"`.
- Links continuam sendo links Angular/HTML; retry continua sendo `<button>`.
- `:focus-visible` tem anel de alto contraste.
- `prefers-reduced-motion` desliga transições e smooth scroll.
- `color-scheme: dark` e `theme-color` mantêm o navegador alinhado ao palco.

## Compatibilidade

Angular standalone e TypeScript strict permanecem intactos. Nenhuma dependência nova é necessária. Os estilos são CSS nativo no pipeline atual.

## Verificação

Executar `npm run build`, `npm run typecheck`, `npm run lint`, `npm test`, `git diff --check` e browser checks para `/v1`, as quatro rotas filhas e `/legacy`.
