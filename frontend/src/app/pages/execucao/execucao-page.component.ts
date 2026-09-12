import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiClientService } from '../../core/api/api-client.service';

type Version={id:string;nome:string;tipo:string;referencia:string;ordem:number}; type Option={id:string;titulo:string;artista:string;versoes:Version[]};
type Item={id:string;musica_id:string;titulo:string;artista:string;ordem:number;eh_abertura?:number;estado?:string;referencia_reproducao:string;tipo_reproducao:string;bloco_id?:string|null;origem?:string;letra_caminho?:string|null};
type Live={id:string;titulo:string;status:string;itens:Item[];historico?:Item[];resumo?:{tocadas:number;puladas:number;pendentes:number}};

@Component({standalone:true,changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./execucao-page.component.html',styleUrl:'./execucao-page.component.css'})
export class ExecucaoPageComponent {
  private readonly api=inject(ApiClientService); private readonly route=inject(ActivatedRoute);
  readonly lives=signal<Live[]>([]); readonly live=signal<Live|null>(null); readonly options=signal<Option[]>([]); readonly blocks=signal<{id:string;nome:string}[]>([]); readonly selectedMusic=signal(''); readonly selectedVersion=signal(''); readonly message=signal(''); readonly busy=signal(false); private draggedId='';
  constructor(){this.load();}
  load():void { this.api.get('/api/lives',(x)=>x as {lives:Live[]}).subscribe({next:x=>{this.lives.set(x.lives);const id=this.route.snapshot.paramMap.get('id');if(id)this.select(id);},error:e=>this.message.set((e as Error).message)}); }
  select(id:string):void {this.api.get(`/api/lives/${id}/execucao`,x=>x as {execucao:Live}).subscribe({next:x=>{this.live.set(x.execucao);this.loadOptions(id);},error:e=>this.message.set((e as Error).message)});}
  loadOptions(id:string):void { this.api.get(`/api/repertorios/${id}/opcoes-musicas`,x=>x as {musicas:Option[]}).subscribe({next:x=>this.options.set(x.musicas)}); this.api.get('/api/blocos',x=>x as {blocos:{id:string;nome:string}[]}).subscribe({next:x=>this.blocks.set(x.blocos)}); }
  key():string {return crypto.randomUUID();}
  action(item:Item,action:'play'|'tocada'|'pulada'|'desfazer_tocada'):void {if(action==='desfazer_tocada'&&!confirm('Confirmar reversão da música tocada? Esta correção será auditada.'))return;const id=this.live()?.id;if(!id)return;this.busy.set(true);this.api.post(`/api/lives/${id}/itens/${item.id}/execucao`,{acao:action,idempotencyKey:this.key(),confirmado:action==='desfazer_tocada'},x=>x as {execucao:Live}).subscribe({next:x=>{this.busy.set(false);this.live.set(x.execucao);},error:e=>{this.busy.set(false);this.message.set((e as Error).message);}});}
  start():void {const id=this.live()?.id;if(!id)return;this.api.post(`/api/repertorios/${id}/executar`,{idempotencyKey:this.key()},x=>x as Live).subscribe({next:x=>this.live.set(x),error:e=>this.message.set((e as Error).message)});}
  end():void {const id=this.live()?.id;if(!id||!confirm('Encerrar esta live? xEmLives será reconciliado agora.'))return;this.api.post(`/api/execucoes/${id}/encerrar`,{idempotencyKey:this.key()},x=>x as Live).subscribe({next:x=>this.live.set(x),error:e=>this.message.set((e as Error).message)});}
  chooseMusic(id:string):void {this.selectedMusic.set(id);this.selectedVersion.set(this.options().find(x=>x.id===id)?.versoes[0]?.id??'');}
  selectedVersions():Version[] { return this.options().find(x=>x.id===this.selectedMusic())?.versoes??[]; }
  add():void {const live=this.live(),song=this.options().find(x=>x.id===this.selectedMusic()),version=song?.versoes.find(x=>x.id===this.selectedVersion());if(!live||!song||!version)return;this.api.post(`/api/execucoes/${live.id}/adicoes`,{musicaId:song.id,referenciaReproducao:version.referencia,tipoReproducao:version.tipo},()=>null).subscribe({next:()=>{this.selectedMusic.set('');this.selectedVersion.set('');this.select(live.id);},error:e=>this.message.set((e as Error).message)});}
  dragStart(item:Item):void {this.draggedId=item.id;}
  drop(target:Item):void {const live=this.live();if(!live||!this.draggedId||target.id===this.draggedId)return;const ids=live.itens.map(x=>x.id),from=ids.indexOf(this.draggedId),to=ids.indexOf(target.id);ids.splice(from,1);ids.splice(to,0,this.draggedId);this.api.post(`/api/execucoes/${live.id}/reordenar`,{ids},()=>null).subscribe({next:()=>this.select(live.id),error:e=>this.message.set((e as Error).message)});}
  moveBlock(item:Item,blocoId:string):void {const live=this.live();if(!live)return;this.api.post(`/api/execucoes/${live.id}/itens/${item.id}/bloco`,{blocoId:blocoId||null},()=>null).subscribe({next:()=>this.select(live.id),error:e=>this.message.set((e as Error).message)});}
  itemState(item:Item):string{return item.estado??'pendente';}
}
