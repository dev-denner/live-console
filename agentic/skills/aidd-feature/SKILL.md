---
name: aidd-feature
description: Specify, implement and verify one Live Console v1 feature without relying on a particular coding agent.
version: 1.0
---

# AIDD feature workflow

1. Read `agentic/rules/live-console-v1.md`, `agentic/skills/live-console-domain/SKILL.md` and relevant previous specs.
2. Create `agentic/specs/<feature>/PRD.md` with problem, outcome, scope, non-goals, flows, acceptance criteria, privacy and compatibility impact.
3. Create `TECHNICAL-SPEC.md` with UI/API contract, state ownership, migrations/repositories, validation, test plan and rollback/compatibility plan.
4. Do not decide material unanswered product questions silently in code; return them for approval.
5. Implement only approved scope.
6. Verify automated tests and the real browser journey. Include failures found and fixed.
7. Record commands, evidence, PR/merge and limitations in `EVIDENCE.md`.

## State ownership

Angular Signals handle component-local state. NgRx SignalStore handles shared feature state, asynchronous lifecycle and multi-step interactions. The API remains authoritative.

## Definition of done

Spec, implementation, tests, browser evidence and documentation must agree. A successful HTTP smoke test is never enough for an operator-facing feature.
