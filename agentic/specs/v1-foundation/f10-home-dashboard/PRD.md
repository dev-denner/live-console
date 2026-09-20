# PRD — F10: Home dashboard

## Objetivo

Substituir o redirecionamento atual da raiz (`/` → `/catalogo`) por uma home real que resume o estado operacional do Live Console e dá acesso rápido às áreas existentes, sem inventar dados ou funcionalidades.

## Problema e resultado esperado para o usuário

Hoje a raiz apenas redireciona para o catálogo; não há visão consolidada de "o que vem a seguir" ou "o que aconteceu recentemente". O usuário quer, ao abrir o app, entender rapidamente: há uma live em andamento ou agendada? O que tocou nas últimas lives? Quais músicas mais se repetem? E navegar de lá direto para a área certa.

## Em escopo

- Rota raiz (`/`) serve uma home dedicada (`HomePageComponent`).
- Cabeçalho com saudação (bom dia/tarde/noite), resumo contextual (contagem de lives e músicas) e ações rápidas (Nova música, Nova live).
- Destaque da live em execução (fila) ou, na ausência dela, da próxima live com `data` futura entre as não finalizadas/canceladas.
- Lista das lives mais recentes (data, título, quantidade de músicas, status).
- Visualização simples (lista com barras) das músicas mais tocadas, usando `xEmLives` real do catálogo (contador reconciliado apenas no encerramento de execução, F9).
- Seis atalhos em destaque: Catálogo, Blocos, Lives, Execução, Nova música, Configurações.
- Rota `/configuracoes` com um placeholder apresentável (reaproveita `PlaceholderPageComponent`), sem simular preferências que não existem.
- Estados de carregamento, vazio (nenhuma live/música cadastrada) e erro (falha ao consultar a API), com nova tentativa.
- Navegação por teclado, labels acessíveis e contraste adequado na nova sidebar/paleta.

## Fora de escopo

- Qualquer preferência de configuração real (idioma, tema, notificações) — a tela é um placeholder até existir uma spec própria.
- Alterar o shell (`AppShellComponent`) ou a navegação superior usada pelas páginas operacionais.
- Novos endpoints de API; a home consome apenas `/api/lives` e `/api/v1/musicas`, já existentes.
- Migração para React ou qualquer biblioteca de gráficos; a visualização de músicas mais tocadas é HTML/CSS simples.
- Editar uma `live` existente pelo `id` da tabela `lives` a partir da home (não há tela V1 para isso; ver limitação abaixo).

## Fluxos de usuário

1. Usuário abre `/`. Enquanto a API responde, vê um estado de carregamento.
2. Dados chegam: vê saudação, resumo, destaque da próxima live (ou aviso de que não há nenhuma), lista de últimas lives e músicas mais tocadas.
3. Usuário clica em "Abrir" no destaque da próxima live → navega para `/execucao/:id` (tela já existente que aceita qualquer status de live).
4. Usuário clica em um atalho (ex.: Blocos) → navega para `/blocos`.
5. Usuário clica em "Nova música" → navega para `/catalogo?novo=1`, que abre o diálogo de cadastro automaticamente.
6. Usuário clica em "Configurações" → vê o placeholder, sem sugerir funcionalidade inexistente.
7. Se a API falhar, o usuário vê uma mensagem de erro e um botão "Tentar novamente".
8. Se não houver lives nem músicas cadastradas, o usuário vê um estado vazio orientando a começar pelo catálogo.

## Critérios de aceite

- `/` mostra a nova home (não redireciona mais para `/catalogo`).
- Os dados exibidos vêm de `/api/lives` e `/api/v1/musicas`; nada é fixo no frontend.
- A próxima live (fila ou data futura) aparece em destaque quando existir.
- Últimas lives e músicas mais tocadas são exibidas a partir dos mesmos dados.
- Os seis atalhos navegam para rotas Angular existentes (ou `/configuracoes`, criada nesta fase).
- `/configuracoes` responde com um placeholder apresentável.
- Loading, vazio e erro têm tratamento visível e específico.
- A navegação lateral e os atalhos são operáveis via teclado, com `:focus-visible` e labels.
- `/legacy` permanece inalterado; nenhuma regra de negócio de catálogo, blocos, lives ou execução é alterada.

## Decisões registradas

- Ver [ADR-005](../../../../docs/aidd/adr/ADR-005-home-dashboard-scoped-visual-system.md) para a decisão de manter a home fora do `AppShellComponent` e escopar a nova paleta ao componente.

## Limitação conhecida (não resolvida nesta fase)

A rota `lives/:id` do shell atual identifica um **rascunho** (`live_drafts`), não uma `live` confirmada (tabela `lives`, a mesma usada por `/api/lives`). Não existe hoje uma tela V1 dedicada a visualizar/editar uma `live` confirmada por id fora do fluxo de execução. Por isso, o destaque da home sempre abre em `/execucao/:id`, que aceita qualquer status. Criar uma tela de detalhe de live confirmada é uma decisão de produto fora do escopo desta fase.
