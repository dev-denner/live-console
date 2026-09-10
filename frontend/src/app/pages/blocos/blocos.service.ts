import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { invalidResponseError } from '../../core/api/api-error';
import { Block, BlockDraft, BlockMusic, BlockMusicOption, BlockSummary } from './blocos.models';

@Injectable({ providedIn: 'root' })
export class BlocosService {
  private readonly api = inject(ApiClientService);

  list(): Observable<{ blocos: BlockSummary[] }> {
    return this.api.get('/api/v1/blocos', (payload) => {
      const blocos = (payload as { blocos?: unknown }).blocos;
      if (!Array.isArray(blocos) || blocos.some((block) => !this.isSummary(block))) throw invalidResponseError('Resposta dos blocos inválida.');
      return { blocos: blocos as BlockSummary[] };
    });
  }

  get(id: string): Observable<Block> { return this.api.get(`/api/v1/blocos/${id}`, (payload) => this.readBlock(payload)); }
  create(draft: BlockDraft): Observable<Block> { return this.api.post('/api/v1/blocos', draft, (payload) => this.readBlock(payload)); }
  update(id: string, draft: BlockDraft): Observable<Block> { return this.api.patch(`/api/v1/blocos/${id}`, draft, (payload) => this.readBlock(payload)); }
  delete(id: string): Observable<unknown> { return this.api.delete(`/api/v1/blocos/${id}`); }

  options(id: string, q = ''): Observable<{ musicas: BlockMusicOption[] }> {
    const query = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
    return this.api.get(`/api/v1/blocos/${id}/opcoes-musicas${query}`, (payload) => {
      const musicas = (payload as { musicas?: unknown }).musicas;
      if (!Array.isArray(musicas) || musicas.some((music) => !this.isOption(music))) throw invalidResponseError('Resposta das opções de músicas inválida.');
      return { musicas: musicas as BlockMusicOption[] };
    });
  }

  addMusic(blockId: string, musicId: string): Observable<Block> { return this.api.post(`/api/v1/blocos/${blockId}/musicas`, { musicaId: musicId }, (payload) => this.readBlock(payload)); }
  removeMusic(blockId: string, musicId: string): Observable<unknown> { return this.api.delete(`/api/v1/blocos/${blockId}/musicas/${musicId}`); }
  reorder(blockId: string, ids: string[]): Observable<Block['musicas']> { return this.api.put(`/api/v1/blocos/${blockId}/musicas/ordem`, { ids }, (payload) => (payload as { musicas: Block['musicas'] }).musicas); }

  private readBlock(payload: unknown): Block {
    const block = (payload as { bloco?: unknown }).bloco;
    if (!this.isBlock(block)) throw invalidResponseError('Resposta do bloco inválida.');
    return block;
  }

  private isSummary(value: unknown): value is BlockSummary {
    if (!value || typeof value !== 'object') return false;
    const block = value as Partial<BlockSummary>;
    return typeof block.id === 'string' && typeof block.nome === 'string' && typeof block.quantidadeMusicas === 'number';
  }

  private isBlock(value: unknown): value is Block {
    if (!value || typeof value !== 'object' || !this.isSummary({ ...(value as object), quantidadeMusicas: 0 })) return false;
    const block = value as Partial<Block>;
    return Array.isArray(block.musicas) && block.musicas.every((music) => this.isBlockMusic(music));
  }

  private isBlockMusic(value: unknown): value is Block['musicas'][number] {
    if (!value || typeof value !== 'object') return false;
    const music = value as Partial<BlockMusic>;
    return typeof music.id === 'string' && typeof music.titulo === 'string' && typeof music.artista === 'string' && typeof music.ordem === 'number';
  }

  private isOption(value: unknown): value is BlockMusicOption {
    if (!value || typeof value !== 'object') return false;
    const option = value as Partial<BlockMusicOption>;
    return typeof option.id === 'string' && typeof option.titulo === 'string' && typeof option.artista === 'string' && typeof option.disponivel === 'boolean';
  }
}
