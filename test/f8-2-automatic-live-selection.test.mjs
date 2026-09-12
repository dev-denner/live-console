import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { generateAutomaticComposition } from '../src/automatic-live-selection.mjs';
import { createApp } from '../server.ts';
import { addBlockMusic, addSource, createBlock, createMusic, openDatabase } from '../src/db/repositories.js';

const song=(id,autoral=false,x=0,type='youtube')=>({id,titulo:`Título ${id}`,artista:'Artista',musicaBase:id,autoral,xEmLives:x,versoes:[{id:`v-${id}`,nome:type==='youtube'?'YouTube':type==='audio'?'Áudio':'Vídeo',tipo:type,duracao:60,principal:true,abertura:false}]});
const opening={...song('opening'),versao:{id:'v-opening',nome:'Abertura',tipo:'youtube',duracao:60,principal:true,abertura:true}};
const block=(id,items)=>({id,nome:`Bloco ${id}`,itens:items});

test('F8.2 atinge a quantidade exata, respeita autorais e deixa a abertura fora da contagem',()=>{
  const result=generateAutomaticComposition({openings:[opening],blocks:[],songs:[song('a',true),song('b'),song('c')],quantidadeReferencia:2,autoraisDesejadas:1,seed:'stable'});
  assert.deepEqual({referencia:result.metadata.quantidadeReferencia,gerada:result.metadata.quantidadeGerada,autorais:result.metadata.autoraisGeradas},{referencia:2,gerada:2,autorais:1}); assert.equal(result.composition.abertura.musicaId,'opening'); assert.equal(result.composition.segmentos.length,2); assert.equal(result.metadata.algoritmo,'f8.2');
});

test('F8.2 usa referência padrão 30, busca finita e fallback para a maior quantidade abaixo',()=>{
  const result=generateAutomaticComposition({blocks:[block('a',[{...song('a1'),musicaId:'a1',versaoId:'v-a1'},{...song('a2'),musicaId:'a2',versaoId:'v-a2'}])],songs:[]});
  assert.equal(result.metadata.quantidadeReferencia,30); assert.equal(result.metadata.quantidadeGerada,2);
  const fallback=generateAutomaticComposition({blocks:[block('pair',[{...song('p1'),musicaId:'p1',versaoId:'v-p1'},{...song('p2'),musicaId:'p2',versaoId:'v-p2'}])],songs:[],quantidadeReferencia:3,autoraisDesejadas:0,seed:'bounded'});
  assert.equal(fallback.metadata.quantidadeGerada,2); assert.match(fallback.metadata.avisos[0],/solicitadas 3/); assert.doesNotThrow(()=>generateAutomaticComposition({blocks:[],songs:Array.from({length:200},(_,i)=>song(`s${i}`)),quantidadeReferencia:200,seed:'termination'}));
});

test('F8.2 prefere abertura não usada anteriormente e depois menor xEmLives',()=>{
  const first={...opening,id:'first',xEmLives:0,versao:{...opening.versao,id:'v-first'}}; const second={...opening,id:'second',xEmLives:4,versao:{...opening.versao,id:'v-second'}}; const third={...opening,id:'third',xEmLives:1,versao:{...opening.versao,id:'v-third'}};
  const result=generateAutomaticComposition({openings:[first,second,third],songs:[],previousMusicIds:new Set(['first','third']),quantidadeReferencia:1,seed:'opening'}); assert.equal(result.composition.abertura.musicaId,'second');
  const tie=generateAutomaticComposition({openings:[second,third],songs:[],previousMusicIds:new Set(),quantidadeReferencia:1,seed:'opening'}); assert.equal(tie.composition.abertura.musicaId,'third');
});

test('F8.2 mantém blocos indivisíveis, remove abertura compartilhada e usa musicaId',()=>{
  const shared={...song('shared'),musicaId:'shared',versaoId:'v-shared'}; const other={...song('other'),musicaId:'other',versaoId:'v-other'}; const sameBaseA={...song('same-a'),musicaBase:'same-base'}; const sameBaseB={...song('same-b'),musicaBase:'same-base'};
  const result=generateAutomaticComposition({openings:[opening],blocks:[block('opening',[{...opening, musicaId:'opening',versaoId:'v-opening'},other]),block('used',[shared])],songs:[{...shared},{...sameBaseA},{...sameBaseB}],quantidadeReferencia:4,autoraisDesejadas:0,seed:'ids'});
  const blockSegment=result.composition.segmentos.find((item)=>item.tipo==='bloco'&&item.blocoId==='opening'); assert.deepEqual(blockSegment.itens.map((item)=>item.musicaId),['other']); assert.equal(result.composition.segmentos.flatMap((item)=>item.tipo==='bloco'?item.itens.map((x)=>x.musicaId):[item.musicaId]).filter((id)=>id==='shared').length,1); assert.equal(result.composition.segmentos.flatMap((item)=>item.tipo==='bloco'?item.itens.map((x)=>x.musicaId):[item.musicaId]).filter((id)=>id.startsWith('same-')).length,2);
});

test('F8.2 aceita áudio/vídeo locais e não cria preferência artificial por YouTube',()=>{
  const result=generateAutomaticComposition({songs:[song('audio',false,0,'audio'),song('video',false,0,'video'),song('youtube',false,99,'youtube')],quantidadeReferencia:2,seed:'media'}); const ids=result.composition.segmentos.map((item)=>item.musicaId); assert.equal(ids.length,2); assert.ok(ids.includes('audio')||ids.includes('video')); assert.equal('vibe' in result.metadata,false); assert.equal('clima' in result.metadata,false); assert.equal('objetivo' in result.metadata,false);
});

test('F8.2 API filtra catálogo, descarta blocos inválidos, cria rascunho e preserva xEmLives',async()=>{
  const root=mkdtempSync(join(tmpdir(),'live-console-f82-')); mkdirSync(join(root,'musicas')); mkdirSync(join(root,'videos')); writeFileSync(join(root,'musicas','ok.mp3'),'audio'); writeFileSync(join(root,'videos','ok.mp4'),'video'); const db=openDatabase(join(root,'db.sqlite'));
  const opening=createMusic(db,{artista:'A',titulo:'Abertura',ativo:true,xEmLives:5}); const openingSource=addSource(db,opening,{nome:'Abertura',tipo:'youtube',referencia:'https://youtu.be/open',abertura:true,principal:true});
  const local=createMusic(db,{artista:'A',titulo:'Audio local',ativo:true,xEmLives:9}); const localSource=addSource(db,local,{nome:'Áudio',tipo:'audio',referencia:'musicas/ok.mp3',principal:true});
  const video=createMusic(db,{artista:'A',titulo:'Video local',ativo:true,xEmLives:2}); addSource(db,video,{nome:'Vídeo',tipo:'video',referencia:'videos/ok.mp4',principal:true});
  const inactive=createMusic(db,{artista:'A',titulo:'Inativa',ativo:true}); addSource(db,inactive,{nome:'Y',tipo:'youtube',referencia:'https://youtu.be/inactive',principal:true});
  const blockId=createBlock(db,{nome:'Bloco abertura'}); addBlockMusic(db,blockId,opening); addBlockMusic(db,blockId,local);
  const invalidBlock=createBlock(db,{nome:'Bloco inválido'}); addBlockMusic(db,invalidBlock,video); const invalidMember=createMusic(db,{artista:'A',titulo:'Mídia ausente',ativo:true}); addSource(db,invalidMember,{nome:'Áudio',tipo:'audio',referencia:'musicas/missing.mp3',principal:true}); db.prepare('INSERT INTO musicas_do_bloco(bloco_id,musica_id,ordem,criada_em) VALUES(?,?,?,?)').run(invalidBlock,invalidMember,2,new Date().toISOString()); db.prepare('UPDATE musicas SET status_ativo=0 WHERE id=?').run(inactive);
  const app=createApp({database:db,storageRoot:root}); const response=await app.inject({method:'POST',url:'/api/v1/live-drafts/generate',payload:{quantidadeReferencia:30,autoraisDesejadas:0,seed:'api'}}); assert.equal(response.statusCode,201); const body=response.json(); assert.equal(body.geracao.quantidadeReferencia,30); assert.equal(body.rascunho.composicao.abertura.musicaId,opening); const generatedIds=body.rascunho.composicao.segmentos.flatMap((item)=>item.tipo==='bloco'?item.itens.map((x)=>x.musicaId):[item.musicaId]); assert.ok(generatedIds.includes(local)||generatedIds.includes(video)); assert.equal(generatedIds.includes(inactive),false); assert.equal(generatedIds.includes(invalidMember),false); assert.equal(db.prepare('SELECT x_em_lives FROM musicas WHERE id=?').get(local).x_em_lives,9); assert.equal(body.rascunho.composicao.segmentos.find((item)=>item.tipo==='bloco')?.itens.some((item)=>item.musicaId===opening),false); assert.equal(openingSource.length>0,true); assert.equal(localSource.length>0,true); await app.close(); db.close();
});

test('F8.2 regeneração cria outro rascunho e a composição gerada continua editável',async()=>{
  const root=mkdtempSync(join(tmpdir(),'live-console-f82-edit-')); const db=openDatabase(join(root,'db.sqlite')); const music=createMusic(db,{artista:'A',titulo:'Editável',ativo:true}); const source=addSource(db,music,{nome:'Y',tipo:'youtube',referencia:'https://youtu.be/edit',principal:true}); const app=createApp({database:db,storageRoot:root}); const manual=(await app.inject({method:'POST',url:'/api/v1/live-drafts'})).json().rascunho; const generated=(await app.inject({method:'POST',url:'/api/v1/live-drafts/generate',payload:{quantidadeReferencia:1,seed:'regen'}})).json().rascunho; assert.notEqual(generated.id,manual.id); assert.deepEqual((await app.inject({method:'GET',url:`/api/v1/live-drafts/${manual.id}`})).json().rascunho.composicao,{abertura:null,segmentos:[]}); const edited={...generated.composicao,segmentos:[{tipo:'musica',musicaId:music,versaoId:source,titulo:'Editável',artista:'A',musicaBase:'Editável',duracao:null,xEmLives:0}]}; const saved=await app.inject({method:'PUT',url:`/api/v1/live-drafts/${generated.id}`,payload:{composicao:edited}}); assert.equal(saved.statusCode,200); await app.close(); db.close();
});

test('F8.2 frontend trata o bloco como unidade quando qualquer item já foi usado',()=>{
  const source=readFileSync(new URL('../frontend/src/app/pages/lives/live-draft-page.component.ts',import.meta.url),'utf8'); const template=readFileSync(new URL('../frontend/src/app/pages/lives/live-draft-page.component.html',import.meta.url),'utf8'); assert.match(source,/blockIsUsed\(block:DraftBlock\):boolean\s*\{ return block\.itens\.some/); assert.match(template,/\[disabled\]="blockIsUsed\(block\)"/);
});
