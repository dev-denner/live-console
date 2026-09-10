import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { invalidResponseError } from '../../core/api/api-error';
import { CatalogFilters, CatalogMusic, CatalogResponse } from './catalogo.models';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly api = inject(ApiClientService);

  list(filters: CatalogFilters): Observable<CatalogResponse> {
    const params = new URLSearchParams();
    if (filters.q?.trim()) params.set('q', filters.q.trim());
    if (filters.status) params.set('status', filters.status);
    if (filters.autoral !== '' && filters.autoral !== undefined) params.set('autoral', String(filters.autoral));
    if (filters.bloco) params.set('bloco', filters.bloco);
    if (filters.clima) params.set('clima', filters.clima);
    const query = params.toString();
    return this.api.get(`/api/musicas${query ? `?${query}` : ''}`, (payload) => {
      if (!payload || typeof payload !== 'object' || !Array.isArray((payload as { musicas?: unknown }).musicas)) {
        throw invalidResponseError('Resposta do catálogo inválida.');
      }
      const musicas = (payload as { musicas: unknown[] }).musicas;
      if (musicas.some((music) => !this.isMusic(music))) throw invalidResponseError('Resposta do catálogo inválida.');
      return { musicas: musicas as CatalogMusic[] };
    });
  }

  private isMusic(value: unknown): value is CatalogMusic {
    if (!value || typeof value !== 'object') return false;
    const music = value as Partial<CatalogMusic>;
    return typeof music.id === 'string' && typeof music.artista === 'string' && typeof music.titulo === 'string'
      && typeof music.autoral === 'boolean' && typeof music.x_em_lives === 'number' && Array.isArray(music.fontes);
  }
}
