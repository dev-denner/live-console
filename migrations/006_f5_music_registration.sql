ALTER TABLE musicas ADD COLUMN ativo INTEGER NOT NULL DEFAULT 1;
ALTER TABLE fontes_musica ADD COLUMN abertura INTEGER NOT NULL DEFAULT 0;
DROP INDEX IF EXISTS uma_fonte_principal_por_musica;
CREATE UNIQUE INDEX IF NOT EXISTS uma_fonte_principal_por_musica ON fontes_musica(musica_id) WHERE principal = 1;
CREATE UNIQUE INDEX IF NOT EXISTS fontes_musica_ordem_unica ON fontes_musica(musica_id, ordem);
