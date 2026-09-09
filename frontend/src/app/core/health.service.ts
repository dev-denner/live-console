import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api/api-client.service';
import { invalidResponseError } from './api/api-error';

export interface HealthResponse { ok: boolean }

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly api = inject(ApiClientService);

  check(): Observable<HealthResponse> {
    return this.api.get('/api/health', (payload) => {
      if (!payload || typeof payload !== 'object' || !('ok' in payload) || typeof payload.ok !== 'boolean') {
        throw invalidResponseError('Resposta de saúde inválida.');
      }
      return payload as HealthResponse;
    });
  }
}
