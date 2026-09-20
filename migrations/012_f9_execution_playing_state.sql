PRAGMA foreign_keys = OFF;

CREATE TABLE execucao_itens_live_f9 (
  live_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  musica_id TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendente' CHECK(estado IN ('pendente','tocando','tocada','pulada')),
  executada_em TEXT,
  posicao_real INTEGER,
  referencia_usada TEXT,
  observacao TEXT,
  atualizada_em TEXT NOT NULL,
  tocada_em TEXT,
  confirmada_em TEXT,
  origem TEXT NOT NULL DEFAULT 'planejada' CHECK(origem IN ('planejada','adicionada_durante_execucao')),
  PRIMARY KEY(live_id,item_id)
);

INSERT INTO execucao_itens_live_f9(live_id,item_id,musica_id,estado,executada_em,posicao_real,referencia_usada,observacao,atualizada_em,tocada_em,confirmada_em,origem)
  SELECT live_id,item_id,musica_id,estado,executada_em,posicao_real,referencia_usada,observacao,atualizada_em,tocada_em,confirmada_em,origem
  FROM execucao_itens_live;
DROP TABLE execucao_itens_live;
ALTER TABLE execucao_itens_live_f9 RENAME TO execucao_itens_live;

PRAGMA foreign_keys = ON;
