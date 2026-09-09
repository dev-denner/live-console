# Live Console AI-Driven Development

This directory is the source of truth for the Live Console v1 rebuild. It does not replace the working local application yet.

## Decision in force

- Frontend: Angular, standalone components, strict TypeScript.
- Client state: Angular Signals plus NgRx SignalStore for feature state; no Akita in new code.
- Backend: Fastify + TypeScript, kept as a local API/server for the Angular build.
- Persistence: SQLite + Drizzle repositories; existing SQL migrations remain the sole migration authority.
- Legacy: the currently working console and HTML pages remain available under `/legacy` during the rebuild.

See [ADR-001](adr/ADR-001-angular-fastify.md) for the decision and [the workflow](specs/README.md) for how each v1 feature is specified before implementation.

## Delivery sequence

1. Foundation: isolate legacy, add Angular workspace and API boundary without changing business behavior.
2. Catalog list and manual registration.
3. Catalog details, sources and letters.
4. Imports/exports and uploads.
5. Blocks, live builder, automatic assembly and execution history.

Each feature must have an approved specification, implementation evidence and browser verification before it is declared complete.
