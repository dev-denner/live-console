import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = resolve(root, 'design-systems', 'live-console');

test('OpenDesign package exposes the canonical local design-system contract', async () => {
  const manifest = JSON.parse(await readFile(resolve(packageRoot, 'manifest.json'), 'utf8'));
  assert.equal(manifest.schemaVersion, 'od-design-system-project/v1');
  assert.equal(manifest.id, 'live-console');
  assert.equal(manifest.files.design, 'DESIGN.md');
  assert.equal(manifest.files.tokens, 'tokens.css');
  await readFile(resolve(packageRoot, manifest.files.design), 'utf8');
  await readFile(resolve(packageRoot, manifest.files.tokens), 'utf8');
});

test('OpenDesign prose and Angular global styles stay connected', async () => {
  const design = await readFile(resolve(packageRoot, 'DESIGN.md'), 'utf8');
  const tokens = await readFile(resolve(packageRoot, 'tokens.css'), 'utf8');
  const globalStyles = await readFile(resolve(root, 'frontend', 'src', 'styles.css'), 'utf8');
  const headings = design.match(/^##\s+.+$/gm) ?? [];
  assert.ok(headings.length >= 7, 'DESIGN.md must contain substantive design decisions');
  for (const token of [
    '--lc-stage', '--lc-ink', '--lc-amber', '--lc-teal', '--lc-focus',
    '--lc-content-width', '--lc-motion-enter', '--lc-motion-exit'
  ]) assert.match(tokens, new RegExp(`${token.replaceAll('-', '\\-')}\\s*:`));
  assert.match(globalStyles, /@import\s+["']\.\.\/\.\.\/design-systems\/live-console\/tokens\.css["']/);
});
