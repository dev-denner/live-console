import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { getBlock, getMusic, listBlocks, listMusic } from './repositories.js';

const now = () => new Date().toISOString();
const validSource = (source: any, storageRoot: string) => {
  if (source.tipo === 'youtube') {
    try { const url = new URL(source.referencia); return ['http:', 'https:'].includes(url.protocol) && ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'].includes(url.hostname.toLowerCase()); } catch { return false; }
  }
  const folder = source.tipo === 'audio' ? 'musicas' : 'videos';
  const reference = String(source.referencia).replace(/\\/g, '/');
  return reference.startsWith(`${folder}/`) && !reference.includes('..') && !reference.startsWith('/') && !reference.includes(':') && existsSync(join(storageRoot, reference));
};
const versionsFor = (song: any, storageRoot: string) => song.fontes.filter((source: any) => validSource(source, storageRoot)).map((source: any) => ({ id:source.id, nome:source.nome, tipo:source.tipo, referencia:source.referencia, duracao:source.duracao ?? song.duracao ?? null, abertura:source.abertura, principal:source.principal, ordem:source.ordem }));
const songOption = (song: any, storageRoot: string) => { const versoes=versionsFor(song,storageRoot); return versoes.length ? { id:song.id, titulo:song.titulo, artista:song.artista, musicaBase:song.musica_base ?? song.titulo, autoral:Boolean(song.autoral), xEmLives:Number(song.x_em_lives), versoes } : null; };

export function liveDraftOptions(db: any, storageRoot: string) {
  const songs:any[]=listMusic(db,{activeOnly:true}).map((song: any) => songOption(song,storageRoot)).filter(Boolean) as any[];
  const byId=new Map(songs.map((song: any) => [song.id,song]));
  const membership=new Set(db.prepare('SELECT musica_id FROM musicas_do_bloco').all().map((row: any) => row.musica_id));
  const aberturas=songs.flatMap((song: any) => { const version=song.versoes.find((item: any) => item.abertura); return version ? [{...song,versao:version}] : []; });
  const musicasSemBloco=songs.filter((song: any) => !membership.has(song.id));
  const blocos=listBlocks(db).map((summary: any) => {
    const block=getBlock(db,summary.id);
    const itens=block.musicas.map((music: any) => {
      const song=byId.get(music.id);
      if(!song) return null;
      const version=song.versoes.find((item: any) => item.principal) ?? song.versoes[0];
      return { musicaId:song.id, versaoId:version.id, titulo:song.titulo, artista:song.artista, musicaBase:song.musicaBase, duracao:version.duracao, xEmLives:song.xEmLives, autoral:song.autoral, tipo:version.tipo, nomeVersao:version.nome };
    });
    // A block is atomic: an inactive or unplayable member invalidates the whole block.
    return itens.every(Boolean) ? {id:block.id,nome:block.nome,descricao:block.descricao,xEmLives:itens.reduce((sum: number,item: any)=>sum+item.xEmLives,0),itens} : null;
  }).filter(Boolean);
  return {aberturas,blocos,musicasSemBloco};
}

function validate(db: any, storageRoot: string, composition: any) {
  const options=liveDraftOptions(db,storageRoot); const openings=options.aberturas;
  if (openings.length && !composition.abertura) throw new Error('Escolha uma abertura antes de salvar o rascunho');
  const used=new Set<string>();
  const openingId=composition.abertura?.musicaId;
  if (composition.abertura) { const opening=openings.find((item: any) => item.id===composition.abertura.musicaId && item.versao.id===composition.abertura.versaoId); if(!opening) throw new Error('A abertura selecionada não está mais disponível'); used.add(opening.id); }
  for (const segment of composition.segmentos) {
    if (segment.tipo==='bloco') {
      const block=options.blocos.find((item: any) => item.id===segment.blocoId);
      const expected=block?.itens.filter((item: any) => item.musicaId!==openingId) ?? [];
      if(!block || expected.length===0 || expected.length!==segment.itens.length || expected.some((item: any,index: number) => item.musicaId!==segment.itens[index].musicaId || item.versaoId!==segment.itens[index].versaoId)) throw new Error('O bloco selecionado mudou no catálogo; recarregue e tente novamente');
      for (const item of segment.itens) { if(used.has(item.musicaId)) throw new Error(`A música "${item.titulo}" já está no rascunho`); used.add(item.musicaId); }
    } else {
      const song=getMusic(db,segment.musicaId); const option=song&&song.ativo?songOption(song,storageRoot):null; const version=option?.versoes.find((item: any) => item.id===segment.versaoId); if(!option || !version || db.prepare('SELECT 1 FROM musicas_do_bloco WHERE musica_id=?').get(segment.musicaId)) throw new Error(`A música "${segment.titulo}" não está disponível individualmente`); if(used.has(option.id)) throw new Error(`A música "${segment.titulo}" já está no rascunho`); used.add(option.id);
    }
  }
  return composition;
}
export function listLiveDrafts(db: any) { return db.prepare("SELECT id,nome,status,criada_em,atualizada_em FROM live_drafts WHERE status='draft' ORDER BY atualizada_em DESC").all(); }
export function createLiveDraft(db: any, input: {id?:string;nome?:string}={}) { const id=input.id??randomUUID(),at=now(); db.prepare("INSERT INTO live_drafts(id,nome,status,composicao_json,criada_em,atualizada_em) VALUES(?,?,?,?,?,?)").run(id,input.nome?.trim()||'Nova live','draft',JSON.stringify({abertura:null,segmentos:[]}),at,at); return id; }
export function getLiveDraft(db: any,id: string,storageRoot: string) { const row=db.prepare("SELECT * FROM live_drafts WHERE id=? AND status='draft'").get(id); return row?{id:row.id,nome:row.nome,status:row.status,composicao:JSON.parse(row.composicao_json),criadaEm:row.criada_em,atualizadaEm:row.atualizada_em,opcoes:liveDraftOptions(db,storageRoot)}:null; }
export function updateLiveDraft(db: any,id: string,input: any,storageRoot: string) { const row=db.prepare("SELECT * FROM live_drafts WHERE id=? AND status='draft'").get(id); if(!row)return null; const composition=validate(db,storageRoot,input.composicao),at=now(); db.prepare('UPDATE live_drafts SET nome=?,composicao_json=?,atualizada_em=? WHERE id=?').run(input.nome?.trim()||row.nome,JSON.stringify(composition),at,id); return getLiveDraft(db,id,storageRoot); }
export function removeLiveDraft(db: any,id: string) { return db.prepare("DELETE FROM live_drafts WHERE id=? AND status='draft'").run(id).changes===1; }
