PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS lives_f9 (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  data TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK(status IN ('rascunho','fechado','em_execucao','executado','cancelado','finalizada','em_andamento','encerrada')),
  observacoes TEXT,
  quantidade_alvo INTEGER,
  fechado_em TEXT,
  executado_em TEXT,
  criada_em TEXT NOT NULL,
  atualizada_em TEXT NOT NULL
);
INSERT OR IGNORE INTO lives_f9(id,titulo,data,status,observacoes,criada_em,atualizada_em)
  SELECT id,titulo,data,status,observacoes,criada_em,atualizada_em FROM lives;
DROP TABLE lives;
ALTER TABLE lives_f9 RENAME TO lives;

ALTER TABLE itens_da_live ADD COLUMN bloco_id TEXT REFERENCES blocos(id) ON DELETE SET NULL;
ALTER TABLE itens_da_live ADD COLUMN eh_abertura INTEGER NOT NULL DEFAULT 0;
ALTER TABLE itens_da_live ADD COLUMN referencia_snapshot TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS itens_da_live_musica_unica ON itens_da_live(live_id,musica_id);
CREATE UNIQUE INDEX IF NOT EXISTS itens_da_live_abertura_unica ON itens_da_live(live_id) WHERE eh_abertura = 1;

ALTER TABLE execucao_lives ADD COLUMN status TEXT NOT NULL DEFAULT 'ativa' CHECK(status IN ('ativa','encerrada','cancelada'));
ALTER TABLE execucao_lives ADD COLUMN reconciliada_em TEXT;
ALTER TABLE execucao_lives ADD COLUMN chave_idempotencia TEXT;
CREATE TABLE IF NOT EXISTS reconciliacoes_execucao (
  sessao_id TEXT NOT NULL,
  musica_id TEXT NOT NULL,
  criada_em TEXT NOT NULL,
  PRIMARY KEY(sessao_id,musica_id),
  FOREIGN KEY(sessao_id) REFERENCES execucao_lives(live_id) ON DELETE CASCADE,
  FOREIGN KEY(musica_id) REFERENCES musicas(id) ON DELETE RESTRICT
);
ALTER TABLE execucao_itens_live ADD COLUMN tocada_em TEXT;
ALTER TABLE execucao_itens_live ADD COLUMN confirmada_em TEXT;
ALTER TABLE execucao_itens_live ADD COLUMN origem TEXT NOT NULL DEFAULT 'planejada' CHECK(origem IN ('planejada','adicionada_durante_execucao'));

PRAGMA foreign_keys = ON;
