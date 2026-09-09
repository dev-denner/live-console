import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface HealthResponse { ok: boolean }

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);

  check(): Observable<HealthResponse> {
    return this.http.get<unknown>('/api/health').pipe(
      map((payload) => {
        if (!payload || typeof payload !== 'object' || !('ok' in payload) || typeof payload.ok !== 'boolean') {
          throw new Error('Resposta de saúde inválida.');
        }
        return payload as HealthResponse;
      })
    );
  }
}
