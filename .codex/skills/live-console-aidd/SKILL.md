---
name: live-console-aidd
summary: Plan and implement one Live Console v1 feature through approved specification, typed contracts and browser evidence.
---

# Live Console AIDD

Use this skill for every v1 foundation or product feature.

## Required order

1. Read `docs/aidd/adr/ADR-001-angular-fastify.md`, `.codex/rules/live-console-v1.md` and the relevant domain skill.
2. Create a feature PRD in `docs/aidd/specs/<feature>/prd.md`.
3. Create a technical specification in `docs/aidd/specs/<feature>/technical-spec.md`.
4. Record explicit scope, non-goals, API contract, state ownership, data impact, security constraints and acceptance criteria.
5. Obtain approval before implementation when a decision changes product behavior, data model or architecture.
6. Implement only the approved specification.
7. Verify unit/API tests and the actual browser journey; a successful HTTP smoke test alone is not enough for a UI feature.
8. Record the delivery evidence, PR and known limitations in `docs/aidd/specs/<feature>/evidence.md`.

## Frontend rules

- Angular standalone components and strict TypeScript.
- Use Signals for component-local state.
- Use a feature-scoped NgRx SignalStore when state is shared across routes/components, contains asynchronous lifecycle, or must survive a multi-step interaction.
- Do not use Akita or classic global NgRx Store for new v1 features without an ADR.
- Keep forms typed, validate locally for usability and rely on the API for authority.
- Model loading, empty, validation, error and success states explicitly.

## Backend rules

- Fastify + TypeScript + Zod at HTTP boundaries.
- Repositories own persistence; SQL migration runner remains the only migration authority.
- Preserve transaction, idempotency and literal-reference rules from the domain skill.
- Return stable JSON contracts and domain-appropriate HTTP errors.

## Definition of done

A feature is not done until its specification, tests, browser evidence, migration evidence (when applicable), documentation and GitHub PR evidence agree.
