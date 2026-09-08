CREATE TABLE IF NOT EXISTS musicas (
  id TEXT PRIMARY KEY,
  artista TEXT NOT NULL,
  titulo TEXT NOT NULL,
  musica_base TEXT,
  status TEXT,
  observacoes TEXT,
  genero_primario TEXT,
  genero_secundario TEXT,
  x_em_lives INTEGER NOT NULL DEFAULT 0,
  origem TEXT,
  autoral INTEGER NOT NULL DEFAULT 0,
  duracao INTEGER,
  vibe_principal TEXT,
  vibe_secundaria TEXT,
  temperatura_de_palco TEXT,
  bloco TEXT,
  clima TEXT,
  letra_caminho TEXT,
  criada_em TEXT NOT NULL,
  atualizada_em TEXT NOT NULL,
  UNIQUE(artista, titulo, musica_base)
);
CREATE TABLE IF NOT EXISTS fontes_musica (
  id TEXT PRIMARY KEY,
  musica_id TEXT NOT NULL REFERENCES musicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('youtube','audio','video')),
  referencia TEXT NOT NULL,
  principal INTEGER NOT NULL DEFAULT 0,
  ordem INTEGER NOT NULL DEFAULT 1,
  duracao INTEGER,
  criada_em TEXT NOT NULL,
  atualizada_em TEXT NOT NULL,
  UNIQUE(musica_id, referencia)
);
CREATE UNIQUE INDEX IF NOT EXISTS uma_fonte_principal_por_musica ON fontes_musica(musica_id) WHERE principal = 1;
CREATE TABLE IF NOT EXISTS schema_migrations (nome TEXT PRIMARY KEY, aplicada_em TEXT NOT NULL);
