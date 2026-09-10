# F5 — Music registration evidence

Status: specification prepared; implementation not started in this PR.

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

- pending

### Commands

- pending

### Automated validation

- pending: install/build
- pending: typecheck
- pending: lint
- pending: unit/API tests

### Browser validation

- pending: create/edit music
- pending: add/edit child version dialog
- pending: Markdown load/save round trip
- pending: local audio/video upload and browser playback
- pending: collision and failure cleanup
- pending: `/legacy` regression

### Risks and follow-ups

- The exact existing table/repository names must be confirmed before migration.
- The WSL-to-Windows serving path must be verified in the implementation browser run.
- Physical file cleanup and staging TTL need operational tests.
- Automatic block/live generation remains out of scope.
