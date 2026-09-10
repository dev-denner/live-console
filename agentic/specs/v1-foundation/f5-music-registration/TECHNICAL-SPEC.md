# F5 — Music registration technical specification

## Architecture constraints

Keep the existing local architecture: Angular standalone + TypeScript strict for V1, Fastify for the local API, Zod at HTTP boundaries, SQLite with the repository layer and existing SQL migration authority. Do not introduce a microservice or a cloud dependency. Reuse the F4 catalog contracts and visual tokens.

Before implementation, inspect the current schema and repositories. If the project already has a music/source table, evolve it additively rather than creating duplicate persistence logic or a destructive reset.

## Aggregate model

### Music

| Field | Type | Rule |
|---|---|---|
| `id` | stable identifier | server generated |
| `titulo` | text | required |
| `artista` | text | required |
| `genero` | nullable text | free text/style |
| `origem` | nullable text | compatibility metadata |
| `observacoes` | nullable text | free text |
| `autoral` | boolean | default false |
| `ativo` | boolean | default true |
| `letraCaminho` | nullable relative path | never absolute |
| `xEmLives` | integer | read-only in F5 |
| `criadaEm`, `atualizadaEm` | timestamps | server controlled |

Keep old columns needed by the legacy adapter during the transition; the new F5 API/UI must not expose climate, block, vibe, stage temperature or old status values.

### Version

| Field | Type | Rule |
|---|---|---|
| `id` | stable identifier | server generated |
| `musicaId` | foreign key | parent music |
| `ordem` | positive integer | unique per parent, order 1 is primary |
| `nome` | text | required |
| `tipo` | enum/string | `youtube`, `audio`, `video` |
| `referencia` | literal URL or relative path | opaque |
| `duracao` | nullable integer/number | seconds, validate non-negative |
| `abertura` | boolean | default false |
| timestamps | server controlled | — |

If the existing table is named `fontes`, adapt it through a repository/DTO rather than exposing a second model to the rest of the app.

## Draft and finalization

The Angular parent owns a draft aggregate containing music fields, lyrics text and version drafts. The child dialog edits a copy and returns it to the parent only after child validation.

For a new music:

1. Generate a client draft token.
2. Upload local files to a private staging endpoint, not permanent storage.
3. Keep staged upload IDs in the draft version.
4. On final save, send the aggregate plus staged IDs.
5. The server validates the complete aggregate, opens one DB transaction, writes the music and versions, atomically writes/renames the Markdown file and promotes staged media.
6. If any operation fails, roll back database writes and remove newly promoted files. Staged files are cleaned by explicit cancel/TTL cleanup.
7. For an existing music, never remove an old file before the replacement is committed.

The exact endpoint shape may reuse the existing API conventions, but it must provide equivalent semantics. A possible contract is:

- `POST /api/media/staging` — multipart upload; returns `{ stagingId, originalName, type, size }`.
- `DELETE /api/media/staging/:stagingId` — cancel/cleanup.
- `POST /api/musicas` — create aggregate with lyrics text and staged upload IDs.
- `GET /api/musicas/:id` — return music, versions and lyrics content (or a typed lyrics endpoint).
- `PUT /api/musicas/:id` — replace/update aggregate with explicit version diff.
- `GET /api/media/:kind/:relativePath` or static `/media/...` — serve local media with safe path resolution.

All request/response contracts must be Zod validated. Do not return absolute filesystem paths.

## Lyrics

The server derives a safe stable filename from the music ID, for example `storage/letras/<id>-<slug>.md`. The stable ID prevents a title edit from breaking the link.

- Read Markdown as UTF-8 when opening the parent dialog.
- Save with a temporary sibling file, flush/close, then rename atomically.
- Store only the project-relative path in SQLite.
- If the recorded file is missing, return an explicit warning and allow recreation; never silently replace or delete another file.
- Do not duplicate lyrics on each version.

## Media safety and portability

- Allowed local types are audio and video configured by the server; reject unknown extensions and unreasonable sizes.
- Use a safe filename with a deterministic music/version prefix plus collision resistance.
- Existing files cause a conflict response; no silent overwrite.
- Keep media under ignored storage directories.
- Browser references are HTTP paths served by the local server. A Windows browser must never receive a server filesystem path.
- Verify playback from the same browser origin/port used by the V1 app, including the WSL-to-Windows access path.

## UI composition

- Parent: `role=dialog`, `aria-modal=true`, labelled title, visible close/cancel/save actions, focus trap and return focus.
- Parent layout: music form and Markdown editor side by side at desktop; stacked at narrow width; versions list full width below.
- Child: second `role=dialog` with approximately 75% of parent width/height, elevated above parent, independently labelled, focus trapped while open.
- Child close order: Escape/cancel closes child first, restores focus to its trigger, then parent remains unchanged until explicit save.
- Respect reduced motion and existing V1 tokens; do not introduce a separate visual language.
- Show loading, validation, conflict, empty and error states without losing the parent draft.

## Tests

At minimum add:

- repository/API create and edit with nullable fields;
- version order uniqueness and order-1 primary behavior;
- opening flag stored per version;
- lyrics Markdown read/write round trip and missing-file warning;
- literal YouTube URL preservation;
- invalid extension, size limit and collision rejection;
- staging cancel and failed finalization cleanup;
- no `xEmLives` change on catalog save;
- inactive music excluded from future selection query;
- browser journey for new/edit music, child dialog, keyboard Escape/focus, Markdown reload, upload playback and error/retry;
- `/legacy` regression.

## Rollback and compatibility

Use additive SQL migration and keep legacy columns/adapter until an approved migration exists. If F5 is disabled, F4 catalog read and `/legacy` must still load. Do not merge implementation without updated `EVIDENCE.md`.
