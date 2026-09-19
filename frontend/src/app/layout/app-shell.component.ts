import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';
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
  private readonly router = inject(Router);
  readonly navigation = v1Navigation;
  readonly healthState = signal<RequestState<HealthResponse>>({ status: 'loading' });
  readonly navOpen = signal(false);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly currentPageLabel = computed(() => {
    const url = this.currentUrl();
    const match = this.navigation.find((item) => url === `/${item.path}` || url.startsWith(`/${item.path}/`) || url.startsWith(`/${item.path}?`));
    return match?.label ?? 'Live Console';
  });

  constructor() {
    this.checkHealth();
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => this.navOpen.set(false));
  }

  checkHealth(): void {
    this.healthState.set({ status: 'loading' });
    this.healthService.check().subscribe({
      next: (data) => this.healthState.set({ status: 'success', data }),
      error: (error) => this.healthState.set({ status: 'error', error })
    });
  }

  toggleNav(): void { this.navOpen.update((open) => !open); }
  closeNav(): void { this.navOpen.set(false); }
}
