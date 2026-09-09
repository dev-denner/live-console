import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { addBlockMusic, addSource, createBlock, createLive, createMusic, getBlock, getLive, openDatabase, reorderBlockMusic } from '../src/db/repositories.js';
import { createApp } from '../server.js';

test('blocos são N:N, ordenados e entram atomicamente em live rascunho', async () => {
  const root=mkdtempSync(join(tmpdir(),'blocks-')),db=openDatabase(join(root,'db.sqlite'));
  const a=createMusic(db,{artista:'A',titulo:'Um',xEmLives:4}),b=createMusic(db,{artista:'B',titulo:'Dois'});
  addSource(db,a,{nome:'A',tipo:'youtube',referencia:'https://example.test/a'});addSource(db,b,{nome:'B',tipo:'audio',referencia:'fixture-b'});
  const one=createBlock(db,{nome:'Entrada'}),two=createBlock(db,{nome:'Também'});addBlockMusic(db,one,a);addBlockMusic(db,one,b);addBlockMusic(db,two,a);
  assert.throws(()=>addBlockMusic(db,one,a),/já pertence/);reorderBlockMusic(db,one,[b,a]);assert.deepEqual(getBlock(db,one).musicas.map((m:{id:string})=>m.id),[b,a]);
  const live=createLive(db,{titulo:'Rascunho'}),app=createApp({database:db,storageRoot:root});
  let response=await app.inject({method:'POST',url:`/api/lives/${live}/blocos/${one}/itens`});assert.equal(response.statusCode,200);assert.equal(response.json<{adicionados:string[]}>().adicionados.length,2);response=await app.inject({method:'POST',url:`/api/lives/${live}/blocos/${one}/itens`});assert.equal(response.json<{ignorados:string[]}>().ignorados.length,2);assert.equal(getLive(db,live).itens.length,2);assert.equal(db.prepare('SELECT x_em_lives FROM musicas WHERE id=?').get(a).x_em_lives,4);
  await app.close();db.close();
});

test('bloco sem principal não insere parcialmente e live finalizada conflita', async () => {
  const root=mkdtempSync(join(tmpdir(),'blocks-')),db=openDatabase(join(root,'db.sqlite')),song=createMusic(db,{artista:'A',titulo:'Sem fonte'}),block=createBlock(db,{nome:'Inválido'}),live=createLive(db,{titulo:'Rascunho'});addBlockMusic(db,block,song);const app=createApp({database:db,storageRoot:root});
  let response=await app.inject({method:'POST',url:`/api/lives/${live}/blocos/${block}/itens`});assert.equal(response.statusCode,409);assert.equal(getLive(db,live).itens.length,0);db.prepare("UPDATE lives SET status='finalizada' WHERE id=?").run(live);response=await app.inject({method:'POST',url:`/api/lives/${live}/blocos/${block}/itens`});assert.equal(response.statusCode,409);await app.close();db.close();
});
