---
name: live-console-domain
description: Preserve the data, execution, compatibility and privacy invariants of Live Console.
version: 1.0
---

# Live Console domain invariants

## Local-first and privacy

SQLite, storage, catalog, music, media, lyrics, personal repertoires, exports, absolute paths and secrets remain local. Technical memory only records non-sensitive delivery facts.

## Catalog and references

- A music is a catalog work/version; a link or file is a playback reference/version.
- URLs, paths and source names are opaque and literal; never normalize or reconstruct them.
- Music can have zero or more references and at most one principal reference.
- A letter is singular per music. Unlinking never removes its physical file.
- New manual music defaults to `ensaiar`; automatic selection requires explicit `OK`.
- `musicaBase` excludes alternate versions in automatic assembly. If absent, the individual music is unique.

## Classification and blocks

Historical text `bloco` remains independent. Reusable blocks are separate N:N relationships with their own sequence. Vibe, climate and stage temperature are flexible text; no rigid taxonomy without approved spec.

## Lives and execution

Planning, importing, exporting, editing and reordering never change `xEmLives`. Only a confirmed, idempotent real-execution transition changes it inside the same transaction. Legacy export preserves `youtube`, `arquivo`, `letra`, `observacao` and `interacoes`.
