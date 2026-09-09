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
