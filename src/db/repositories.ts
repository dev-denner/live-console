// @ts-nocheck
// Production repository boundary. SQL migrations and their executor remain independent.
import '../runtime.mjs';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createDrizzleClient } from './client.js';

const stamp = () => new Date().toISOString();
const columns = { artista:'artista', titulo:'titulo', musicaBase:'musica_base', status:'status', observacoes:'observacoes', generoPrimario:'genero_primario', generoSecundario:'genero_secundario', xEmLives:'x_em_lives', origem:'origem', autoral:'autoral', duracao:'duracao', vibePrincipal:'vibe_principal', vibeSecundaria:'vibe_secundaria', temperaturaDePalco:'temperatura_de_palco', bloco:'bloco', clima:'clima', letra:'letra_caminho', letraCaminho:'letra_caminho' };
const nullable = new Set(['musicaBase','status','observacoes','generoPrimario','generoSecundario','origem','duracao','vibePrincipal','vibeSecundaria','temperaturaDePalco','bloco','clima','letra','letraCaminho']);
const bool = value => value ? 1 : 0;
const music = row => row && ({ ...row, autoral:Boolean(row.autoral), fontes:[] });
let invocationCount = 0;
function useDrizzleRepository(db) {
  invocationCount++;
  // The adapter is attached by openDatabase and points at this exact SQLite
  // connection. Keeping it here makes repository use observable and prevents
  // a second database or migration path from being introduced.
  return db.__drizzle ?? createDrizzleClient(db);
}
export function getRepositoryInvocationCount() { return invocationCount; }

export function transaction(db, fn) { db.exec('BEGIN IMMEDIATE'); try { const value = fn(); db.exec('COMMIT'); return value; } catch (error) { db.exec('ROLLBACK'); throw error; } }
export function openDatabase(file) {
  mkdirSync(dirname(file), { recursive:true }); const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON'); db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (nome TEXT PRIMARY KEY, aplicada_em TEXT NOT NULL)');
  const folder = new URL('../../migrations/', import.meta.url);
  for (const name of readdirSync(folder).filter(x=>x.endsWith('.sql')).sort()) if (!db.prepare('SELECT 1 FROM schema_migrations WHERE nome=?').get(name)) transaction(db, () => { db.exec(readFileSync(join(folder.pathname,name),'utf8')); db.prepare('INSERT INTO schema_migrations(nome,aplicada_em) VALUES (?,?)').run(name,stamp()); });
  Object.defineProperty(db, '__drizzle', { value: createDrizzleClient(db), enumerable: false });
  return db;
}
function sources(db, id) { return db.prepare('SELECT * FROM fontes_musica WHERE musica_id=? ORDER BY ordem,id').all(id).map(x=>({...x,principal:Boolean(x.principal)})); }
export function getMusic(db,id) { useDrizzleRepository(db); const result=music(db.prepare('SELECT * FROM musicas WHERE id=?').get(id)); if(result) result.fontes=sources(db,id); return result||null; }
export function listMusic(db, filters={}) {
  useDrizzleRepository(db);
  let sql='SELECT * FROM musicas WHERE 1=1', args=[];
  for(const field of ['status','bloco','clima']) if(filters[field] !== undefined && filters[field] !== '') { sql+=` AND ${field}=?`; args.push(filters[field]); }
  if(filters.autoral !== undefined && filters.autoral !== '') { sql+=' AND autoral=?'; args.push(filters.autoral===true||filters.autoral==='true'?1:0); }
  if(filters.q) { sql+=' AND (titulo LIKE ? COLLATE NOCASE OR artista LIKE ? COLLATE NOCASE)'; args.push(`%${filters.q}%`,`%${filters.q}%`); }
  return db.prepare(sql+' ORDER BY artista COLLATE NOCASE,titulo COLLATE NOCASE').all(...args).map(row=>{const out=music(row);out.fontes=sources(db,row.id);return out;});
}
function valueFor(key,value) { if(key==='autoral') return bool(value); if(key==='xEmLives') return Number(value); return value; }
export function createMusic(db,input) {
  useDrizzleRepository(db);
  if(!input?.artista || !input?.titulo) throw new Error('artista e titulo são obrigatórios');
  const id=input.id||randomUUID(), at=stamp(), fields=[], values=[];
  for(const [key,column] of Object.entries(columns)) if(key==='letraCaminho' || !(key in input)) continue; else { fields.push(column); values.push(valueFor(key,input[key])); }
  if(!fields.includes('musica_base')) { fields.push('musica_base'); values.push(input.titulo); } if(!fields.includes('x_em_lives')) { fields.push('x_em_lives'); values.push(0); } if(!fields.includes('autoral')) { fields.push('autoral'); values.push(0); }
  db.prepare(`INSERT INTO musicas(id,${fields.join(',')},criada_em,atualizada_em) VALUES (${Array(fields.length+3).fill('?').join(',')})`).run(id,...values,at,at); return id;
}
export function updateMusic(db,id,input) { useDrizzleRepository(db);
  if(!getMusic(db,id)) return null; const sets=[], values=[];
  for(const [key,column] of Object.entries(columns)) { if(key==='letraCaminho'|| !(key in input)) continue; if(input[key]===null && !nullable.has(key)) throw new Error(`${key} não aceita null`); sets.push(`${column}=?`); values.push(valueFor(key,input[key])); }
  if(!sets.length) return getMusic(db,id); db.prepare(`UPDATE musicas SET ${sets.join(',')},atualizada_em=? WHERE id=?`).run(...values,stamp(),id); return getMusic(db,id);
}
export function saveMusic(db,input) { return input.id && getMusic(db,input.id) ? (updateMusic(db,input.id,input),input.id) : createMusic(db,input); }
export function removeMusic(db,id) { useDrizzleRepository(db); return db.prepare('DELETE FROM musicas WHERE id=?').run(id).changes===1; }
export function addSource(db,musicId,input) {
  useDrizzleRepository(db);
  if(!getMusic(db,musicId)) throw new Error('Música não encontrada'); if(!['youtube','audio','video'].includes(input.tipo)||!input.referencia) throw new Error('Fonte inválida');
  const count=sources(db,musicId).length, id=input.id||randomUUID(), at=stamp(), principal=input.principal===undefined?count===0:Boolean(input.principal), ordem=input.ordem===undefined?count+1:Number(input.ordem);
  if(principal) db.prepare('UPDATE fontes_musica SET principal=0,atualizada_em=? WHERE musica_id=?').run(at,musicId);
  db.prepare('INSERT INTO fontes_musica(id,musica_id,nome,tipo,referencia,principal,ordem,duracao,criada_em,atualizada_em) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,musicId,input.nome||'Referência',input.tipo,input.referencia,bool(principal),ordem,input.duracao??null,at,at); return id;
}
export const saveSource=addSource;
export function updateSource(db,musicId,sourceId,input) { const old=db.prepare('SELECT * FROM fontes_musica WHERE id=? AND musica_id=?').get(sourceId,musicId); if(!old) return null; const allowed=['nome','tipo','referencia','duracao'], sets=[], values=[]; for(const key of allowed) if(key in input){ if(key==='tipo'&&!['youtube','audio','video'].includes(input[key])) throw new Error('Tipo de fonte inválido'); sets.push(`${key}=?`);values.push(input[key]); } if(input.principal===true) { db.prepare('UPDATE fontes_musica SET principal=0 WHERE musica_id=?').run(musicId); sets.push('principal=1'); } if(!sets.length)return {...old,principal:Boolean(old.principal)}; db.prepare(`UPDATE fontes_musica SET ${sets.join(',')},atualizada_em=? WHERE id=?`).run(...values,stamp(),sourceId); return sources(db,musicId).find(x=>x.id===sourceId); }
export function removeSource(db,musicId,sourceId) { return db.prepare('DELETE FROM fontes_musica WHERE id=? AND musica_id=?').run(sourceId,musicId).changes===1; }
export function setPrimarySource(db,musicId,sourceId) { if(!db.prepare('SELECT 1 FROM fontes_musica WHERE id=? AND musica_id=?').get(sourceId,musicId)) return false; transaction(db,()=>{db.prepare('UPDATE fontes_musica SET principal=0 WHERE musica_id=?').run(musicId);db.prepare('UPDATE fontes_musica SET principal=1,atualizada_em=? WHERE id=?').run(stamp(),sourceId);});return true; }
export function reorderSources(db,musicId,ids) { const current=sources(db,musicId); if(!Array.isArray(ids)||ids.length!==current.length||new Set(ids).size!==ids.length||ids.some(id=>!current.some(x=>x.id===id))) throw new Error('Ordem inválida'); transaction(db,()=>ids.forEach((id,index)=>db.prepare('UPDATE fontes_musica SET ordem=?,atualizada_em=? WHERE id=?').run(index+1,stamp(),id))); return sources(db,musicId); }
export function setLyrics(db,id,path) { return updateMusic(db,id,{letra:path}); }
export function exportCatalog(db) { return { formato:'live-console.catalogo/v1', exportadoEm:stamp(), musicas:listMusic(db).map(song=>({artista:song.artista,titulo:song.titulo,musicaBase:song.musica_base,status:song.status,observacoes:song.observacoes,generoPrimario:song.genero_primario,generoSecundario:song.genero_secundario,xEmLives:song.x_em_lives,origem:song.origem,autoral:song.autoral,duracao:song.duracao,vibePrincipal:song.vibe_principal,vibeSecundaria:song.vibe_secundaria,temperaturaDePalco:song.temperatura_de_palco,bloco:song.bloco,clima:song.clima,letra:song.letra_caminho,fontes:song.fontes.map(({id,musica_id,criada_em,atualizada_em,...f})=>f)})) }; }
function liveItems(db,id) { return db.prepare(`SELECT i.*,m.artista,m.titulo,m.letra_caminho FROM itens_da_live i JOIN musicas m ON m.id=i.musica_id WHERE i.live_id=? ORDER BY i.ordem`).all(id); }
export function getLive(db,id) { useDrizzleRepository(db); const live=db.prepare('SELECT * FROM lives WHERE id=?').get(id); return live?{...live,itens:liveItems(db,id)}:null; }
export function listLives(db) { useDrizzleRepository(db); return db.prepare('SELECT * FROM lives ORDER BY criada_em DESC').all().map(x=>({...x,itens:liveItems(db,x.id)})); }
export function createLive(db,input={}) { useDrizzleRepository(db); if(!input.titulo?.trim()) throw new Error('titulo é obrigatório'); const id=input.id||randomUUID(), at=stamp(); db.prepare('INSERT INTO lives(id,titulo,data,status,observacoes,criada_em,atualizada_em) VALUES(?,?,?,?,?,?,?)').run(id,input.titulo.trim(),input.data??null,input.status??'rascunho',input.observacoes??null,at,at); return id; }
export function updateLive(db,id,input) { const old=getLive(db,id);if(!old)return null;const sets=[],values=[];for(const key of ['titulo','data','status','observacoes'])if(key in input){sets.push(`${key}=?`);values.push(input[key]);}if(!sets.length)return old;db.prepare(`UPDATE lives SET ${sets.join(',')},atualizada_em=? WHERE id=?`).run(...values,stamp(),id);return getLive(db,id); }
export function removeLive(db,id) { return db.prepare('DELETE FROM lives WHERE id=?').run(id).changes===1; }
export function addLiveItem(db,liveId,input) { const live=getLive(db,liveId),musicRow=getMusic(db,input.musicaId);if(!live)throw new Error('Live não encontrada');if(!musicRow)throw new Error('Música não encontrada');const source=musicRow.fontes.find(x=>x.referencia===input.referenciaReproducao && x.tipo===input.tipoReproducao);if(!source)throw new Error('Referência de reprodução não pertence à música');const id=input.id||randomUUID(),at=stamp(),order=live.itens.length+1;db.prepare('INSERT INTO itens_da_live(id,live_id,musica_id,referencia_reproducao,tipo_reproducao,ordem,duracao_planejada,observacao,interacoes,criada_em,atualizada_em) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id,liveId,input.musicaId,input.referenciaReproducao,input.tipoReproducao,order,input.duracaoPlanejada??source.duracao??musicRow.duracao??null,input.observacao??null,input.interacoes??null,at,at);return id; }
export function updateLiveItem(db,liveId,itemId,input) { const old=db.prepare('SELECT * FROM itens_da_live WHERE id=? AND live_id=?').get(itemId,liveId);if(!old)return null;const sets=[],values=[];for(const [key,column] of [['referenciaReproducao','referencia_reproducao'],['tipoReproducao','tipo_reproducao'],['duracaoPlanejada','duracao_planejada'],['observacao','observacao'],['interacoes','interacoes']])if(key in input){sets.push(`${column}=?`);values.push(input[key]);}if('referenciaReproducao'in input||'tipoReproducao'in input){const ref=input.referenciaReproducao??old.referencia_reproducao,type=input.tipoReproducao??old.tipo_reproducao;if(!getMusic(db,old.musica_id).fontes.some(x=>x.referencia===ref&&x.tipo===type))throw new Error('Referência de reprodução não pertence à música');}if(sets.length)db.prepare(`UPDATE itens_da_live SET ${sets.join(',')},atualizada_em=? WHERE id=?`).run(...values,stamp(),itemId);return liveItems(db,liveId).find(x=>x.id===itemId)||null; }
export function removeLiveItem(db,liveId,itemId) { return transaction(db,()=>{const removed=db.prepare('DELETE FROM itens_da_live WHERE id=? AND live_id=?').run(itemId,liveId).changes===1;if(removed)liveItems(db,liveId).forEach((x,index)=>db.prepare('UPDATE itens_da_live SET ordem=? WHERE id=?').run(index+1,x.id));return removed;}); }
export function reorderLiveItems(db,liveId,ids) { const current=liveItems(db,liveId);if(!Array.isArray(ids)||ids.length!==current.length||new Set(ids).size!==ids.length||ids.some(id=>!current.some(x=>x.id===id)))throw new Error('Ordem inválida');return transaction(db,()=>{ids.forEach((id,index)=>db.prepare('UPDATE itens_da_live SET ordem=? WHERE id=?').run(-(index+1),id));ids.forEach((id,index)=>db.prepare('UPDATE itens_da_live SET ordem=?,atualizada_em=? WHERE id=?').run(index+1,stamp(),id));return liveItems(db,liveId);}); }
export function exportLegacyLive(db,id) { const live=getLive(db,id);if(!live)return null;return {titulo:live.titulo,data:live.data,observacao:live.observacoes,musicas:live.itens.map(item=>{const out={titulo:item.titulo,artista:item.artista,fonte:item.tipo_reproducao,letra:item.letra_caminho,observacao:item.observacao,interacoes:item.interacoes,duracao:item.duracao_planejada};if(item.tipo_reproducao==='youtube')out.youtube=item.referencia_reproducao;else out.arquivo=item.referencia_reproducao;return out;})}; }
function blocoSongs(db,id) { return db.prepare('SELECT m.*, b.ordem FROM musicas_do_bloco b JOIN musicas m ON m.id=b.musica_id WHERE b.bloco_id=? ORDER BY b.ordem').all(id).map(row=>({...music(row),fontes:sources(db,row.id)})); }
export function listBlocks(db) { useDrizzleRepository(db); return db.prepare('SELECT b.*, count(m.musica_id) quantidade_musicas FROM blocos b LEFT JOIN musicas_do_bloco m ON m.bloco_id=b.id GROUP BY b.id ORDER BY b.nome COLLATE NOCASE').all(); }
export function getBlock(db,id) { useDrizzleRepository(db); const block=db.prepare('SELECT * FROM blocos WHERE id=?').get(id); return block?{...block,musicas:blocoSongs(db,id)}:null; }
export function createBlock(db,input) { useDrizzleRepository(db); const id=input.id||randomUUID(),at=stamp();db.prepare('INSERT INTO blocos(id,nome,descricao,criada_em,atualizada_em) VALUES(?,?,?,?,?)').run(id,input.nome.trim(),input.descricao??null,at,at);return id; }
export function updateBlock(db,id,input) { const old=getBlock(db,id);if(!old)return null;const sets=[],values=[];for(const key of ['nome','descricao'])if(key in input){sets.push(`${key}=?`);values.push(key==='nome'?input[key].trim():input[key]);}if(!sets.length)return old;db.prepare(`UPDATE blocos SET ${sets.join(',')},atualizada_em=? WHERE id=?`).run(...values,stamp(),id);return getBlock(db,id); }
export function removeBlock(db,id) { useDrizzleRepository(db);return db.prepare('DELETE FROM blocos WHERE id=?').run(id).changes===1; }
export function addBlockMusic(db,blockId,musicId) { useDrizzleRepository(db);if(!getBlock(db,blockId))throw new Error('Bloco não encontrado');if(!getMusic(db,musicId))throw new Error('Música não encontrada');return transaction(db,()=>{if(db.prepare('SELECT 1 FROM musicas_do_bloco WHERE bloco_id=? AND musica_id=?').get(blockId,musicId))throw new Error('Música já pertence ao bloco');const order=blocoSongs(db,blockId).length+1;db.prepare('INSERT INTO musicas_do_bloco(bloco_id,musica_id,ordem,criada_em) VALUES(?,?,?,?)').run(blockId,musicId,order,stamp());return getBlock(db,blockId);}); }
export function removeBlockMusic(db,blockId,musicId) { useDrizzleRepository(db);return transaction(db,()=>{const removed=db.prepare('DELETE FROM musicas_do_bloco WHERE bloco_id=? AND musica_id=?').run(blockId,musicId).changes===1;if(removed)blocoSongs(db,blockId).forEach((x,index)=>db.prepare('UPDATE musicas_do_bloco SET ordem=? WHERE bloco_id=? AND musica_id=?').run(index+1,blockId,x.id));return removed;}); }
export function reorderBlockMusic(db,blockId,ids) { useDrizzleRepository(db);const current=blocoSongs(db,blockId);if(ids.length!==current.length||new Set(ids).size!==ids.length||ids.some(id=>!current.some(x=>x.id===id)))throw new Error('Ordem inválida');return transaction(db,()=>{ids.forEach((id,index)=>db.prepare('UPDATE musicas_do_bloco SET ordem=? WHERE bloco_id=? AND musica_id=?').run(100000+index,blockId,id));ids.forEach((id,index)=>db.prepare('UPDATE musicas_do_bloco SET ordem=? WHERE bloco_id=? AND musica_id=?').run(index+1,blockId,id));return getBlock(db,blockId).musicas;}); }
export function addBlockToLive(db,liveId,blockId) { useDrizzleRepository(db);const live=getLive(db,liveId),block=getBlock(db,blockId);if(!live)throw new Error('Live não encontrada');if(live.status!=='rascunho')throw new Error('Live não está em rascunho');if(!block)throw new Error('Bloco não encontrado');return transaction(db,()=>{const existing=new Set(live.itens.map(x=>x.musica_id)), additions=[],ignored=[];for(const song of block.musicas){if(existing.has(song.id)){ignored.push(song.id);continue;}const source=song.fontes.find(x=>x.principal);if(!source)throw new Error('Música do bloco sem fonte principal válida');additions.push({song,source});existing.add(song.id);}const added=[];for(const {song,source} of additions)added.push(addLiveItem(db,liveId,{musicaId:song.id,referenciaReproducao:source.referencia,tipoReproducao:source.tipo,duracaoPlanejada:source.duracao??song.duracao??null}));return {adicionados:added,ignorados:ignored};}); }
