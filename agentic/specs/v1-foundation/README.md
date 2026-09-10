# V1 foundation

## Purpose

Estabelecer a base para a reconstrução do Live Console sem perder o comportamento operacional do v0. Esta pasta descreve a sequência de foundation; cada fase de implementação terá uma especificação própria, aprovação e evidência.

## Guardrails

- A rota `/legacy` continua sendo o contrato operacional do v0 até a substituição equivalente ser validada no navegador.
- A fundação não remodela o catálogo, não migra repertórios pessoais e não cria novas regras de montagem sem spec aprovada.
- O backend permanece local, em TypeScript/Fastify, com SQLite e repositórios Drizzle.
- O frontend v1 será Angular standalone com TypeScript strict, Signals e NgRx SignalStore quando houver estado compartilhado de feature.
- Migrações SQL existentes continuam sob o executor atual; não usar drizzle-kit, push, reset ou baseline paralelo.
- Qualquer agente ou pessoa pode implementar, desde que leia esta base, registre decisões e produza a evidência exigida.

## Fases propostas

### F0 — Baseline e contrato do v0

Inventariar o comportamento atual, confirmar comandos de execução, registrar rotas e jornadas clicáveis e definir os artefatos que serão preservados em `/legacy`. Resultado: evidência reproduzível, sem refatoração de produto.

### F1 — Isolamento executável do legacy

Disponibilizar o console v0 sob `/legacy`, mantendo APIs, arquivos e repertórios compatíveis. Adicionar testes de smoke e browser para as jornadas legadas. Resultado: v0 protegido por um contrato verificável.

### F2 — Shell Angular e fronteira local

Adicionar o workspace/frontend Angular, roteamento inicial, layout mínimo, cliente HTTP tipado e fronteira explícita com o Fastify. O shell não substitui páginas de catálogo ainda. Resultado: v1 inicia separada e pode evoluir sem alterar o legacy.

### F3 — Convenções de estado, contratos e observabilidade local

Materializar a convenção de Signals/NgRx SignalStore por feature, estados de loading/empty/error/success, contratos Zod compartilhados na fronteira e evidência de build/test/browser. Resultado: uma fatia vertical de referência para as próximas páginas.

### F4 — Primeiro vertical slice aprovado

Implementar uma única página v1 escolhida por uma spec própria, provavelmente catálogo/listagem. A página deve provar leitura de API, estado, erro, vazio e navegação no navegador antes de ampliar o escopo.

### F5 — Cadastro de músicas, letras e versões

Implementar a criação e edição do agregado de música: diálogo pai para metadados e letra Markdown, diálogo filho de aproximadamente 75% para versões ordenadas e upload local seguro. O fluxo permanece em rascunho até o salvamento final; mídia é servida ao navegador por HTTP. Clima, vibe, temperatura de palco e bloco ficam fora deste cadastro; geração automática continua fora de escopo.

### F5.2 — OpenDesign visual foundation

Formalizar o sistema visual já validado em F3 como um pacote local com `manifest.json`, `DESIGN.md` e `tokens.css`, consumível pelo frontend e por agentes. A fase não altera regras de catálogo, contratos, legado, SQLite ou mídia; OpenDesign permanece uma capacidade de proposta sujeita à revisão humana. Deve ser concluída antes da próxima evolução funcional quando a interface depender de decisões visuais compartilhadas.

### F5.3 — OpenDesign catalog adoption

Aplicar os tokens e padrões do pacote OpenDesign ao catálogo V1, sem alterar API, persistência, uploads, exclusão, `xEmLives` ou `/legacy`. A tela deve manter estados loading/empty/error/success, ser acessível e responsiva, e servir como referência visual para a futura F6.

## Gate de saída da foundation

A foundation só termina quando:

- v0 é acessível em `/legacy` e sua jornada principal tem evidência browser;
- Angular inicia em uma superfície v1 separada;
- Fastify expõe contratos tipados para as features aprovadas;
- nenhum dado pessoal, mídia, SQLite, export ou segredo é versionado;
- as regras de persistência, compatibilidade e `xEmLives` continuam cobertas;
- há PRs e evidências associadas às fases concluídas.

A ordem e o conteúdo detalhado das fases podem ser ajustados por uma spec aprovada; este documento é o plano inicial, não autorização automática de implementação.
