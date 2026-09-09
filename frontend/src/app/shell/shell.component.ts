import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HealthService } from '../core/health.service';

type ShellStatus = 'loading' | 'success' | 'error';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {
  private readonly healthService = inject(HealthService);
  readonly status = signal<ShellStatus>('loading');
  readonly message = signal('Consultando o backend local…');

  constructor() { this.checkHealth(); }

  checkHealth(): void {
    this.status.set('loading');
    this.message.set('Consultando o backend local…');
    this.healthService.check().subscribe({
      next: () => { this.status.set('success'); this.message.set('Backend local conectado.'); },
      error: () => { this.status.set('error'); this.message.set('Não foi possível consultar o backend local.'); }
    });
  }
}
