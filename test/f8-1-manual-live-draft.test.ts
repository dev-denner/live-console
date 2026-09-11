import { strict as assert } from 'node:assert';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { createApp } from '../server.js';
import { addBlockMusic, createBlock, createMusic, addSource, openDatabase } from '../src/db/repositories.js';

test('F8.1 cria, valida e reabre rascunho manual sem alterar catálogo', async () => {
  const root=mkdtempSync(join(tmpdir(),'live-console-f8-')); const db=openDatabase(join(root,'db.sqlite')); mkdirSync(join(root,'musicas')); mkdirSync(join(root,'videos')); writeFileSync(join(root,'musicas','local.mp3'),'audio'); writeFileSync(join(root,'videos','valid.mp4'),'video');
  const opening=createMusic(db,{artista:'Abertura',titulo:'Começo',ativo:true}); addSource(db,opening,{nome:'YouTube',tipo:'youtube',referencia:'https://youtu.be/open',abertura:true,principal:true});
  const local=createMusic(db,{artista:'Banda',titulo:'Local',ativo:true,xEmLives:7}); addSource(db,local,{nome:'Áudio',tipo:'audio',referencia:'musicas/local.mp3',principal:true});
  const inactive=createMusic(db,{artista:'Inativa',titulo:'Fora',ativo:false}); addSource(db,inactive,{nome:'YouTube',tipo:'youtube',referencia:'https://youtu.be/off',principal:true});
  const block=createBlock(db,{nome:'Bloco alto astral'}); const grouped=createMusic(db,{artista:'Grupo',titulo:'Bloco 1',ativo:true,xEmLives:2}); addSource(db,grouped,{nome:'Vídeo',tipo:'video',referencia:'videos/valid.mp4',principal:true}); addBlockMusic(db,block,grouped);
  const app=createApp({database:db,storageRoot:root});
  let response=await app.inject({method:'POST',url:'/api/v1/live-drafts'}); assert.equal(response.statusCode,201); const id=response.json<{rascunho:{id:string;opcoes:{aberturas:any[];blocos:any[];musicasSemBloco:any[]}}}>().rascunho.id; const options=response.json<{rascunho:{opcoes:{aberturas:any[];blocos:any[];musicasSemBloco:any[]}}}>().rascunho.opcoes;
  assert.equal(options.aberturas.length,1); assert.equal(options.musicasSemBloco.some((song:any)=>song.id===inactive),false); assert.equal(options.musicasSemBloco.some((song:any)=>song.id===local),true); assert.equal(options.musicasSemBloco.some((song:any)=>song.id===grouped),false); assert.equal(options.blocos.length,1);
  const openingOption=options.aberturas[0]; const localOption=options.musicasSemBloco.find((song:any)=>song.id===local); response=await app.inject({method:'PUT',url:`/api/v1/live-drafts/${id}`,payload:{nome:'Live de hoje',composicao:{abertura:{musicaId:openingOption.id,versaoId:openingOption.versao.id,titulo:openingOption.titulo,artista:openingOption.artista,nomeVersao:openingOption.versao.nome,duracao:openingOption.versao.duracao,xEmLives:openingOption.xEmLives},segmentos:[{tipo:'musica',musicaId:local,versaoId:localOption.versoes[0].id,titulo:localOption.titulo,artista:localOption.artista,musicaBase:localOption.musicaBase,duracao:localOption.versoes[0].duracao,xEmLives:localOption.xEmLives}]}}}); assert.equal(response.statusCode,200); const reopened=await app.inject({method:'GET',url:`/api/v1/live-drafts/${id}`}); assert.equal(reopened.statusCode,200); assert.equal(reopened.json<{rascunho:{composicao:{segmentos:any[]}}}>().rascunho.composicao.segmentos.length,1); assert.equal(db.prepare('SELECT x_em_lives FROM musicas WHERE id=?').get(local).x_em_lives,7);
  await app.close(); db.close();
});
