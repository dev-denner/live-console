# Skills.sh research and synthesis

Research date: 2026-09-09.

## Selected source skills

| Source | Why selected | Evidence retained | Adopted parts |
|---|---|---|---|
| [Feature PRD — github/awesome-copilot](https://www.skills.sh/github/awesome-copilot/breakdown-feature-prd) | Highest relevant adoption: 10k installs; audited by listed scanners. | Explicit scope, goals, stories, acceptance criteria and out-of-scope boundaries. | Feature PRD before implementation; one feature per specification. |
| [Fastify TypeScript — mindrally/skills](https://www.skills.sh/mindrally/skills/fastify-typescript) | Directly matches the existing backend: 778 installs; listed audits passed. | Strict types, no avoidable any, modular functional API code. | Typed contracts, Zod boundary validation, repository transactions and focused modules. |
| [Technical Specification — aj-geddes/useful-ai-prompts](https://www.skills.sh/aj-geddes/useful-ai-prompts/technical-specification) | 779 installs; listed audits passed. | Requirements, architecture, implementation details and acceptance criteria. | Spec template, traceability and verification evidence. |

Sources were evaluated, not copied wholesale. Their compatible practices are condensed in the repository-owned skills below, so the project has one stable and reviewable contract.

## Angular state research

Angular Signals are the base local state primitive. [NgRx SignalStore](https://ngrx.io/guide/signals/signal-store) is the chosen shared feature-state layer because it is signals-native and structured without the reducer/action boilerplate of classic NgRx Store. Akita is therefore not selected for new code.

## Domain search

No trustworthy, directly applicable Skill was found for a local artist live catalog, temperature of stage, reusable repertoire blocks or literal media references. Those are project-specific rules, so they are documented in `live-console-domain` instead of importing an unrelated music-product skill.
