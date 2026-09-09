# Live Console AI-Driven Development

This directory contains human-facing decision and research artifacts for the Live Console v1 rebuild. The canonical, tool-agnostic instructions shared by Codex, Copilot, Claude Code, people and future agents live under [`agentic/`](../../agentic/README.md).

## Decision proposed

- Frontend: Angular standalone components, strict TypeScript.
- Client state: Angular Signals plus NgRx SignalStore for feature state; no Akita in new code without an approved ADR.
- Backend: Fastify + TypeScript as the local API/server.
- Persistence: SQLite + Drizzle repositories; existing SQL migrations remain the sole migration authority.
- Legacy: preserve the currently working console under `/legacy` during the rebuild.

See [ADR-001](adr/ADR-001-angular-fastify.md) for the trade-offs. It remains **proposed** until explicitly approved. The initial foundation plan is [`agentic/specs/v1-foundation`](../../agentic/specs/v1-foundation/README.md).

## Artifact roles

- `docs/aidd/adr/`: human-readable architecture decisions and alternatives.
- `docs/aidd/research/`: sources and synthesis used to inform decisions.
- `docs/aidd/specs/`: workflow guidance and historical feature artifacts.
- `agentic/specs/`: canonical delivery specs and evidence.

Do not implement from an implementation prompt alone. Use an approved feature spec, then record tests, browser evidence and known limitations.
