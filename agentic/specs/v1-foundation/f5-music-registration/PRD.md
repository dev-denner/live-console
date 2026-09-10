# F5 — Music registration

Status: approved for implementation  
Scope: V1 catalog registration and editing only

## Problem

The current V1 catalog can be read, but an operator cannot register a music, its lyrics or the playback versions that will later be used by a block/live. The registration flow must support local audio/video without leaking WSL/Windows paths to the browser and without changing the legacy console.

## Outcome

An operator can create or edit one music in a focused parent dialog, maintain one shared Markdown lyrics document and manage an ordered list of playback versions in a child dialog. Local uploads are safe, portable and only become permanent when the complete music aggregate is saved.

## User flow

1. From `/v1/catalogo`, select **Nova música** or edit an existing item.
2. A large accessible dialog opens.
3. The upper area shows music metadata and the Markdown lyrics editor side by side on wide screens; it stacks on narrow screens.
4. The lower full-width area lists versions in order. Order 1 is the primary version.
5. Select **Adicionar versão** or edit a row. A second accessible dialog opens over the parent at approximately 75% of the parent dialog size.
6. In the child dialog, enter version name, order, type, duration, opening flag and either a literal YouTube URL or a local audio/video file.
7. Save the child draft back to the parent draft. No database write is required yet.
8. Save the parent. The API persists the music, lyrics, versions and staged media as one operation.
9. On cancel or failure, no incomplete music/version records or promoted media remain.

## Music fields

- title (required)
- artist (required)
- genre/style (optional text)
- origin (optional text, retained for compatibility)
- observations (optional text)
- `autoral` (boolean)
- `ativo` (boolean)
- shared lyrics Markdown (optional)
- `xEmLives` (read-only number, default 0 for new music)

## Version fields

- name (required)
- order (required positive integer, unique within the music)
- type: `youtube`, `audio` or `video`
- literal YouTube URL, or staged local file reference
- duration (optional)
- `abertura` (boolean)

The same music may have a version marked as opening and another version used normally; therefore `abertura` is version-level.

## Scope

Included:

- create and edit music;
- one Markdown lyrics document per music;
- ordered version list and child dialog;
- local audio/video upload;
- literal YouTube references;
- safe relative storage references and HTTP media delivery;
- validation, collision handling, cancel/failure cleanup;
- list refresh after save;
- keyboard/focus/reduced-motion accessible dialog behavior.

Not included:

- automatic live/repertoire generation;
- block creation or membership;
- climate, vibe or stage-temperature classification;
- execution reconciliation or incrementing `xEmLives`;
- personal repertoire migration;
- deleting physical files automatically;
- changes to `/legacy`.

## Acceptance criteria

- A new music can be saved with zero or more versions.
- Existing music and versions can be edited without duplicate orders.
- Order 1 is visibly primary and reordering persists.
- Lyrics are loaded from and saved to one UTF-8 Markdown file; the database stores only its relative path.
- Missing lyrics file produces an explicit recoverable warning.
- YouTube URLs remain byte-for-byte literal.
- Audio/video files are validated, staged, promoted safely and playable by the browser through an HTTP URL.
- A filename collision is visible and never silently overwrites an existing file.
- Cancelling or failing a new save leaves neither database records nor promoted orphan media.
- `ativo`, `autoral`, `abertura` and read-only `xEmLives` have the stated ownership.
- No F5 screen exposes climate, block, vibe or old multi-valued statuses.
- `/legacy` remains available and its existing browser journey still passes.
- Automated tests, typecheck, lint, build and browser evidence are recorded in the implementation PR.

## Privacy and compatibility

SQLite, lyrics, media, imports and exports remain local and ignored by Git. Legacy JSON fields (`youtube`, `arquivo`, `letra`, `observacao`, `interacoes`) remain supported by the legacy adapter. New V1 behavior is additive and does not rewrite personal catalog data.
