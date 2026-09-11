import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { ImportResponse } from './importacao.models';

@Injectable({ providedIn: 'root' })
export class ImportacaoService {
  private readonly api = inject(ApiClientService);

  preview(payload: unknown): Observable<ImportResponse> {
    return this.api.post('/api/importacao/previa', payload, (value) => value as ImportResponse);
  }

  confirm(payload: unknown, partial: boolean): Observable<ImportResponse> {
    return this.api.post('/api/importacao/confirmar', { payload, partial }, (value) => value as ImportResponse);
  }
}
