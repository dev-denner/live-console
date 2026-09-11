import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ImportacaoService } from './importacao.service';
import { ImportReport } from './importacao.models';

type ImportState = 'idle' | 'reading' | 'previewing' | 'ready' | 'confirming' | 'success' | 'error';

@Component({
  standalone: true,
  selector: 'lc-importacao-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './importacao-page.component.html',
  styleUrl: './importacao-page.component.css'
})
export class ImportacaoPageComponent {
  private readonly service = inject(ImportacaoService);
  readonly state = signal<ImportState>('idle');
  readonly payload = signal<unknown>(null);
  readonly report = signal<ImportReport | null>(null);
  readonly error = signal<string | null>(null);
  readonly fileName = signal<string | null>(null);
  readonly partial = signal(false);

  async readFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.state.set('reading');
    this.error.set(null);
    this.report.set(null);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as { musicas?: unknown }).musicas)) {
        throw new Error('O JSON precisa conter um array musicas.');
      }
      this.payload.set(parsed);
      this.fileName.set(file.name);
      this.state.set('ready');
    } catch (cause) {
      this.payload.set(null);
      this.fileName.set(null);
      this.error.set(cause instanceof Error ? cause.message : 'Não foi possível ler o JSON.');
      this.state.set('error');
    } finally {
      input.value = '';
    }
  }

  preview(): void {
    const data = this.payload();
    if (!data) return;
    this.state.set('previewing');
    this.error.set(null);
    this.service.preview(data).subscribe({
      next: (response) => { this.report.set(response.relatorio); this.state.set('ready'); },
      error: (cause) => { this.error.set(cause?.message ?? 'Falha ao validar a importação.'); this.state.set('error'); }
    });
  }

  confirm(): void {
    const data = this.payload();
    if (!data || !this.report() || this.report()?.rejeitadas.length) return;
    this.state.set('confirming');
    this.error.set(null);
    this.service.confirm(data, this.partial()).subscribe({
      next: (response) => { this.report.set(response.relatorio); this.state.set('success'); },
      error: (cause) => { this.error.set(cause?.message ?? 'Falha ao confirmar a importação.'); this.state.set('error'); }
    });
  }

  clear(): void {
    this.payload.set(null);
    this.report.set(null);
    this.fileName.set(null);
    this.error.set(null);
    this.state.set('idle');
  }

  musicCount(): number { const data = this.payload(); return data && typeof data === 'object' && Array.isArray((data as { musicas?: unknown[] }).musicas) ? (data as { musicas: unknown[] }).musicas.length : 0; }
}
