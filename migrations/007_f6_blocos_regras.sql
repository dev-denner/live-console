-- F6: a música-base pertence a no máximo um bloco e cada bloco tem até 10 músicas.
-- Triggers preservam dados antigos sem apagar duplicidades existentes durante a migration;
-- novas associações passam a respeitar a regra imediatamente.
CREATE TRIGGER IF NOT EXISTS musicas_do_bloco_exclusividade_insert
BEFORE INSERT ON musicas_do_bloco
WHEN EXISTS (
  SELECT 1 FROM musicas_do_bloco
  WHERE musica_id = NEW.musica_id AND bloco_id <> NEW.bloco_id
)
BEGIN
  SELECT RAISE(ABORT, 'Música já pertence a outro bloco');
END;

CREATE TRIGGER IF NOT EXISTS musicas_do_bloco_exclusividade_update
BEFORE UPDATE OF musica_id, bloco_id ON musicas_do_bloco
WHEN EXISTS (
  SELECT 1 FROM musicas_do_bloco
  WHERE musica_id = NEW.musica_id AND bloco_id <> NEW.bloco_id
)
BEGIN
  SELECT RAISE(ABORT, 'Música já pertence a outro bloco');
END;

CREATE TRIGGER IF NOT EXISTS musicas_do_bloco_limite_insert
BEFORE INSERT ON musicas_do_bloco
WHEN (SELECT COUNT(*) FROM musicas_do_bloco WHERE bloco_id = NEW.bloco_id) >= 10
BEGIN
  SELECT RAISE(ABORT, 'Bloco limitado a 10 músicas');
END;
