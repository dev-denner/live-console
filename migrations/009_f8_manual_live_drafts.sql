CREATE TABLE IF NOT EXISTS live_drafts (
  id TEXT PRIMARY KEY,
  nome TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status = 'draft'),
  composicao_json TEXT NOT NULL,
  criada_em TEXT NOT NULL,
  atualizada_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS live_drafts_atualizada_idx ON live_drafts(atualizada_em DESC);
