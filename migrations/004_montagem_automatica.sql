CREATE TABLE IF NOT EXISTS montagens_da_live (
  live_id TEXT PRIMARY KEY REFERENCES lives(id) ON DELETE CASCADE,
  criterios_json TEXT NOT NULL,
  resultado_json TEXT NOT NULL,
  criada_em TEXT NOT NULL,
  atualizada_em TEXT NOT NULL
);
