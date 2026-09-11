import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiError } from '../../core/api/api-error';
import { RequestState } from '../../core/models/request-state';
import { DraftBlock, DraftComposition, DraftMusicSegment, DraftOpening, DraftSegment, DraftSong, DraftVersion, LiveDraft } from './live-draft.models';
import { LiveDraftService } from './live-draft.service';

@Component({standalone:true,changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./live-draft-page.component.html',styleUrl:'./live-draft-page.component.css'})
export class LiveDraftPageComponent {
  private readonly service=inject(LiveDraftService); private readonly route=inject(ActivatedRoute); private readonly router=inject(Router);
  readonly state=signal<RequestState<LiveDraft>>({status:'loading'}); readonly composition=signal<DraftComposition>({abertura:null,segmentos:[]}); readonly busy=signal(false); readonly message=signal<string|null>(null); readonly blockPreview=signal<DraftBlock|null>(null); readonly query=signal('');
  constructor(){ const id=this.route.snapshot.paramMap.get('id'); id?this.load(id):this.create(); }
  private create():void { this.service.create().subscribe({next:({rascunho})=>{this.router.navigate([rascunho.id],{relativeTo:this.route,replaceUrl:true});this.receive(rascunho);},error:(error:ApiError)=>this.state.set({status:'error',error})}); }
  load(id=this.route.snapshot.paramMap.get('id')!):void { this.state.set({status:'loading'});this.service.get(id).subscribe({next:({rascunho})=>this.receive(rascunho),error:(error:ApiError)=>this.state.set({status:'error',error})}); }
  private receive(draft:LiveDraft):void { this.composition.set(draft.composicao);this.state.set({status:'success',data:draft}); }
  current():LiveDraft|null { const value=this.state(); return value.status==='success'?value.data:null; }
  setOpening(option:DraftOpening):void { this.composition.update(current=>({...current,abertura:{musicaId:option.id,versaoId:option.versao.id,titulo:option.titulo,artista:option.artista,nomeVersao:option.versao.nome,duracao:option.versao.duracao,xEmLives:option.xEmLives}})); }
  clearOpening():void { this.composition.update(current=>({...current,abertura:null})); }
  addBlock(block:DraftBlock):void { if(this.usedBases().hasAny(block.itens.map(item=>item.musicaBase))) {this.message.set('Este bloco possui música-base já usada no rascunho.');return;} const itens=block.itens.map(({musicaId,versaoId,titulo,artista,musicaBase,duracao,xEmLives})=>({musicaId,versaoId,titulo,artista,musicaBase,duracao,xEmLives})); this.composition.update(current=>({...current,segmentos:[...current.segmentos,{tipo:'bloco',blocoId:block.id,nome:block.nome,itens}]}));this.message.set(null); }
  addMusic(song:DraftSong,version?:DraftVersion):void { const selected=version??song.versoes.find(item=>item.principal)??song.versoes[0];if(!selected||this.usedBases().has(song.musicaBase)) {this.message.set('Esta música-base já está no rascunho.');return;} const item:DraftMusicSegment={tipo:'musica',musicaId:song.id,versaoId:selected.id,titulo:song.titulo,artista:song.artista,musicaBase:song.musicaBase,duracao:selected.duracao,xEmLives:song.xEmLives};this.composition.update(current=>({...current,segmentos:[...current.segmentos,item]}));this.message.set(null); }
  remove(index:number):void { this.composition.update(current=>({...current,segmentos:current.segmentos.filter((_,position)=>position!==index)})); }
  move(index:number,direction:-1|1):void { this.composition.update(current=>{const target=index+direction;if(target<0||target>=current.segmentos.length)return current;const segmentos=[...current.segmentos];[segmentos[index],segmentos[target]]=[segmentos[target],segmentos[index]];return {...current,segmentos};}); }
  save():void { const draft=this.current();if(!draft)return;this.busy.set(true);this.message.set(null);this.service.save(draft.id,draft.nome,this.composition()).subscribe({next:({rascunho})=>{this.busy.set(false);this.receive(rascunho);this.message.set('Rascunho salvo.');},error:(error:ApiError)=>{this.busy.set(false);this.message.set(error.message);}}); }
  filteredSongs():DraftSong[]{const draft=this.current();const term=this.query().trim().toLocaleLowerCase();return draft?draft.opcoes.musicasSemBloco.filter(song=>!term||`${song.titulo} ${song.artista}`.toLocaleLowerCase().includes(term)):[];}
  usedBases():{has:(base:string)=>boolean;hasAny:(bases:string[])=>boolean}{const bases=new Set<string>();const current=this.composition();if(current.abertura)bases.add(this.current()?.opcoes.aberturas.find(item=>item.id===current.abertura?.musicaId)?.musicaBase??'');current.segmentos.forEach(segment=>segment.tipo==='bloco'?segment.itens.forEach(item=>bases.add(item.musicaBase)):bases.add(segment.musicaBase));return {has:(base:string)=>bases.has(base),hasAny:(values:string[])=>values.some(value=>bases.has(value))};}
  isUsed(base:string):boolean{return this.usedBases().has(base);}
  duration():{text:string;partial:boolean;count:number}{let seconds=0,partial=false,count=0;for(const segment of this.composition().segmentos){const items=segment.tipo==='bloco'?segment.itens:[segment];for(const item of items){count++;if(item.duracao===null)partial=true;else seconds+=item.duracao;}}const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60;return {text:`${h}h ${String(m).padStart(2,'0')}min ${String(s).padStart(2,'0')}s`,partial,count};}
  mediaLabel(type:string):string{return type==='youtube'?'YouTube':type==='audio'?'Áudio':'Vídeo';}
  versionLabel(version:DraftVersion):string { const media=this.mediaLabel(version.tipo); return version.nome.trim().toLocaleLowerCase()===media.toLocaleLowerCase()?media:`${media} · ${version.nome}`; }
  segmentX(segment:DraftSegment):number{return segment.tipo==='bloco'?segment.itens.reduce((sum,item)=>sum+item.xEmLives,0):segment.xEmLives;}
  blockCount():number{return this.composition().segmentos.filter(segment=>segment.tipo==='bloco').length;}
  preview(block:DraftBlock):void{this.blockPreview.set(block);}
  @HostListener('document:keydown.escape') closePreview():void{this.blockPreview.set(null);}
}
