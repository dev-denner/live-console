# Live Console design system

> Category: Operational music console

Live Console is a local-first operational surface for preparing and conducting live music presentations. It is used in low light, often while attention is split between the screen, the music, and the audience. The design must be calm, scannable, and honest about state.

## Visual theme and atmosphere

Use a dark stage rather than a generic dark dashboard: near-black blue-green backgrounds, quiet raised surfaces, warm amber for deliberate actions, and teal only for healthy/live states. The interface should feel like equipment prepared before the show, not like a marketing landing page.

## Color roles and contrast

Use `--lc-stage` for the page background, `--lc-stage-raised` for panels, and `--lc-surface` / `--lc-surface-strong` for controls and elevated content. Primary text uses `--lc-ink`; secondary information uses `--lc-muted` and `--lc-quiet`. Amber is action and focus-adjacent emphasis, teal is confirmation/live health, and coral is failure or destructive intent. Never communicate state by color alone: pair it with text, shape, or an icon.

## Typography and hierarchy

Use `--lc-font-display` for headings and interface text and `--lc-font-mono` for counts, identifiers, durations, and literal references. Headings are compact and left-aligned, with tight tracking and balanced wrapping. Body text should remain comfortable at normal zoom. Labels are short, uppercase, and quieter than their controls.

## Spacing and composition

Use the `--lc-space-*` scale instead of one-off spacing. Content is left-aligned inside `--lc-content-width`; do not introduce a sidebar that competes with a live workflow. Panels use `--lc-radius-panel`; controls use `--lc-radius-control`. Preserve enough empty space around the current task to make the next action obvious.

## Components and interaction states

Buttons, links, inputs, selects, tables, cards, dialogs, and empty/error states must have visible hover, pressed, disabled, loading, and focus-visible states. Primary actions use amber; secondary actions use a surface with a border; destructive actions use coral and require confirmation. Dialogs must open at the top of their scroll container, keep the title and close button visible, trap focus while open, close with Escape, and return focus to the triggering control.

## Motion and reduced motion

Use `--lc-ease-standard`, `--lc-motion-enter`, and `--lc-motion-exit` for short interface transitions. Avoid decorative motion and never make a task depend on animation. Under `prefers-reduced-motion: reduce`, remove transitions, shimmer, and smooth scrolling while preserving state changes.

## Accessibility and stage use

Preserve native semantics and keyboard behavior. Every interactive control needs a visible `:focus-visible` indicator using `--lc-focus`. Maintain readable contrast for text and controls, use `aria-live` only for changing status, and keep labels explicit in Portuguese. Do not rely on hover-only explanations; use text, accessible names, or tooltips that also work with keyboard focus.

## Data and product boundaries

The design system describes presentation only. It does not authorize changes to catalog rules, legacy contracts, SQLite schemas, media paths, `xEmLives`, or live-building behavior. `/legacy` remains a protected operational surface. OpenDesign outputs are proposals for human review, not an authority over product decisions.

## Anti-patterns

Do not use gradients as decoration, oversized rounded pills, dense all-caps paragraphs, ambiguous icon-only actions, hidden overflow that truncates song titles without an accessible name, or raw colors repeated in component styles. Do not collapse a media type and version into an unreadable token; render them as `YouTube · Original` (or the equivalent localized pair). Do not silently hide inactive or unavailable content when the user needs to understand why it cannot be selected.
