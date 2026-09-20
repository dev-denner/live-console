# ADR-005 — Home dashboard com sistema visual escopado ao componente

- Status: aceito
- Data: 2026-09-20
- Escopo: Live Console V1 / Home (rota raiz `/`)

## Contexto

O pedido de produto para a nova home descreve uma disposição de painel (navegação lateral escura, fundo azul-marinho, superfícies em azul-escuro, destaque verde-água, azul-lavanda como cor secundária) diferente do tema atual do OpenDesign (`design-systems/live-console/tokens.css`), que é um "palco escuro" âmbar/verde-azulado sem navegação lateral e explicitamente instrui: "não introduzir uma sidebar que compita com um fluxo de live".

A home é a porta de entrada do produto e tem um objetivo diferente das telas operacionais (catálogo, blocos, lives, execução): orientar e resumir, não conduzir uma live ao vivo. As demais páginas continuam usando o shell existente (`AppShellComponent`, navegação superior, âmbar como ação primária) porque são usadas durante a operação, muitas vezes em pouca luz, e não devem mudar de linguagem visual sem necessidade.

## Decisão

1. A home vive fora de `AppShellComponent`: é uma rota irmã no nível raiz (`HomePageComponent`), não uma filha. Isso evita duas navegações competindo na mesma tela (a barra superior do shell e a nova sidebar).
2. A home introduz uma sidebar escura própria com os destinos existentes (Catálogo, Lives, Blocos, Importar, Execução, Configurações) e reaproveita `HealthService` para o indicador de conexão, igual ao shell atual.
3. A paleta pedida (marinho, azul-escuro, verde-água, lavanda) é declarada como variáveis CSS locais no seletor `:host` de `home-page.component.css`, prefixadas `--lc-home-*`, em vez de alterar `tokens.css` globalmente. `--lc-teal` do pacote OpenDesign é reaproveitado como o verde-água de destaque porque já representa "saudável/confirmação" no sistema existente.
4. `--lc-focus` (foco de teclado) e a escala de espaçamento `--lc-space-*` do OpenDesign continuam sendo usados dentro da home, porque são primitivas de acessibilidade e ritmo, não de tema.
5. Nenhuma regra de negócio, contrato de API, migração ou dado do `/legacy` é alterado. `/legacy` continua isolado.

## Alternativas rejeitadas

### Reformular `tokens.css` globalmente para a nova paleta

Rejeitada porque re-tematizaria as telas operacionais existentes sem necessidade, contrariando a instrução de não alterar regras/design sem necessidade e arriscando regressão visual em telas já validadas (catálogo, blocos, lives, execução).

### Colocar a home dentro de `AppShellComponent`

Rejeitada porque duplicaria navegação (barra superior do shell + sidebar da home) e misturaria duas linguagens visuais na mesma árvore de componentes.

### Substituir a navegação superior do shell por uma sidebar em todo o app

Rejeitada por ser uma mudança de escopo muito maior que o pedido ("substituir a home atual"), e por quebrar o teste de fronteira `V1 publica as fronteiras de navegação do shell` (`test/foundation-f3.test.ts`), que fixa o array `v1Navigation` usado pelo shell atual.

## Consequências

- A home pode evoluir seu próprio sistema visual sem novas ADRs para cada ajuste de cor, desde que permaneça escopada ao componente.
- Duas linguagens visuais coexistem no produto (home vs. shell operacional) até uma decisão de produto unificar os dois; isso é intencional e não uma inconsistência acidental.
- Se o produto decidir futuramente levar a sidebar para as demais páginas, isso exige uma nova ADR e uma spec própria, não uma extensão silenciosa desta.
