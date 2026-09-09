import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HealthService, HealthResponse } from '../core/health.service';
import { RequestState } from '../core/models/request-state';
import { v1Navigation } from './navigation';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css'
})
export class AppShellComponent {
  private readonly healthService = inject(HealthService);
  readonly navigation = v1Navigation;
  readonly healthState = signal<RequestState<HealthResponse>>({ status: 'loading' });

  constructor() {
    this.checkHealth();
  }

  checkHealth(): void {
    this.healthState.set({ status: 'loading' });
    this.healthService.check().subscribe({
      next: (data) => this.healthState.set({ status: 'success', data }),
      error: (error) => this.healthState.set({ status: 'error', error })
    });
  }
}
