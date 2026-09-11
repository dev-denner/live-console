import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { DraftComposition, LiveDraft } from './live-draft.models';

@Injectable({providedIn:'root'})
export class LiveDraftService {
  private readonly api=inject(ApiClientService);
  create(nome?:string):Observable<{rascunho:LiveDraft}> { return this.api.post('/api/v1/live-drafts',nome?{nome}:{},this.readResponse); }
  get(id:string):Observable<{rascunho:LiveDraft}> { return this.api.get(`/api/v1/live-drafts/${id}`,this.readResponse); }
  save(id:string,nome:string,composicao:DraftComposition):Observable<{rascunho:LiveDraft}> { return this.api.put(`/api/v1/live-drafts/${id}`,{nome,composicao},this.readResponse); }
  private readonly readResponse=(payload:unknown):{rascunho:LiveDraft}=>{ const draft=(payload as {rascunho?:LiveDraft}).rascunho; if(!draft?.id||!draft.opcoes||!draft.composicao) throw new Error('Resposta do rascunho inválida.'); return {rascunho:draft}; };
}
