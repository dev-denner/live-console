import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { BlocosService } from './blocos.service';
import { Block, BlockDraft, BlockMusicOption, BlockSummary } from './blocos.models';
import { ApiError } from '../../core/api/api-error';
import { RequestState } from '../../core/models/request-state';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blocos-page.component.html',
  styleUrl: './blocos-page.component.css'
})
export class BlocosPageComponent {
  private readonly service = inject(BlocosService);
  readonly listState = signal<RequestState<BlockSummary[]>>({ status: 'loading' });
  readonly blockState = signal<RequestState<Block>>({ status: 'empty' });
  readonly optionsState = signal<RequestState<BlockMusicOption[]>>({ status: 'empty' });
  readonly selectedId = signal<string | null>(null);
  readonly search = signal('');
  readonly draft = signal<BlockDraft | null>(null);
  readonly deleteCandidate = signal<BlockSummary | null>(null);
  readonly busy = signal(false);
  readonly actionError = signal<string | null>(null);
  private dialogTrigger: HTMLElement | null = null;

  constructor() { this.loadBlocks(); }

  loadBlocks(selectId = this.selectedId()): void {
    this.listState.set({ status: 'loading' });
    this.service.list().subscribe({
      next: ({ blocos }) => {
        this.listState.set(blocos.length ? { status: 'success', data: blocos } : { status: 'empty' });
        const nextId = selectId && blocos.some((block) => block.id === selectId) ? selectId : blocos[0]?.id ?? null;
        this.selectedId.set(nextId);
        if (nextId) this.select(nextId);
        else this.blockState.set({ status: 'empty' });
      },
      error: (error: ApiError) => this.listState.set({ status: 'error', error })
    });
  }

  select(id: string): void {
    this.selectedId.set(id); this.actionError.set(null); this.blockState.set({ status: 'loading' });
    this.service.get(id).subscribe({ next: (block) => { this.blockState.set({ status: 'success', data: block }); this.loadOptions(); }, error: (error: ApiError) => this.blockState.set({ status: 'error', error }) });
  }

  loadOptions(): void {
    const id = this.selectedId(); if (!id) return;
    this.optionsState.set({ status: 'loading' });
    this.service.options(id, this.search()).subscribe({ next: ({ musicas }) => this.optionsState.set(musicas.length ? { status: 'success', data: musicas } : { status: 'empty' }), error: (error: ApiError) => this.optionsState.set({ status: 'error', error }) });
  }

  updateSearch(value: string): void { this.search.set(value); this.loadOptions(); }
  newBlock(event?: Event): void { this.dialogTrigger = event?.target instanceof HTMLElement ? event.target : null; this.actionError.set(null); this.draft.set({ nome: '', descricao: null }); this.focusDialog(); }
  editBlock(block: Block, event?: Event): void { this.dialogTrigger = event?.target instanceof HTMLElement ? event.target : null; this.actionError.set(null); this.draft.set({ id: block.id, nome: block.nome, descricao: block.descricao }); this.focusDialog(); }
  updateDraft<K extends keyof BlockDraft>(key: K, value: BlockDraft[K]): void { this.draft.update((current) => current ? { ...current, [key]: value } : current); }
  closeDraft(): void { this.draft.set(null); this.restoreDialogFocus(); }

  saveBlock(): void {
    const current = this.draft(); if (!current || !current.nome.trim()) { this.actionError.set('O nome do bloco é obrigatório.'); return; }
    this.busy.set(true); this.actionError.set(null);
    const draft = { nome: current.nome.trim(), descricao: current.descricao };
    const request = current.id ? this.service.update(current.id, draft) : this.service.create(draft);
    request.subscribe({ next: (block) => { this.draft.set(null); this.busy.set(false); this.loadBlocks(block.id); }, error: (error: ApiError) => { this.busy.set(false); this.actionError.set(error.message); } });
  }

  requestDelete(block: BlockSummary, event?: Event): void { this.dialogTrigger = event?.target instanceof HTMLElement ? event.target : null; this.actionError.set(null); this.deleteCandidate.set(block); this.focusDialog(); }
  cancelDelete(): void { this.deleteCandidate.set(null); this.restoreDialogFocus(); }
  confirmDelete(): void {
    const candidate = this.deleteCandidate(); if (!candidate) return;
    this.busy.set(true); this.service.delete(candidate.id).subscribe({ next: () => { this.deleteCandidate.set(null); this.busy.set(false); this.loadBlocks(null); }, error: (error: ApiError) => { this.busy.set(false); this.actionError.set(error.message); } });
  }

  addMusic(option: BlockMusicOption): void {
    const id = this.selectedId(); if (!id || !option.disponivel || this.currentMusicCount() >= 10) return;
    this.busy.set(true); this.actionError.set(null); this.service.addMusic(id, option.id).subscribe({ next: (block) => { this.busy.set(false); this.blockState.set({ status: 'success', data: block }); this.loadBlocks(id); }, error: (error: ApiError) => { this.busy.set(false); this.actionError.set(error.message); this.loadOptions(); } });
  }

  removeMusic(musicId: string): void {
    const id = this.selectedId(); if (!id) return;
    this.busy.set(true); this.service.removeMusic(id, musicId).subscribe({ next: () => { this.busy.set(false); this.select(id); this.loadBlocks(id); }, error: (error: ApiError) => { this.busy.set(false); this.actionError.set(error.message); } });
  }

  moveMusic(index: number, direction: -1 | 1): void {
    const block = this.currentBlock(); if (!block) return;
    const target = index + direction; if (target < 0 || target >= block.musicas.length) return;
    const ids = block.musicas.map((music) => music.id); [ids[index], ids[target]] = [ids[target], ids[index]];
    this.busy.set(true); this.service.reorder(block.id, ids).subscribe({ next: () => { this.busy.set(false); this.select(block.id); }, error: (error: ApiError) => { this.busy.set(false); this.actionError.set(error.message); } });
  }

  currentBlock(): Block | null { const state = this.blockState(); return state.status === 'success' ? state.data : null; }
  currentMusicCount(): number { return this.currentBlock()?.musicas.length ?? 0; }
  canAdd(option: BlockMusicOption): boolean { return option.disponivel && this.currentMusicCount() < 10 && !this.busy(); }
  typeLabel(option: BlockMusicOption): string { return option.autoral ? 'Autoral' : 'Capa'; }

  @HostListener('document:keydown.escape')
  closeDialogOnEscape(): void { if (this.draft()) this.closeDraft(); else if (this.deleteCandidate()) this.cancelDelete(); }

  private focusDialog(): void {
    setTimeout(() => {
      const dialog = document.querySelector<HTMLElement>('.block-dialog');
      if (!dialog) return;
      dialog.scrollTop = 0;
      const firstField = dialog.querySelector<HTMLElement>('input, textarea');
      (firstField ?? dialog.querySelector<HTMLElement>('button:not([disabled])'))?.focus();
    }, 0);
  }
  private restoreDialogFocus(): void { const trigger = this.dialogTrigger; this.dialogTrigger = null; setTimeout(() => trigger?.focus(), 0); }
}
