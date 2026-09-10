# F5 — Music registration evidence

Status: implementation validated locally; PR remains unmerged and browser evidence is local-only.

## Approved decisions

- Parent music form is a large accessible dialog.
- Version create/edit uses a second dialog approximately 75% of the parent size, layered above it.
- Lyrics are one Markdown document per music, edited as text in the parent and stored under `storage/letras/`; SQLite keeps only a relative path.
- Version fields include name, order, type, duration, literal reference/upload and opening flag.
- Music fields include title, artist, genre/style, optional origin/observations, `autoral`, `ativo` and read-only `xEmLives`.
- Climate, vibe, stage temperature and block are not part of F5.
- New aggregates and local media remain staged/draft until final save; failed/cancelled saves do not leave incomplete records or promoted orphan files.
- Browser media references are HTTP URLs, never WSL/Windows absolute paths.
- Legacy behavior remains under `/legacy`.

## Implementation evidence to fill in the F5 implementation PR

### Files changed

- `migrations/006_f5_music_registration.sql` — additive `ativo`, `abertura` and order uniqueness, with corrected partial legacy-primary index.
- `src/contracts.ts`, `src/db/schema.ts`, `src/db/repositories.ts`, `server.ts` — F5 aggregate contract, repository, staging, atomic Markdown, media HTTP and compatibility behavior.
- `frontend/src/app/core/api/api-client.service.ts`, `frontend/src/app/pages/catalogo/` — parent/child dialogs, draft state, Markdown and upload UI.
- `test/f5-music-registration.test.ts` — aggregate, Markdown, order, staging cleanup and HTTP media tests.

### Commands

- `npm install` — passed; npm reported existing audit findings in the root dependency tree (38 vulnerabilities).
- `npm run typecheck` — passed.
- `npm run lint` — passed (delegates to typecheck in this repository).
- `npm run build` — passed.
- `git diff --check` — passed.
- `node --import tsx --test test/f5-music-registration.test.ts` — 4 passed.
- `npm test` — final run printed all discovered tests as passed through the existing F3 suite but the runner did not terminate within 90s; the remaining 12 tests were rerun isolated with 12/12 passed. The only earlier failure was the legacy order swap, fixed by two-phase reordering.

### Automated validation

- F5 covers create/edit, nullable fields, primary order, per-version `abertura`, literal YouTube references, Markdown read/write/missing file, staged local media, HTTP URL portability, duplicate order rejection, promoted-file cleanup, extension validation and staging cancellation.
- Legacy F4 tests continue to cover old fields/contracts; `/legacy` source and route were not modified.

### Browser validation

- Browser: `agent-browser`, session `f5-live-console`, isolated `http://127.0.0.1:8788/v1/catalogo`.
- Creation: filled title/artist/Markdown, added a YouTube version, marked `abertura`, saved, and confirmed the row appeared in the catalog with `xEmLives = 0`.
- Edit: reopened the row, changed Markdown, saved, reopened it, and observed the edited UTF-8 text loaded from storage.
- Child dialog: opened over the parent, confirmed the version form, pressed Escape, and verified the parent remained open with focus restored to `Adicionar versão`.
- Upload: selected `Áudio`, uploaded synthetic `/tmp/f5-browser.mp3`, and observed the staging filename/status in the child draft. Automated test completed promotion and HTTP retrieval.
- Legacy: opened `/legacy` in the same browser session and confirmed the historical JSON console UI (`Abra live`, `Adicionar pasta`, `Iniciar live`) remained available.
- Limitation: a pre-existing process occupied port 8787 and caused the first browser attempt to hit an old server; that run was discarded. Collision/failure behavior is covered by automated staging tests, but not yet by a completed visual browser retry journey.

### Risks and follow-ups

- Existing legacy `principal` remains in `fontes_musica` for F4/live compatibility; F5 exposes only order 1 as the logical primary.
- Staging has explicit cancel/failure cleanup; an operational TTL janitor is still a follow-up.
- Existing-media replacement rollback after an unexpected filesystem failure deserves a dedicated recovery test.
- No blocks, repertoire generation or automatic live fabrication were implemented.

### Delivery

- Commit: `1866657` (`feat(f5): add music registration and staged media`).
- Branch: `feat/foundation-f5-music-registration`.
- PR: draft not created/published; do not merge.
