CREATE TABLE IF NOT EXISTS blocos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  criada_em TEXT NOT NULL,
  atualizada_em TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS musicas_do_bloco (
  bloco_id TEXT NOT NULL REFERENCES blocos(id) ON DELETE CASCADE,
  musica_id TEXT NOT NULL REFERENCES musicas(id) ON DELETE RESTRICT,
  ordem INTEGER NOT NULL CHECK(ordem > 0),
  criada_em TEXT NOT NULL,
  PRIMARY KEY (bloco_id, musica_id),
  UNIQUE (bloco_id, ordem)
);
CREATE INDEX IF NOT EXISTS musicas_do_bloco_por_musica ON musicas_do_bloco(musica_id);
