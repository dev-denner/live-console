---
name: generate-automatic-live-draft
description: Generate an automatic music selection as an editable Live Console V1 draft, respecting active catalog items, blocks, opening rules, xEmLives, IDs, and bounded quantity search.
---

# Generate automatic live draft

Use this skill when implementing or reviewing F8.2 automatic selection.

## Read first

Before coding, read:

- \`agentic/specs/v1-foundation/f8-2-automatic-live-selection/PRD.md\`;
- \`TECHNICAL-SPEC.md\`;
- \`LAYOUT-SPEC.md\`;
- \`docs/aidd/adr/ADR-004-automatic-live-selection-as-draft.md\`;
- the F8.1 manual-draft specification, implementation and tests.

## Required behavior

- Generate a draft compatible with F8.1.
- Use \`ativo = true\`; do not reintroduce \`status = OK\`.
- Use \`musicaId\` for uniqueness; do not use \`musicaBase\` as the operational identity.
- Do not add vibe, climate or objective filters.
- Treat quantity as \`quantidadeReferencia\`, default 30; it is not a final constraint.
- Never exceed the reference automatically.
- If exact quantity is impossible, terminate with the greatest reachable quantity below it and explain the warning.
- Use a finite algorithm with an explicit bound; never retry indefinitely.
- Keep the opening first and outside the quantity/duration.
- Prefer an opening not used in the immediately previous live when execution history exists; otherwise prefer low \`xEmLives\`.
- Treat blocks as indivisible and preserve their internal order.
- Do not give blocks or ungrouped songs a fixed priority.
- Select songs, not versions. Resolve the primary version only when executing.
- Treat YouTube, audio and video as equivalent when valid.
- Do not increment \`xEmLives\` or create execution records.
- Keep the generated result fully editable in the F8.1 composer.

## Safe repository start

Before implementation:

1. inspect \`git status\`;
2. fetch remote refs;
3. update the local \`master\` with a fast-forward pull from \`origin/master\`;
4. create or rebase the feature branch from the current \`origin/master\`;
5. do not reset or discard user changes;
6. verify that F8.1 implementation is available on the base. If it is not merged yet, report the dependency instead of duplicating F8.1.

Do not push directly to \`master\` and do not merge automatically.

## Implementation guidance

- Register \`POST /api/v1/live-drafts/generate\` before the dynamic \`/:id\` route.
- Keep generation logic separate from HTTP and Angular rendering.
- Build disjoint candidate units before searching: block members must not also appear as individual candidates.
- Remove an opening song from its block only when that opening was selected; discard an empty block.
- Preserve the seeded ordering and record the seed and algorithm version.
- Make partial results and unmet authorial targets explicit warnings.
- Reuse the F8.1 composition contract where possible; do not add version selectors to the automatic form.

## Tests and handoff

Add tests for:

- default quantity reference 30;
- exact target reached;
- fallback to 31, 30, etc. when target 32 is impossible;
- no result above the reference;
- no infinite retry;
- active-only candidates;
- opening preference from previous execution;
- opening excluded from count;
- opening inside block;
- block atomicity and internal order;
- duplicate \`musicaId\` rejection;
- authorial target and shortage warning;
- local/YouTube/video eligibility equivalence;
- \`xEmLives\` unchanged;
- manual edits after generation.

Run existing tests plus:

- \`npm test\`;
- \`npm run typecheck\`;
- \`npm run lint\`;
- \`npm run build\`;
- \`git diff --check\`;
- browser verification of generation, partial warning, editing, saving, reopening and \`/legacy\`.

At handoff:

- update \`EVIDENCE.md\`;
- commit semantically;
- push the feature branch;
- open a draft PR with real Markdown;
- include files, commands, tests, browser evidence, limitations and dependency on F8.1;
- do not merge the implementation PR.
