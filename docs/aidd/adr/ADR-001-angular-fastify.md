# ADR-001: Angular frontend with Fastify API

- Status: proposed for approval
- Date: 2026-09-09
- Scope: Live Console v1 rebuild

## Context

The current local app mixes server-delivered static HTML and behavior in a single surface. It has working catalog, blocks, live building, automatic assembly and execution flows, but browser verification exposed that passing backend checks alone does not guarantee a usable interface.

## Options considered

### Angular + Fastify (recommended)

**Advantages**

- Angular is well-suited to long-lived, form-heavy operational screens.
- Standalone components, strict TypeScript and Signals offer clear feature boundaries.
- NgRx SignalStore provides structured shared feature state with substantially less boilerplate than classic NgRx Store.
- Fastify and the existing SQLite/Drizzle layer can remain focused on HTTP, transactions, files and legacy compatibility.
- The frontend can be independently verified in the browser while Fastify keeps serving a local production build.

**Costs**

- Two build surfaces and an API contract must be maintained.
- An incremental migration requires a temporary legacy route.

### Next.js full stack

**Advantages**

- One framework for UI and server endpoints.
- Strong option when React, SSR, public pages or deployment features drive the product.

**Costs for this project**

- It replaces the chosen Angular frontend with React.
- SSR and deployment-oriented conventions add little to a single-user, offline-first local operator tool.
- It would require a broader migration of the existing Fastify and SQLite integration.

### Keep static HTML + Fastify

**Advantages**

- Lowest immediate migration cost.

**Costs**

- The current catalog issue demonstrates weak component/state boundaries and insufficient browser-level guarantees.
- It becomes harder to evolve complex forms, execution state and validation consistently.

## Decision

Adopt **Angular + Fastify**, not Next.js and not NestJS.

- Angular owns all v1 operator screens.
- Fastify remains the only local server/API and serves the built Angular assets in production.
- SQLite + Drizzle and the SQL migration runner remain unchanged until a specific migration says otherwise.
- Akita is not adopted for new code. Use Angular Signals for component-local state and NgRx SignalStore for feature/session state.
- The legacy app is isolated at `/legacy`; `/` will become the v1 shell only after the foundation acceptance criteria pass.

## Consequences

Every v1 feature uses an explicit API contract, a feature store, a specification and browser verification. Legacy behavior remains usable but is not extended except for compatibility fixes.
