import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { invalidResponseError } from '../../core/api/api-error';
import { HomeDashboardData, HomeLive, HomeMusic } from './home.models';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly api = inject(ApiClientService);

  loadDashboard(): Observable<HomeDashboardData> {
    return forkJoin({
      lives: this.api.get('/api/lives', this.parseLives),
      musicas: this.api.get('/api/v1/musicas', this.parseMusicas)
    });
  }

  private readonly parseLives = (payload: unknown): HomeLive[] => {
    const lives = (payload as { lives?: unknown }).lives;
    if (!Array.isArray(lives)) throw invalidResponseError('Resposta de lives inválida.');
    return lives as HomeLive[];
  };

  private readonly parseMusicas = (payload: unknown): HomeMusic[] => {
    const musicas = (payload as { musicas?: unknown }).musicas;
    if (!Array.isArray(musicas)) throw invalidResponseError('Resposta do catálogo inválida.');
    return musicas as HomeMusic[];
  };
}
