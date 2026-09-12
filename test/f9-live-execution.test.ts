import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { addLiveItem, addSource, createLive, createMusic, getMusic, openDatabase, reorderLiveItems } from '../src/db/repositories.js';
import { createApp } from '../server.js';

test('F9 executa fora da ordem, exige Play e reconcilia xEmLives apenas ao encerrar', async () => {
  const root=mkdtempSync(join(tmpdir(),'f9-')), db=openDatabase(join(root,'db.sqlite'));
  const songs=[['A','A'],['B','B'],['C','C']].map(([artista,titulo])=>{const id=createMusic(db,{artista,titulo});addSource(db,id,{nome:'YouTube',tipo:'youtube',referencia:`https://example.test/${titulo}`});return id;});
  const app=createApp({database:db,storageRoot:root}); const live=createLive(db,{titulo:'Live F9'});
  for(const id of songs) await app.inject({method:'POST',url:`/api/lives/${live}/itens`,payload:{musicaId:id,referenciaReproducao:`https://example.test/${id===songs[0]?'A':id===songs[1]?'B':'C'}`,tipoReproducao:'youtube'}});
  assert.equal((await app.inject({method:'POST',url:`/api/repertorios/${live}/fechar`})).statusCode,200);
  assert.equal((await app.inject({method:'POST',url:`/api/repertorios/${live}/executar`,payload:{idempotencyKey:crypto.randomUUID()}})).statusCode,200);
  const items=(await app.inject({method:'GET',url:`/api/lives/${live}`})).json().live.itens;
  let response=await app.inject({method:'POST',url:`/api/execucoes/${live}/itens/${items[1].id}/marcar-tocada`,payload:{idempotencyKey:crypto.randomUUID()}});assert.equal(response.statusCode,409);
  await app.inject({method:'POST',url:`/api/execucoes/${live}/itens/${items[1].id}/play`,payload:{idempotencyKey:crypto.randomUUID()}});
  await app.inject({method:'POST',url:`/api/execucoes/${live}/itens/${items[1].id}/marcar-tocada`,payload:{idempotencyKey:crypto.randomUUID()}});
  assert.equal(getMusic(db,songs[1]).x_em_lives,0);
  response=await app.inject({method:'POST',url:`/api/execucoes/${live}/encerrar`,payload:{idempotencyKey:crypto.randomUUID()}});assert.equal(response.statusCode,200);assert.equal(getMusic(db,songs[1]).x_em_lives,1);
  const before=getMusic(db,songs[1]).x_em_lives; await app.inject({method:'POST',url:`/api/execucoes/${live}/encerrar`,payload:{idempotencyKey:crypto.randomUUID()}});assert.equal(getMusic(db,songs[1]).x_em_lives,before);
  await app.close();db.close();
});

test('F9 impede duplicidade, remoção em execução e duplica sem histórico', async () => {
  const root=mkdtempSync(join(tmpdir(),'f9-')), db=openDatabase(join(root,'db.sqlite'));const song=createMusic(db,{artista:'A',titulo:'A'});addSource(db,song,{nome:'Y',tipo:'youtube',referencia:'ref'});const live=createLive(db,{titulo:'Original'});const app=createApp({database:db,storageRoot:root});
  const payload={musicaId:song,referenciaReproducao:'ref',tipoReproducao:'youtube'};assert.equal((await app.inject({method:'POST',url:`/api/lives/${live}/itens`,payload})).statusCode,201);assert.equal((await app.inject({method:'POST',url:`/api/lives/${live}/itens`,payload})).statusCode,409);await app.inject({method:'POST',url:`/api/repertorios/${live}/fechar`});const copy=await app.inject({method:'POST',url:`/api/repertorios/${live}/duplicar`});assert.equal(copy.statusCode,201);assert.equal(copy.json().copiados.length,1);assert.equal(copy.json().live.status,'rascunho');assert.equal(copy.json().live.itens.length,1);await app.close();db.close();
});

test('F9 protege reordenação imutável, abertura e música tocada', async () => {
  const root=mkdtempSync(join(tmpdir(),'f9-')),db=openDatabase(join(root,'db.sqlite')),app=createApp({database:db,storageRoot:root});
  const ids=['A','B'].map(titulo=>{const id=createMusic(db,{artista:titulo,titulo});addSource(db,id,{nome:'Y',tipo:'youtube',referencia:`https://example.test/${titulo}`});return id;}); const live=createLive(db,{titulo:'Regras'});
  for(const [index,id] of ids.entries()) addLiveItem(db,live,{musicaId:id,referenciaReproducao:`https://example.test/${index?'B':'A'}`,tipoReproducao:'youtube',ehAbertura:index===0});
  const items=(await app.inject({method:'GET',url:`/api/lives/${live}`})).json().live.itens; assert.throws(()=>reorderLiveItems(db,live,[items[1].id,items[0].id]),/abertura/);
  await app.inject({method:'POST',url:`/api/repertorios/${live}/fechar`}); assert.throws(()=>reorderLiveItems(db,live,[items[0].id,items[1].id]),/não permite/);
  await app.inject({method:'POST',url:`/api/repertorios/${live}/executar`,payload:{idempotencyKey:crypto.randomUUID()}}); await app.inject({method:'POST',url:`/api/execucoes/${live}/itens/${items[1].id}/play`,payload:{idempotencyKey:crypto.randomUUID()}}); await app.inject({method:'POST',url:`/api/execucoes/${live}/itens/${items[1].id}/marcar-tocada`,payload:{idempotencyKey:crypto.randomUUID()}});
  let response=await app.inject({method:'POST',url:`/api/execucoes/${live}/itens/${items[1].id}/play`,payload:{idempotencyKey:crypto.randomUUID()}});assert.equal(response.statusCode,409);response=await app.inject({method:'POST',url:`/api/execucoes/${live}/itens/${items[1].id}/desfazer-tocada`,payload:{idempotencyKey:crypto.randomUUID()}});assert.equal(response.statusCode,409);await app.close();db.close();
});
