import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiError } from '../../core/api/api-error';
import { HealthService } from '../../core/health.service';
import { RequestState } from '../../core/models/request-state';
import { homeSidebarNavigation, homeTiles } from './home.navigation';
import { HomeDashboardData } from './home.models';
import { greeting, selectNextLive, selectRecentLives, selectTopPlayed, statusLabel } from './home.selectors';
import { HomeService } from './home.service';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  private readonly service = inject(HomeService);
  private readonly healthService = inject(HealthService);

  readonly navigation = homeSidebarNavigation;
  readonly tiles = homeTiles;
  readonly statusLabel = statusLabel;
  readonly greetingLabel = greeting(new Date());

  readonly state = signal<RequestState<HomeDashboardData>>({ status: 'loading' });
  readonly healthState = signal<RequestState<{ ok: boolean }>>({ status: 'loading' });

  readonly nextLive = computed(() => {
    const current = this.state();
    return current.status === 'success' ? selectNextLive(current.data.lives) : null;
  });
  readonly recentLives = computed(() => {
    const current = this.state();
    return current.status === 'success' ? selectRecentLives(current.data.lives) : [];
  });
  readonly topPlayed = computed(() => {
    const current = this.state();
    return current.status === 'success' ? selectTopPlayed(current.data.musicas) : [];
  });
  readonly totalLives = computed(() => {
    const current = this.state();
    return current.status === 'success' ? current.data.lives.length : 0;
  });
  readonly totalMusicas = computed(() => {
    const current = this.state();
    return current.status === 'success' ? current.data.musicas.length : 0;
  });
  readonly maxPlays = computed(() => this.topPlayed().reduce((max, item) => Math.max(max, item.xEmLives), 0));

  constructor() {
    this.load();
    this.checkHealth();
  }

  load(): void {
    this.state.set({ status: 'loading' });
    this.service.loadDashboard().subscribe({
      next: (data) => this.state.set(data.lives.length || data.musicas.length ? { status: 'success', data } : { status: 'empty' }),
      error: (error: ApiError) => this.state.set({ status: 'error', error })
    });
  }

  checkHealth(): void {
    this.healthState.set({ status: 'loading' });
    this.healthService.check().subscribe({
      next: () => this.healthState.set({ status: 'success', data: { ok: true } }),
      error: (error: ApiError) => this.healthState.set({ status: 'error', error })
    });
  }

  barWidth(plays: number): string {
    const max = this.maxPlays();
    return max > 0 ? `${Math.max(6, Math.round((plays / max) * 100))}%` : '0%';
  }

  formatDate(value: string | null): string {
    if (!value) return 'Sem data definida';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
