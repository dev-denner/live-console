import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiClientService } from '../../core/api/api-client.service';

type Item={id:string;musica_id:string;titulo:string;artista:string;ordem:number;eh_abertura?:number;estado?:string;referencia_reproducao:string;tipo_reproducao:string};
type Live={id:string;titulo:string;status:string;itens:Item[];historico?:Item[];resumo?:{tocadas:number;puladas:number;pendentes:number}};

@Component({standalone:true,changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:'./execucao-page.component.html',styleUrl:'./execucao-page.component.css'})
export class ExecucaoPageComponent {
  private readonly api=inject(ApiClientService); private readonly route=inject(ActivatedRoute);
  readonly lives=signal<Live[]>([]); readonly live=signal<Live|null>(null); readonly message=signal(''); readonly busy=signal(false);
  constructor(){this.load();}
  load():void { this.api.get('/api/lives',(x)=>x as {lives:Live[]}).subscribe({next:x=>{this.lives.set(x.lives);const id=this.route.snapshot.paramMap.get('id');if(id)this.select(id);},error:e=>this.message.set((e as Error).message)}); }
  select(id:string):void {this.api.get(`/api/lives/${id}`,x=>x as {live:Live}).subscribe({next:x=>this.live.set(x.live),error:e=>this.message.set((e as Error).message)});}
  key():string {return crypto.randomUUID();}
  action(item:Item,action:'play'|'tocada'|'pulada'|'desfazer_tocada'):void {if(action==='desfazer_tocada'&&!confirm('Confirmar reversão da música tocada? Esta correção será auditada.'))return;const id=this.live()?.id;if(!id)return;this.busy.set(true);this.api.post(`/api/lives/${id}/itens/${item.id}/execucao`,{acao:action,idempotencyKey:this.key(),confirmado:action==='desfazer_tocada'},x=>x as {execucao:Live}).subscribe({next:x=>{this.busy.set(false);this.live.set(x.execucao);},error:e=>{this.busy.set(false);this.message.set((e as Error).message);}});}
  start():void {const id=this.live()?.id;if(!id)return;this.api.post(`/api/repertorios/${id}/executar`,{idempotencyKey:this.key()},x=>x as Live).subscribe({next:x=>this.live.set(x),error:e=>this.message.set((e as Error).message)});}
  end():void {const id=this.live()?.id;if(!id||!confirm('Encerrar esta live? xEmLives será reconciliado agora.'))return;this.api.post(`/api/execucoes/${id}/encerrar`,{idempotencyKey:this.key()},x=>x as Live).subscribe({next:x=>this.live.set(x),error:e=>this.message.set((e as Error).message)});}
  itemState(item:Item):string{return item.estado??'pendente';}
}
