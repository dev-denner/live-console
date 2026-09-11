-- V1 keeps the legacy text status and ativo columns only for the temporary
-- /legacy adapter. The canonical V1 state is the boolean status_ativo.
ALTER TABLE musicas ADD COLUMN status_ativo INTEGER NOT NULL DEFAULT 1;

UPDATE musicas
SET status_ativo = CASE
  WHEN ativo IS NOT NULL THEN ativo
  WHEN status IS NULL THEN 1
  WHEN status = 'OK' THEN 1
  ELSE 0
END;

CREATE INDEX IF NOT EXISTS musicas_status_ativo_idx ON musicas(status_ativo);
