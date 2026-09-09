# F0 — Baseline verificável do Live Console v0

## Problema e objetivo

O v0 é um console local em Node/Fastify/SQLite que combina catálogo, lives, blocos, montagem determinística e execução. A F0 documenta o comportamento realmente observável antes de qualquer isolamento futuro em `/legacy`.

## Escopo

Inventariar stack, rotas, APIs, dados legados, invariantes, jornadas e riscos de compatibilidade. Não há Angular, mudança de arquitetura, `/legacy` ou funcionalidade v1 nesta fase.

## Usuários e agentes

Denner opera o console local; implementadores humanos ou agentes seguem as Skills/Specs agnósticas em `agentic/`.

## Jornadas e aceite

Raiz, catálogo, lives, blocos e execução devem continuar acessíveis; APIs devem preservar JSON legado, referências literais, transações e `xEmLives`. A validação HTTP passou, mas a validação clicável de navegador está bloqueada pela ausência de `agent-browser` nesta máquina.

## Riscos

Links relativos, assets compilados em `dist/`, caminhos `storage/`, formato legado e banco local são pontos de compatibilidade. Dados pessoais locais não podem entrar no Git nem no Supabase.

## Perguntas abertas / decisão F1

Confirmar resolução de assets relativos, contrato final de roteamento e resolução de browser automation antes de implementar `/legacy`. A ADR Angular/Fastify permanece `proposed`.
