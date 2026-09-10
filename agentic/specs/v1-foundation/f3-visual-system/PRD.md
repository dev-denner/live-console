# F3 — Sistema visual V1

## Status

Proposta para implementação incremental no AppShell Angular da V1. Não altera o console legado, as páginas raiz, o backend ou dados de produto.

## Objetivo

Dar ao Live Console V1 uma primeira camada visual profissional, legível em contexto de palco e preparada para as features futuras de catálogo, lives, blocos e execução.

## Direção de produto

O Live Console é uma superfície operacional para quem prepara e conduz apresentações ao vivo. A interface deve parecer um palco técnico em baixa luz: escura e silenciosa, com âmbar para ações e teal para indicar que algo está vivo/saudável.

## Resultado esperado

- AppShell com identidade própria, hierarquia clara e navegação rápida.
- Alto contraste sem depender apenas de cor para comunicar estado.
- Layout responsivo para notebook e tablet, sem overflow horizontal.
- Health check com loading, sucesso, erro e retry legíveis.
- Placeholders com estado vazio explícito e orientação do que virá depois.
- Foco de teclado visível, skip link e respeito a `prefers-reduced-motion`.
- As quatro rotas V1 permanecem preservadas.

## Escopo

Incluído:

- tokens globais de cor, tipografia, espaçamento, bordas, sombras e estados;
- refino de header, marca, navegação ativa e ligação ao `/legacy`;
- estados do health check e placeholder;
- metadados mínimos de tema e descrição da V1;
- screenshots e evidências de browser.

Fora do escopo:

- catálogo, banco, migrations, importação ou geração automática;
- mudança de comportamento de `legacy/` ou das páginas raiz;
- nova biblioteca de componentes, framework ou conversão para React;
- reescrita completa do shell existente.

## Critérios de aceite

1. `/v1` e as quatro rotas filhas renderizam o AppShell com rota ativa.
2. O visual usa palco escuro, âmbar de ação e teal de live/saúde.
3. Loading termina com reticências tipográficas e erro informa a próxima ação.
4. Teclado encontra skip link e foco visível em links e retry.
5. Viewports de notebook e tablet permanecem utilizáveis.
6. Build, typecheck, lint, testes e browser passam.
7. O diff da implementação contém apenas arquivos V1 e esta especificação.
8. A entrega é commitada e publicada em PR draft, sem merge.
