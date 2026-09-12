# Live Console v1 rules

1. The working v0 remains available at `/legacy` until its approved v1 replacement passes browser verification.
2. New product behavior belongs to Angular v1; legacy gets compatibility fixes only.
3. Every v1 feature starts with a PRD, technical spec and acceptance criteria.
4. Fastify validates HTTP boundaries with Zod; repositories own persistence.
5. SQL files remain the only SQLite migration authority. Drizzle reflects schema and repositories; it never generates, pushes or resets migrations.
6. Avoid `any` and duplicate production business/persistence logic.
7. Browser verification is mandatory for UI work; route status and HTML delivery are insufficient.
8. Preserve literal URLs and paths, legacy repertoire JSON and execution-only `xEmLives` accounting.
9. Never version or write to technical memory personal catalog, media, lyrics, files, SQLite, exports, repertoire JSON, secrets or `.mcp.json`.
10. `denner-memory-chat/public.memories` is only for minimal technical tracking, never DJC.

## F9 — execução de repertórios

11. O produto trabalha com múltiplos repertórios de lives; `rascunho` é estado, não entidade única.
12. Somente `rascunho` pode ser editado. Repertórios fechados, em execução ou executados não podem ser reabertos para edição; alterações exigem duplicação para novo rascunho.
13. Duplicação revalida músicas e blocos contra o catálogo atual, copia apenas itens existentes e informa omissões.
14. A abertura é fixa na primeira posição. Inclusões entram no final. A unicidade é por `musicaId` e o seletor deve excluir músicas já presentes.
15. Durante execução, nunca remover itens do repertório. É permitido tocar fora da ordem planejada, pular, adicionar ao final e reordenar entre blocos.
16. `Marcar tocada` exige play prévio. Desfazer esse estado exige confirmação e registro auditável.
17. O histórico operacional registra a ordem real de execução e o instante do play; a ordem planejada não é o histórico real.
18. `xEmLives` só é reconciliado no encerramento confirmado da live, dentro de transação idempotente, uma vez por música tocada.
