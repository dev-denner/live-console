# Live Console v1 rules

1. The live v0 remains functional at `/legacy` until an approved v1 replacement passes browser verification.
2. Do not extend legacy UI for new product features. Build them in the Angular v1 surface.
3. No feature starts from an implementation prompt alone: use `live-console-aidd` and create a PRD plus technical spec first.
4. API contracts are typed, Zod-validated and documented in the feature spec.
5. SQLite SQL files are the only schema migration authority. Drizzle reflects the schema and implements repositories; it does not generate, push or reset schema.
6. Do not use avoidable `any` or duplicate production persistence logic.
7. Browser validation is mandatory for UI changes. Verify the actual clickable path, not just route status or HTML delivery.
8. Preserve literal URLs/paths, legacy repertoire JSON and the `xEmLives` execution invariant.
9. Do not commit or log personal catalog, media, lyrics, paths, databases, exports, repertoire files, secrets or `.mcp.json`.
10. Supabase `denner-memory-chat` is limited to existing `public.memories` technical tracking records. Never access DJC for this project.
