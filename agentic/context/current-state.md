# Current state — Live Console

Last consolidated: 2026-09-09.

## Delivered local capabilities

- SQLite + Drizzle repositories and SQL migrations.
- Catalog/import/export, references, uploads and letters.
- Manual lives, reusable blocks, deterministic assembly and execution history.
- Legacy export compatibility and execution-only `xEmLives` changes.

## Observed product gap

The existing static catalog UI did not provide reliable visible evidence of manual registration despite backend capability. This is a v1 acceptance warning: frontend behavior must be demonstrated in the browser, not inferred from API checks.

## Architecture decision proposed

Angular standalone + Signals + NgRx SignalStore frontend; Fastify TypeScript backend; SQLite/Drizzle preserved; v0 isolated at `/legacy` during foundation. See `docs/aidd/adr/ADR-001-angular-fastify.md` until this content moves into the v1 foundation spec.

## Next decision

Plan and approve foundation increments before runtime migration. No v1 screen is implemented before its PRD and technical spec.
