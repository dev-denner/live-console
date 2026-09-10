---
name: live-console-music-registration
description: Guide the implementation of Live Console V1 music registration, shared Markdown lyrics, child playback versions and staged local media.
version: 1.0
---

# Live Console music registration

Use this skill for the F5 music registration feature. Read the canonical V1 rules, the domain skill and `agentic/specs/v1-foundation/f5-music-registration/` before coding.

## Product shape

- The parent screen is a large accessible dialog for creating or editing one music.
- The parent has two upper areas: music fields and a Markdown lyrics editor. The versions list spans the full width below them.
- Adding or editing a version opens a second accessible dialog over the parent at approximately 75% of the parent dialog size. It is a dialog hierarchy, not an inline-only form and not a separate route.
- Escape closes the child dialog first and returns focus to the triggering version action; a second close/cancel returns to the parent.
- New aggregates stay in draft memory until the parent save succeeds.

## Domain invariants

- `ativo` and `autoral` belong to the music.
- `abertura` belongs to a version.
- `ordem = 1` is the primary version; order is editable and unique per music.
- Lyrics are one Markdown document per music and never duplicated per version.
- `xEmLives` is music-level, read-only in F5 and execution-owned.
- F5 does not collect climate, vibe, stage temperature or block.

## Persistence and files

- Keep JSON/HTTP validation at the Fastify boundary and persistence in existing repositories.
- Stage local uploads under an ignored private temporary directory. Promote only after the music/version transaction commits; clean failed/cancelled drafts.
- Store relative references only. Serve media through HTTP URLs that a Windows browser can actually request from the local server.
- Write Markdown atomically as UTF-8. Missing files are an explicit warning, never silently replaced or deleted.
- Reject unsafe extensions, oversized files and silent name collisions.

## Implementation workflow

1. Inspect existing migrations, tables, repository methods and the F4 catalog contract.
2. Update PRD/technical spec if an unresolved product decision appears; do not invent a material rule.
3. Implement the smallest vertical slice: contract, repository, parent dialog, child version dialog and one safe media path.
4. Add unit/API tests for persistence, draft finalization, Markdown round-trip, collisions, invalid uploads and xEmLives invariants.
5. Verify in a real browser at desktop and narrow widths, including focus, Escape, keyboard flow, empty/error/retry and `/legacy` regression.
6. Record changed files, commands, tests, browser evidence, risks and follow-ups in `EVIDENCE.md`.

Do not start automatic live/repertoire generation in F5.
