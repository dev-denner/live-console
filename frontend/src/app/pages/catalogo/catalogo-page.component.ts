import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CatalogoService } from './catalogo.service';
import { CatalogFilters, CatalogMusic } from './catalogo.models';
import { ApiError } from '../../core/api/api-error';
import { RequestState } from '../../core/models/request-state';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalogo-page.component.html',
  styleUrl: './catalogo-page.component.css'
})
export class CatalogoPageComponent {
  private readonly service = inject(CatalogoService);
  readonly filters = signal<CatalogFilters>({ autoral: '' });
  readonly state = signal<RequestState<CatalogMusic[]>>({ status: 'loading' });
  private readonly knownSongs = signal<CatalogMusic[]>([]);
  readonly statuses = computed(() => this.unique(this.knownSongs().map((song) => song.status)));
  readonly blocks = computed(() => this.unique(this.knownSongs().map((song) => song.bloco)));
  readonly climates = computed(() => this.unique(this.knownSongs().map((song) => song.clima)));

  constructor() { this.load(); }

  load(): void {
    this.state.set({ status: 'loading' });
    this.service.list(this.filters()).subscribe({
      next: ({ musicas }) => {
        if (this.knownSongs().length === 0 && Object.values(this.filters()).every((value) => !value)) this.knownSongs.set(musicas);
        this.state.set(musicas.length ? { status: 'success', data: musicas } : { status: 'empty' });
      },
      error: (error: ApiError) => this.state.set({ status: 'error', error })
    });
  }

  updateFilter<K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]): void {
    this.filters.update((current) => ({ ...current, [key]: value }));
    this.load();
  }

  clearFilters(): void {
    this.filters.set({ autoral: '' });
    this.load();
  }

  source(song: CatalogMusic) { return song.fontes.find((item) => item.principal) ?? song.fontes[0] ?? null; }
  mediaLabel(song: CatalogMusic): string { return this.source(song)?.tipo ?? 'sem mídia'; }
  versionLabel(song: CatalogMusic): string { return this.source(song)?.nome ?? '—'; }
  private unique(values: Array<string | null>): string[] { return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b)); }
}
