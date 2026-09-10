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
      <p class="eyebrow">Próximo módulo · {{ pageData.title }}</p>
      <h1>{{ pageData.title }}<span> em construção</span></h1>
      <p class="description">{{ pageData.description }}</p>
      <div class="state-card" aria-live="polite">
        <span class="state-label">Estado atual</span>
        @switch (state.status) {
          @case ('empty') { <strong>empty</strong> }
          @case ('loading') { <strong>loading</strong> }
          @case ('success') { <strong>success</strong> }
          @case ('error') { <strong>error</strong> }
        }
        <p>Esta área está reservada para a próxima entrega. Nenhum dado foi carregado ou alterado.</p>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .placeholder { max-width: 760px; padding: var(--lc-space-6) 0; }
    .eyebrow { color: var(--lc-amber-bright); font-size: .72rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    h1 { max-width: 12ch; margin: var(--lc-space-3) 0 var(--lc-space-4); font-size: clamp(2.5rem, 7vw, 5rem); line-height: .95; letter-spacing: -.07em; text-wrap: balance; }
    h1 span { color: var(--lc-muted); }
    .description { max-width: 56ch; margin: 0; color: var(--lc-muted); font-size: 1.05rem; line-height: 1.65; }
    .state-card { max-width: 620px; margin-top: var(--lc-space-7); padding: var(--lc-space-4); border: 1px solid var(--lc-line); border-radius: var(--lc-radius-panel); background: linear-gradient(135deg, rgba(32, 43, 49, .9), rgba(19, 26, 31, .9)); box-shadow: var(--lc-shadow); }
    .state-label { display: block; margin-bottom: var(--lc-space-2); color: var(--lc-quiet); font-size: .72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    .state-card strong { color: var(--lc-teal); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 1rem; font-variant-numeric: tabular-nums; }
    .state-card p { max-width: 52ch; margin: var(--lc-space-3) 0 0; color: var(--lc-muted); line-height: 1.6; }
  `]
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly pageData = this.route.snapshot.data as PlaceholderPageData;
  readonly state: RequestState<never> = { status: 'empty' };
}
