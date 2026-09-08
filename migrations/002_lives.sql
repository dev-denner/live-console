CREATE TABLE IF NOT EXISTS lives (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  data TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK(status IN ('rascunho','finalizada')),
  observacoes TEXT,
  criada_em TEXT NOT NULL,
  atualizada_em TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS itens_da_live (
  id TEXT PRIMARY KEY,
  live_id TEXT NOT NULL REFERENCES lives(id) ON DELETE CASCADE,
  musica_id TEXT NOT NULL REFERENCES musicas(id) ON DELETE RESTRICT,
  referencia_reproducao TEXT NOT NULL,
  tipo_reproducao TEXT NOT NULL CHECK(tipo_reproducao IN ('youtube','audio','video')),
  ordem INTEGER NOT NULL,
  duracao_planejada INTEGER,
  observacao TEXT,
  interacoes TEXT,
  criada_em TEXT NOT NULL,
  atualizada_em TEXT NOT NULL,
  UNIQUE(live_id, ordem)
);
CREATE INDEX IF NOT EXISTS itens_da_live_por_live ON itens_da_live(live_id, ordem);
