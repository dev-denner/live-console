import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { invalidResponseError } from '../../core/api/api-error';
import { CatalogFilters, CatalogMusic, CatalogResponse, MusicRegistration, MusicVersionDraft } from './catalogo.models';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly api = inject(ApiClientService);

  list(filters: CatalogFilters): Observable<CatalogResponse> {
    const params = new URLSearchParams();
    if (filters.q?.trim()) params.set('q', filters.q.trim());
    if (filters.status !== '' && filters.status !== undefined) params.set('status', String(filters.status));
    if (filters.autoral !== '' && filters.autoral !== undefined) params.set('autoral', String(filters.autoral));
    const query = params.toString();
    return this.api.get(`/api/v1/musicas${query ? `?${query}` : ''}`, (payload) => {
      if (!payload || typeof payload !== 'object' || !Array.isArray((payload as { musicas?: unknown }).musicas)) {
        throw invalidResponseError('Resposta do catálogo inválida.');
      }
      const musicas = (payload as { musicas: unknown[] }).musicas;
      if (musicas.some((music) => !this.isMusic(music))) throw invalidResponseError('Resposta do catálogo inválida.');
      return { musicas: musicas as CatalogMusic[] };
    });
  }

  getRegistration(id: string): Observable<MusicRegistration> { return this.api.get(`/api/v1/musicas/${id}`, (payload) => { const music = (payload as { musica: MusicRegistration }).musica; return { ...music, letraAlterada: false, versoes: music.versoes.map((version) => version.tipo === 'youtube' ? version : { ...version, referencia: version.referenciaRelativa ?? version.referencia }) }; }); }
  saveRegistration(registration: MusicRegistration): Observable<MusicRegistration> {
    const url = registration.id ? `/api/v1/musicas/${registration.id}` : '/api/v1/musicas';
    const parse = (payload: unknown) => (payload as { musica: MusicRegistration }).musica;
    const { xEmLives: _xEmLives, letraAviso: _letraAviso, letraEncontrada: _letraEncontrada, letraAlterada: _letraAlterada, letraMarkdown: _letraMarkdown, letraCaminho: _letraCaminho, ...music } = registration;
    const payload = { ...music, versoes: registration.versoes.map((version) => this.versionWritePayload(version)) };
    if (registration.letraAlterada) Object.assign(payload, { letraMarkdown: registration.letraMarkdown && registration.letraMarkdown.length > 0 ? registration.letraMarkdown : null });
    if (registration.letraStagingId) Object.assign(payload, { letraStagingId: registration.letraStagingId });
    return registration.id ? this.api.put(url, payload, parse) : this.api.post(url, payload, parse);
  }
  deleteRegistration(id: string): Observable<unknown> { return this.api.delete(`/api/v1/musicas/${id}`); }
  stage(kind: 'audio' | 'video' | 'letras', file: File): Observable<{ stagingId: string }> { const body = new FormData(); body.append('file', file, file.name); return this.api.post(`/api/media/staging?kind=${kind}`, body); }
  cancelStaging(stagingId: string): Observable<unknown> { return this.api.delete(`/api/media/staging/${stagingId}`); }

  private versionWritePayload(version: MusicVersionDraft) {
    const payload: { id?: string; nome: string; ordem: number; tipo: 'youtube' | 'audio' | 'video'; referencia: string; duracao: number | null; abertura: boolean; stagingId?: string } = {
      nome: version.nome,
      ordem: version.ordem,
      tipo: version.tipo,
      referencia: version.referencia,
      duracao: version.duracao,
      abertura: version.abertura
    };
    if (version.id) payload.id = version.id;
    if (version.stagingId) payload.stagingId = version.stagingId;
    return payload;
  }

  private isMusic(value: unknown): value is CatalogMusic {
    if (!value || typeof value !== 'object') return false;
    const music = value as Partial<CatalogMusic>;
    return typeof music.id === 'string' && typeof music.artista === 'string' && typeof music.titulo === 'string'
      && typeof music.autoral === 'boolean' && typeof music.status === 'boolean'
      && typeof music.xEmLives === 'number' && Array.isArray(music.versoes);
  }
}
