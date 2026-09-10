# Live Console F5 — music registration rules

These rules apply to the V1 music registration feature and supplement `agentic/rules/live-console-v1.md`.

1. Keep the legacy console and its contracts available under `/legacy`; do not modify legacy behavior to implement F5.
2. F5 registers a music aggregate and its playback versions. Do not add climate, vibe, stage temperature or block fields to this form.
3. Music fields include title, artist, genre/style, optional origin and observations, `autoral`, `ativo`, shared lyrics reference and read-only `xEmLives`.
4. Version fields include name, order, type (`youtube`, `audio`, `video`), literal reference, duration and `abertura`. Order 1 is the primary version; do not add a redundant principal flag.
5. Lyrics belong to the music, not versions. Edit Markdown in the parent dialog, persist UTF-8 content atomically and store only a relative path in SQLite.
6. A new music, its lyrics, versions and uploads remain a draft until the final save. Uploads go to a private staging area first; promote them only after the database transaction succeeds. Cancel and failure must not create incomplete records or orphaned promoted media.
7. Local media is served to the browser through the local HTTP server. Never return Windows, WSL or absolute filesystem paths to Angular.
8. Never overwrite an existing media or lyrics file silently. Use safe names, validate extension/size, report collisions and keep deletion explicit.
9. `xEmLives` changes only in a future confirmed, idempotent execution flow; catalog save, import, reorder and planned repertoire never increment it.
10. Use the existing SQL migration authority and repositories. Prefer additive, backward-compatible changes; do not reset, baseline or destructively rewrite personal catalog data.
11. UI work requires automated tests plus a real browser journey covering create/edit, version dialog, Markdown round-trip, upload/staging and error/cancel paths.
12. Do not version SQLite files, personal media, lyric files, imports/exports, secrets or `.mcp.json`.
