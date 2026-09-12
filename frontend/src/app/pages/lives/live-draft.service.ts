import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { DraftComposition, DraftGeneration, LiveDraft } from './live-draft.models';

@Injectable({providedIn:'root'})
export class LiveDraftService {
  private readonly api=inject(ApiClientService);
  create(nome?:string):Observable<{rascunho:LiveDraft}> { return this.api.post('/api/v1/live-drafts',nome?{nome}:{},this.readResponse); }
  get(id:string):Observable<{rascunho:LiveDraft}> { return this.api.get(`/api/v1/live-drafts/${id}`,this.readResponse); }
  save(id:string,nome:string,composicao:DraftComposition):Observable<{rascunho:LiveDraft}> { return this.api.put(`/api/v1/live-drafts/${id}`,{nome,composicao},this.readResponse); }
  generate(input:{quantidadeReferencia:number;autoraisDesejadas:number;aberturaId:string|null;seed?:string}):Observable<{rascunho:LiveDraft;geracao:DraftGeneration}> { return this.api.post('/api/v1/live-drafts/generate',input,(payload)=>{const value=payload as {rascunho?:LiveDraft;geracao?:DraftGeneration};if(!value.rascunho||!value.geracao)throw new Error('Resposta da geração inválida.');return {rascunho:value.rascunho,geracao:value.geracao};}); }
  private readonly readResponse=(payload:unknown):{rascunho:LiveDraft}=>{ const draft=(payload as {rascunho?:LiveDraft}).rascunho; if(!draft?.id||!draft.opcoes||!draft.composicao) throw new Error('Resposta do rascunho inválida.'); return {rascunho:draft}; };
}
