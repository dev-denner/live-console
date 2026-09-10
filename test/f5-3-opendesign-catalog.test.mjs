import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogCssPath = resolve(root, 'frontend', 'src', 'app', 'pages', 'catalogo', 'catalogo-page.component.css');
const catalogHtmlPath = resolve(root, 'frontend', 'src', 'app', 'pages', 'catalogo', 'catalogo-page.component.html');

test('F5.3 catálogo usa o contrato visual OpenDesign sem cores ou gradientes locais', async () => {
  const css = await readFile(catalogCssPath, 'utf8');
  assert.match(css, /var\(--lc-stage-raised\)/);
  assert.match(css, /var\(--lc-font-mono\)/);
  assert.match(css, /var\(--lc-scrim\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css, /(?:linear|radial)-gradient/);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
});

test('F5.3 catálogo preserva estados e apresentação acessível de tabela e diálogos', async () => {
  const html = await readFile(catalogHtmlPath, 'utf8');
  assert.match(html, /data-testid="catalog-loading"/);
  assert.match(html, /data-testid="catalog-empty"/);
  assert.match(html, /data-testid="catalog-error"/);
  assert.match(html, /<caption class="sr-only">/);
  assert.match(html, /class="row-actions"/);
  assert.match(html, /aria-label="Fechar"/);
  assert.match(html, /aria-label="Fechar versão"/);
});
