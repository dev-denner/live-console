import assert from 'node:assert/strict';
import test from 'node:test';
import { generateAutomaticComposition } from '../src/automatic-live-selection.mjs';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createApp } from '../server.ts';
import { addSource, createMusic, openDatabase } from '../src/db/repositories.js';

const song=(id,author=false,x=0)=>({id,titulo:`Título ${id}`,artista:'Artista',musicaBase:id,autoral:author,xEmLives:x,versoes:[{id:`v-${id}`,nome:'Principal',tipo:'youtube',duracao:60,principal:true,abertura:false}]});
const opening={...song('opening'),versao:{id:'v-opening',nome:'Principal',tipo:'youtube',duracao:60,principal:true,abertura:true}};

test('F8.2 atinge referência, mantém abertura fora da contagem e não escolhe versão',()=>{
  const result=generateAutomaticComposition({openings:[opening],blocks:[],songs:[song('a',true),song('b'),song('c')],quantidadeReferencia:2,autoraisDesejadas:1,seed:'stable'});
  assert.equal(result.metadata.quantidadeReferencia,2); assert.equal(result.metadata.quantidadeGerada,2); assert.equal(result.metadata.autoraisGeradas,1); assert.equal(result.composition.abertura.musicaId,'opening'); assert.equal(result.composition.segmentos.length,2); assert.equal(result.metadata.algoritmo,'f8.2');
});

test('F8.2 escolhe o maior resultado abaixo do limite em busca finita',()=>{
  const block={id:'block',nome:'Bloco',itens:[{...song('ba'),musicaId:'ba',versaoId:'v-ba',duracao:60,xEmLives:0,autoral:false},{...song('bb'),musicaId:'bb',versaoId:'v-bb',duracao:60,xEmLives:0,autoral:false}]};
  const result=generateAutomaticComposition({blocks:[block],songs:[song('single')],quantidadeReferencia:3,autoraisDesejadas:0,seed:'bounded'});
  assert.equal(result.metadata.quantidadeGerada,3); assert.equal(result.composition.segmentos.length,2);
  const impossible=generateAutomaticComposition({blocks:[block],songs:[],quantidadeReferencia:4,autoraisDesejadas:0,seed:'bounded'}); assert.equal(impossible.metadata.quantidadeGerada,2); assert.equal(impossible.metadata.avisos.length,1);
});

test('F8.2 prefere abertura não tocada e menor xEmLives sem alterar dados',()=>{
  const first={...opening,id:'first',xEmLives:0,versao:{...opening.versao,id:'v-first'}}; const second={...opening,id:'second',xEmLives:4,versao:{...opening.versao,id:'v-second'}};
  const result=generateAutomaticComposition({openings:[first,second],songs:[],previousMusicIds:new Set(['first']),quantidadeReferencia:1,seed:'opening'});
  assert.equal(result.composition.abertura.musicaId,'second'); assert.equal(second.xEmLives,4);
});

test('F8.2 API cria rascunho automático com padrão 30 e preserva xEmLives', async()=>{
  const root=mkdtempSync(join(tmpdir(),'live-console-f82-')); const db=openDatabase(join(root,'db.sqlite')); const id=createMusic(db,{artista:'A',titulo:'Música API',ativo:true,xEmLives:9}); addSource(db,id,{nome:'YouTube',tipo:'youtube',referencia:'https://youtu.be/api',principal:true}); const app=createApp({database:db,storageRoot:root});
  const response=await app.inject({method:'POST',url:'/api/v1/live-drafts/generate',payload:{autoraisDesejadas:0,seed:'api'}}); assert.equal(response.statusCode,201); const body=response.json(); assert.equal(body.geracao.quantidadeReferencia,30); assert.equal(body.geracao.quantidadeGerada,1); assert.equal(body.rascunho.composicao.segmentos[0].musicaId,id); assert.equal(db.prepare('SELECT x_em_lives FROM musicas WHERE id=?').get(id).x_em_lives,9); await app.close(); db.close();
});
