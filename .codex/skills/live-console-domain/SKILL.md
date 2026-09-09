---
name: live-console-domain
summary: Preserve Live Console catalog, repertoire, execution and privacy invariants.
---

# Live Console domain

## Boundary

The app is local-first. SQLite, storage, media, lyrics, catalog, personal playlists, exports and secrets never enter GitHub or Supabase technical memory.

## Music and references

- A music record is a catalog work/version; each playback link or file is a reference/version of that music.
- Preserve URLs, paths, source names and catalog text literally. Never reconstruct or normalize the stored values.
- `musicaBase` prevents two versions of the same work from automatic assembly; absent `musicaBase` means only that individual music is unique.
- A music has zero or more references and at most one principal reference.
- A letter is singular per music. Unlinking never deletes the physical file.
- A new manual record defaults to `ensaiar`; only explicit `OK` is automatically eligible.

## Catalog classification

- Historical textual `bloco` remains an independent catalog classification.
- Reusable blocks are a separate N:N relationship between blocks and music, with their own sequence.
- `clima`, vibe and temperature are flexible catalog text; do not turn them into rigid enums without an approved spec.

## Lives and execution

- A live plan never increments `xEmLives`.
- `xEmLives` changes only in the same transaction as a confirmed real execution transition.
- Execution mutations require idempotency and audit evidence.
- Legacy export preserves `youtube`, `arquivo`, `letra`, `observacao` and `interacoes`.

## Compatibility

Keep the v0 behavior available under `/legacy` during v1 migration. Do not migrate or rewrite personal repertoire JSON automatically.
