---
name: live-console-domain
description: Preserve the data, execution, compatibility and privacy invariants of Live Console.
version: 1.1
---

# Live Console domain invariants

## Local-first and privacy

SQLite, storage, catalog, music, media, lyrics, personal repertoires, exports, absolute paths and secrets remain local. Technical memory only records non-sensitive delivery facts.

## Catalog and references

- A catalog entry is a music/work. Playback versions are child references of that music.
- URLs, paths and source names are opaque and literal; never normalize or reconstruct them.
- A music can have zero or more versions. Each version has a stable order; `ordem = 1` is the primary version.
- Version type is one of `youtube`, `audio` or `video`.
- A music has one shared lyrics document. Lyrics are not duplicated per version; the database stores only a relative `letraCaminho`.
- Unlinking or replacing a lyric/media reference never removes a physical file automatically.
- Manual registration uses an explicit `ativo` boolean. Inactive music is not eligible for future selection.
- `autoral` belongs to the music. `abertura` belongs to the version because the same music may be used as an opening in one version and normally in another.
- `xEmLives` belongs to the music, is read-only during catalog editing, and changes only after a confirmed, idempotent real-execution transition.
- Genre/style, origin and observations are optional textual metadata. Climate, vibe, stage temperature and block do not belong to the F5 music form; block membership is a separate feature.

## Drafts, uploads and persistence

- Creating a music and its versions is a single aggregate workflow. Keep the aggregate in client draft state until final save.
- New local media is first copied to a private temporary staging area. Only a successful final save promotes staged files to `storage/musicas/` or `storage/videos/`.
- A failed or cancelled save must leave no database records and no orphaned promoted media. Staged files may be safely cleaned up.
- Browser-facing media references use server HTTP URLs; Windows/WSL absolute paths are never returned to the browser.

## Classification and blocks

Historical text `bloco` remains independent for legacy compatibility. Reusable blocks are separate N:N relationships with their own sequence. F5 does not add climate/vibe/stage-temperature fields to music registration.

## Lives and execution

Planning, importing, exporting, editing and reordering never change `xEmLives`. Only a confirmed, idempotent real-execution transition changes it inside the same transaction. Legacy export preserves `youtube`, `arquivo`, `letra`, `observacao` and `interacoes`.

The F5 decisions above supersede provisional catalog defaults from earlier foundation drafts where they conflict.
