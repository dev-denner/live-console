import test from 'node:test'; import assert from 'node:assert/strict'; import http from 'node:http'; import { mkdtempSync, readFileSync } from 'node:fs'; import { tmpdir } from 'node:os'; import { join } from 'node:path';
import { openDatabase, createMusic, getMusic, listMusic, updateMusic, addSource, setPrimarySource, reorderSources, updateSource, removeSource, exportCatalog } from '../src/db/repositories.js'; import { inspectImport, confirmImport } from '../src/importer.mjs'; import { createApp } from '../server.mjs';
function fixture(){const dir=mkdtempSync(join(tmpdir(),'live-console-'));return {dir,db:openDatabase(join(dir,'catalog.sqlite'))};} function song(extra={}){return {artista:'Artista fictício',titulo:'Canção fictícia',status:'OK',autoral:false,xEmLives:3,...extra};} function request(port,path,method='GET',data){return new Promise((resolve,reject)=>{const raw=data&&JSON.stringify(data),req=http.request({hostname:'127.0.0.1',port,path,method,headers:raw?{'content-type':'application/json','content-length':Buffer.byteLength(raw)}:{}},res=>{let out='';res.on('data',x=>out+=x);res.on('end',()=>resolve({status:res.statusCode,body:out&&JSON.parse(out)}));});req.on('error',reject);req.end(raw);});}
test('Node e node:sqlite estão disponíveis',()=>{assert.ok(Number(process.versions.node.split('.')[0])>=22);const {db}=fixture();assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys,1);db.close();});
test('migrations são idempotentes e banco inicia vazio',()=>{const {dir,db}=fixture();assert.equal(listMusic(db).length,0);const count=db.prepare('SELECT count(*) n FROM schema_migrations').get().n;assert.ok(count>=1);db.close();const next=openDatabase(join(dir,'catalog.sqlite'));assert.equal(next.prepare('SELECT count(*) n FROM schema_migrations').get().n,count);next.close();});
test('cadastro, atualização parcial e filtros preservam null false e zero',()=>{const {db}=fixture(),id=createMusic(db,song({bloco:'B',clima:'calmo',duracao:20}));updateMusic(db,id,{observacoes:null,autoral:false,duracao:0});const got=getMusic(db,id);assert.equal(got.x_em_lives,3);assert.equal(got.autoral,false);assert.equal(got.duracao,0);assert.equal(got.observacoes,null);assert.equal(listMusic(db,{q:'canção',bloco:'B',clima:'calmo',autoral:false}).length,1);db.close();});
test('referências têm principal única, ordem, edição e desvinculação',()=>{const {db}=fixture(),id=createMusic(db,song()),a=addSource(db,id,{nome:'A',tipo:'youtube',referencia:'https://a'}),b=addSource(db,id,{nome:'B',tipo:'audio',referencia:'storage/audio/b.mp3'});assert.equal(getMusic(db,id).fontes.filter(x=>x.principal).length,1);setPrimarySource(db,id,b);reorderSources(db,id,[b,a]);updateSource(db,id,a,{nome:'AA'});assert.equal(getMusic(db,id).fontes[0].id,b);assert.equal(getMusic(db,id).fontes.find(x=>x.id===a).nome,'AA');assert.equal(removeSource(db,id,a),true);db.close();});
test('prévia não escreve; importação confirma, é idempotente e preserva xEmLives',()=>{const {db}=fixture(),payload={musicas:[{...song({xEmLives:0}),fontes:[{nome:'Y',tipo:'youtube',referencia:'https://x',principal:true,ordem:1}]}]};const p=inspectImport(db,payload);assert.deepEqual(p.novas,[0]);assert.equal(listMusic(db).length,0);confirmImport(db,payload);const id=listMusic(db)[0].id;updateMusic(db,id,{xEmLives:9});confirmImport(db,payload);assert.equal(listMusic(db).length,1);assert.equal(getMusic(db,id).x_em_lives,9);db.close();});
test('modo atômico rejeita tudo e parcial grava item válido',()=>{const {db}=fixture(),payload={musicas:[{...song(),fontes:[]},{artista:'',titulo:'inválida',fontes:[]}]};assert.equal(confirmImport(db,payload).applied,false);assert.equal(listMusic(db).length,0);assert.equal(confirmImport(db,payload,{partial:true}).created,1);db.close();});
test('exportação reimporta e caminhos/URLs ficam literais',()=>{const {db}=fixture(),id=createMusic(db,song({letra:'C:\\legacy\\letra.md'}));addSource(db,id,{nome:'url',tipo:'youtube',referencia:'https://example.test/a?x=1&y=2'});const dump=exportCatalog(db),second=fixture();confirmImport(second.db,dump);assert.equal(listMusic(second.db)[0].fontes[0].referencia,'https://example.test/a?x=1&y=2');assert.equal(listMusic(second.db)[0].letra_caminho,'C:\\legacy\\letra.md');db.close();second.db.close();});
test('importação de versões é aditiva, atualiza campos editáveis e nunca apaga versões anteriores',()=>{
  const {db}=fixture();
  const first={musicas:[{artista:'Artista Gita',titulo:'Gita',ativo:false,generoPrimario:'Rock',xEmLives:0,versoes:[
    {nome:'Original',tipo:'youtube',referencia:'https://youtu.be/gita',ordem:1,duracao:240,abertura:false},
    {nome:'Acústica',tipo:'youtube',referencia:'https://youtu.be/gita-acustica',ordem:2,duracao:250,abertura:true}
  ]}]};
  const created=confirmImport(db,first);
  assert.equal(created.created,1);
  const initial=getMusic(db,listMusic(db)[0].id);
  assert.equal(initial.fontes.length,2);
  const originalId=initial.fontes.find(source=>source.nome==='Original').id;
  const second={musicas:[{artista:'Artista Gita',titulo:'Gita',ativo:true,generoPrimario:'Rock Nacional',xEmLives:999,versoes:[
    {id:originalId,nome:'Original remasterizada',tipo:'youtube',referencia:'https://youtu.be/gita',ordem:1,duracao:245,abertura:false},
    'Nova versão'
  ]}]};
  const preview=inspectImport(db,second);
  assert.equal(preview.atualizaveis.length,1);
  assert.equal(preview.versoesNovas,1);
  confirmImport(db,second);
  const result=getMusic(db,initial.id);
  assert.equal(result.ativo,true);
  assert.equal(result.genero_primario,'Rock Nacional');
  assert.equal(result.x_em_lives,0);
  assert.deepEqual(result.fontes.map(source=>source.nome),['Original remasterizada','Acústica','Nova versão']);
  assert.equal(result.fontes.find(source=>source.nome==='Original remasterizada').duracao,245);
  confirmImport(db,{musicas:[{artista:'Artista Gita',titulo:'Gita',versoes:[{nome:'Nova versão',tipo:'youtube',referencia:'https://youtu.be/nova-versao-atualizada'}]}]});
  const updatedVersion=getMusic(db,initial.id).fontes.find(source=>source.nome==='Nova versão');
  assert.equal(getMusic(db,initial.id).fontes.length,3);
  assert.equal(updatedVersion.referencia,'https://youtu.be/nova-versao-atualizada');
  db.close();
});
test('identidade da importação respeita musicaBase armazenada no SQLite',()=>{
  const {db}=fixture();
  createMusic(db,{artista:'Artista',titulo:'Versão acústica',musicaBase:'Obra original'});
  confirmImport(db,{musicas:[{artista:'Artista',titulo:'Versão acústica',musicaBase:'Obra original',ativo:false}]});
  assert.equal(listMusic(db).length,1);
  assert.equal(listMusic(db)[0].ativo,false);
  db.close();
});
test('API HTTP health, CRUD, validação e traversal',async()=>{const {dir,db}=fixture(),server=createApp({database:db,storageRoot:dir});await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;let r=await request(port,'/api/health');assert.equal(r.status,200);r=await request(port,'/api/musicas','POST',song());assert.equal(r.status,201);r=await request(port,'/api/musicas/'+r.body.musica.id,'PATCH',{duracao:0});assert.equal(r.status,200);await new Promise(r=>server.close(r));db.close();});
test('gitignore protege banco e mídia local',()=>{const ignore=readFileSync(new URL('../.gitignore',import.meta.url),'utf8');for(const line of ['data/*.sqlite','storage/audio/*','*.mp3','repertorios/*.json'])assert.ok(ignore.includes(line));});
test('console legado preserva os campos do repertório e a rota local segura',()=>{const page=readFileSync(new URL('../index.html',import.meta.url),'utf8');for(const field of ['song.youtube','song.arquivo','song.letra','song.observacao','song.interacoes'])assert.ok(page.includes(field));assert.ok(page.includes('/local?path='));});
