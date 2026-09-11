import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('F7 expõe a rota V1 de importação, prévia, confirmação explícita e exportação', () => {
  const routes = read('frontend/src/app/app.routes.ts');
  const navigation = read('frontend/src/app/layout/navigation.ts');
  const page = read('frontend/src/app/pages/importacao/importacao-page.component.html');
  const service = read('frontend/src/app/pages/importacao/importacao.service.ts');
  assert.match(routes, /path: 'importacao'/);
  assert.match(navigation, /label: 'Importar'/);
  assert.match(page, /Validar prévia/);
  assert.match(page, /Confirmar importação/);
  assert.match(page, /versões acrescentadas/);
  assert.match(page, /api\/exportacao/);
  assert.match(service, /api\/importacao\/previa/);
  assert.match(service, /api\/importacao\/confirmar/);
});
