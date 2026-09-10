import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CatalogoService } from './catalogo.service';
import { CatalogFilters, CatalogMusic, MusicRegistration, MusicVersionDraft } from './catalogo.models';
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
  readonly registration = signal<MusicRegistration | null>(null);
  readonly versionDraft = signal<MusicVersionDraft | null>(null);
  readonly registrationError = signal<string | null>(null);
  readonly versionError = signal<string | null>(null);
  readonly uploadState = signal<string | null>(null);
  private versionTrigger: HTMLElement | null = null;

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

  newMusic(): void { this.registrationError.set(null); this.registration.set({ titulo: '', artista: '', genero: null, origem: null, observacoes: null, autoral: false, ativo: true, xEmLives: 0, letraMarkdown: '', versoes: [] }); setTimeout(() => document.querySelector<HTMLElement>('.music-dialog')?.focus(), 0); }
  editMusic(song: CatalogMusic): void { this.registrationError.set(null); this.service.getRegistration(song.id).subscribe({ next: (music) => this.registration.set(music), error: (error: ApiError) => this.registrationError.set(error.message) }); }
  closeRegistration(): void { const staged = this.registration()?.versoes.filter((version) => version.stagingId).map((version) => version.stagingId as string) ?? []; staged.forEach((id) => this.service.cancelStaging(id).subscribe()); this.registration.set(null); this.versionDraft.set(null); this.registrationError.set(null); }
  updateRegistration<K extends keyof MusicRegistration>(key: K, value: MusicRegistration[K]): void { this.registration.update((current) => current ? { ...current, [key]: value } : current); }
  saveRegistration(): void {
    const current = this.registration(); if (!current || !current.titulo.trim() || !current.artista.trim()) { this.registrationError.set('Título e artista são obrigatórios.'); return; }
    this.registrationError.set(null); this.service.saveRegistration(current).subscribe({ next: () => { this.closeRegistration(); this.load(); }, error: (error: ApiError) => this.registrationError.set(error.message) });
  }
  openVersion(version?: MusicVersionDraft, trigger?: EventTarget | null): void {
    this.versionError.set(null); this.versionTrigger = trigger instanceof HTMLElement ? trigger : null;
    this.versionDraft.set(version ? { ...version } : { nome: '', ordem: (this.registration()?.versoes.length ?? 0) + 1, tipo: 'youtube', referencia: '', duracao: null, abertura: false }); setTimeout(() => document.querySelector<HTMLElement>('.version-dialog')?.focus(), 0);
  }
  closeVersion(): void { this.versionDraft.set(null); this.versionError.set(null); setTimeout(() => this.versionTrigger?.focus(), 0); }
  updateVersion<K extends keyof MusicVersionDraft>(key: K, value: MusicVersionDraft[K]): void { this.versionDraft.update((current) => current ? { ...current, [key]: value } : current); }
  commitVersion(): void {
    const version = this.versionDraft(); const parent = this.registration(); if (!version || !parent) return;
    if (!version.nome.trim() || !version.referencia.trim() || !Number.isInteger(version.ordem) || version.ordem < 1) { this.versionError.set('Nome, referência e uma ordem positiva são obrigatórios.'); return; }
    if (parent.versoes.some((item) => item.ordem === version.ordem && item.id !== version.id)) { this.versionError.set('Essa ordem já está sendo usada nesta música.'); return; }
    this.registration.update((current) => current ? { ...current, versoes: [...current.versoes.filter((item) => item.id !== version.id), { ...version }].sort((a, b) => a.ordem - b.ordem) } : current);
    this.closeVersion();
  }
  removeVersion(version: MusicVersionDraft): void { this.registration.update((current) => current ? { ...current, versoes: current.versoes.filter((item) => item.id !== version.id) } : current); }
  uploadVersion(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]; const version = this.versionDraft(); if (!file || !version || version.tipo === 'youtube') return;
    this.uploadState.set('Enviando para staging…'); this.service.stage(version.tipo, file).subscribe({ next: (result) => { this.updateVersion('stagingId', result.stagingId); this.updateVersion('referencia', file.name); this.uploadState.set('Upload pronto; será promovido ao salvar.'); }, error: (error: ApiError) => this.uploadState.set(error.message) });
  }
}
