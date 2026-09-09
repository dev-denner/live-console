import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RequestState } from '../../core/models/request-state';

export interface PlaceholderPageData {
  title: string;
  description: string;
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="placeholder" data-testid="v1-placeholder">
      <p class="eyebrow">V1 · {{ pageData.title }}</p>
      <h1>{{ pageData.title }} em construção</h1>
      <p class="description">{{ pageData.description }}</p>
      <div class="state-card" aria-live="polite">
        <span class="state-label">Estado da tela</span>
        @switch (state.status) {
          @case ('empty') { <strong>empty</strong> }
          @case ('loading') { <strong>loading</strong> }
          @case ('success') { <strong>success</strong> }
          @case ('error') { <strong>error</strong> }
        }
        <p>Esta área está reservada para a próxima feature vertical. Nenhum dado foi carregado ou alterado.</p>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .placeholder { padding: 44px 8px; }
    .eyebrow { color: #f5b84b; font-size: .75rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
    h1 { margin: 12px 0; font-size: clamp(2rem, 5vw, 3.4rem); line-height: 1.05; }
    .description { max-width: 680px; color: #aab7c8; line-height: 1.7; }
    .state-card { max-width: 680px; margin-top: 34px; padding: 20px; border: 1px solid #334155; border-radius: 16px; background: #151e2c; }
    .state-label { display: block; margin-bottom: 8px; color: #94a3b8; font-size: .8rem; text-transform: uppercase; letter-spacing: .1em; }
    .state-card strong { color: #5ed2ad; font-size: 1.2rem; }
    .state-card p { color: #aab7c8; line-height: 1.6; }
  `]
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly pageData = this.route.snapshot.data as PlaceholderPageData;
  readonly state: RequestState<never> = { status: 'empty' };
}
