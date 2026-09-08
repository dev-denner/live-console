import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

const now = () => new Date().toISOString();
export function openDatabase(file) {
  mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (nome TEXT PRIMARY KEY, aplicada_em TEXT NOT NULL)');
  const folder = new URL('../migrations/', import.meta.url);
  for (const name of readdirSync(folder).filter(name => name.endsWith('.sql')).sort()) {
    if (!db.prepare('SELECT 1 FROM schema_migrations WHERE nome = ?').get(name)) {
      db.exec(readFileSync(join(folder.pathname, name), 'utf8'));
      db.prepare('INSERT INTO schema_migrations VALUES (?, ?)').run(name, now());
    }
  }
  return db;
}
export function listMusic(db, filters = {}) {
  let sql = 'SELECT * FROM musicas WHERE 1=1', args = [];
  for (const [column, value] of [['status','status'], ['bloco','bloco'], ['clima','clima']]) if (filters[value]) { sql += ` AND ${column} = ?`; args.push(filters[value]); }
  if (filters.autoral !== undefined) { sql += ' AND autoral = ?'; args.push(filters.autoral === 'true' || filters.autoral === true ? 1 : 0); }
  if (filters.q) { sql += ' AND (titulo LIKE ? OR artista LIKE ?)'; args.push(`%${filters.q}%`, `%${filters.q}%`); }
  return db.prepare(sql + ' ORDER BY artista, titulo').all(...args).map(song => ({ ...song, autoral: Boolean(song.autoral), fontes: db.prepare('SELECT * FROM fontes_musica WHERE musica_id = ? ORDER BY ordem').all(song.id) }));
}
export function saveMusic(db, input) {
  const id = input.id || randomUUID(), stamp = now(), base = input.musicaBase ?? input.titulo;
  const existing = db.prepare('SELECT id FROM musicas WHERE id = ?').get(id);
  const fields = ['artista','titulo','musica_base','status','observacoes','genero_primario','genero_secundario','x_em_lives','origem','autoral','duracao','vibe_principal','vibe_secundaria','temperatura_de_palco','bloco','clima','letra_caminho'];
  const values = [input.artista,input.titulo,base,input.status ?? null,input.observacoes ?? null,input.generoPrimario ?? null,input.generoSecundario ?? null,Number(input.xEmLives || 0),input.origem ?? null,input.autoral ? 1 : 0,input.duracao ?? null,input.vibePrincipal ?? null,input.vibeSecundaria ?? null,input.temperaturaDePalco ?? null,input.bloco ?? null,input.clima ?? null,input.letra ?? input.letraCaminho ?? null];
  if (existing) db.prepare(`UPDATE musicas SET ${fields.map(x => `${x} = ?`).join(', ')}, atualizada_em = ? WHERE id = ?`).run(...values, stamp, id);
  else db.prepare(`INSERT INTO musicas (id,${fields.join(',')},criada_em,atualizada_em) VALUES (${Array(fields.length + 3).fill('?').join(',')})`).run(id,...values,stamp,stamp);
  return id;
}
export function getMusic(db, id) { return listMusic(db).find(song => song.id === id) || null; }
export function removeMusic(db, id) { return db.prepare('DELETE FROM musicas WHERE id = ?').run(id).changes === 1; }
export function saveSource(db, musicId, input) {
  const stamp = now(), id = input.id || randomUUID();
  if (!['youtube','audio','video'].includes(input.tipo)) throw new Error('Tipo de fonte inválido');
  db.exec('BEGIN'); try {
    const count = db.prepare('SELECT count(*) AS count FROM fontes_musica WHERE musica_id = ?').get(musicId).count;
    const principal = input.principal ?? count === 0;
    if (principal) db.prepare('UPDATE fontes_musica SET principal = 0, atualizada_em = ? WHERE musica_id = ?').run(stamp, musicId);
    db.prepare('INSERT INTO fontes_musica (id,musica_id,nome,tipo,referencia,principal,ordem,duracao,criada_em,atualizada_em) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,musicId,input.nome || 'Referência',input.tipo,input.referencia,principal ? 1 : 0,Number(input.ordem || count + 1),input.duracao ?? null,stamp,stamp);
    db.exec('COMMIT'); return id;
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
export function exportCatalog(db) { return { musicas: listMusic(db).map(song => ({ artista:song.artista,titulo:song.titulo,musicaBase:song.musica_base,status:song.status,observacoes:song.observacoes,generoPrimario:song.genero_primario,generoSecundario:song.genero_secundario,xEmLives:song.x_em_lives,origem:song.origem,autoral:song.autoral,duracao:song.duracao,vibePrincipal:song.vibe_principal,vibeSecundaria:song.vibe_secundaria,temperaturaDePalco:song.temperatura_de_palco,bloco:song.bloco,clima:song.clima,letra:song.letra_caminho,fontes:song.fontes.map(f=>({nome:f.nome,tipo:f.tipo,referencia:f.referencia,principal:Boolean(f.principal),ordem:f.ordem,duracao:f.duracao})) })) }; }
