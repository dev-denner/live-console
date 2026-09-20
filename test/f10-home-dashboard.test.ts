import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { greeting, selectNextLive, selectRecentLives, selectTopPlayed, statusLabel } from '../frontend/src/app/pages/home/home.selectors.ts';
import type { HomeLive, HomeMusic } from '../frontend/src/app/pages/home/home.models.ts';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

function live(overrides: Partial<HomeLive>): HomeLive {
  return { id: 'live-0', titulo: 'Live', data: null, status: 'rascunho', itens: [], ...overrides };
}

test('F10 selectNextLive prioriza a live em execução sobre datas futuras', () => {
  const now = new Date('2026-09-20T12:00:00Z');
  const lives: HomeLive[] = [
    live({ id: 'future', status: 'fechado', data: '2026-09-25' }),
    live({ id: 'queue', status: 'em_execucao', data: null })
  ];
  assert.equal(selectNextLive(lives, now)?.id, 'queue');
});

test('F10 selectNextLive escolhe a menor data futura entre rascunho/fechado/em_execucao', () => {
  const now = new Date('2026-09-20T12:00:00Z');
  const lives: HomeLive[] = [
    live({ id: 'far', status: 'fechado', data: '2026-10-01' }),
    live({ id: 'near', status: 'rascunho', data: '2026-09-21' }),
    live({ id: 'past', status: 'fechado', data: '2026-01-01' }),
    live({ id: 'done', status: 'executado', data: '2026-09-20' })
  ];
  assert.equal(selectNextLive(lives, now)?.id, 'near');
});

test('F10 selectNextLive retorna null sem candidatos elegíveis', () => {
  const now = new Date('2026-09-20T12:00:00Z');
  const lives: HomeLive[] = [
    live({ id: 'done', status: 'executado', data: '2026-12-01' }),
    live({ id: 'cancelled', status: 'cancelado', data: '2026-12-01' }),
    live({ id: 'no-date', status: 'rascunho', data: null })
  ];
  assert.equal(selectNextLive(lives, now), null);
});

test('F10 selectRecentLives respeita o limite e a ordem recebida', () => {
  const lives: HomeLive[] = [live({ id: 'a' }), live({ id: 'b' }), live({ id: 'c' })];
  assert.deepEqual(selectRecentLives(lives, 2).map((item) => item.id), ['a', 'b']);
});

test('F10 selectTopPlayed filtra músicas nunca tocadas e ordena de forma decrescente', () => {
  const musicas: HomeMusic[] = [
    { id: '1', titulo: 'A', artista: 'X', xEmLives: 0 },
    { id: '2', titulo: 'B', artista: 'X', xEmLives: 5 },
    { id: '3', titulo: 'C', artista: 'X', xEmLives: 9 }
  ];
  assert.deepEqual(selectTopPlayed(musicas).map((item) => item.id), ['3', '2']);
});

test('F10 greeting cobre manhã, tarde e noite', () => {
  assert.equal(greeting(new Date('2026-09-20T08:00:00')), 'Bom dia');
  assert.equal(greeting(new Date('2026-09-20T14:00:00')), 'Boa tarde');
  assert.equal(greeting(new Date('2026-09-20T21:00:00')), 'Boa noite');
});

test('F10 statusLabel traduz os status conhecidos e preserva os desconhecidos', () => {
  assert.equal(statusLabel('em_execucao'), 'Em execução');
  assert.equal(statusLabel('inexistente'), 'inexistente');
});

test('F10 a raiz serve a home fora do shell e expõe uma rota inicial de Configurações', () => {
  const routes = read('frontend/src/app/app.routes.ts');
  assert.match(routes, /path: '', pathMatch: 'full', component: HomePageComponent/);
  assert.match(routes, /path: 'configuracoes', component: PlaceholderPageComponent/);
  assert.doesNotMatch(routes, /redirectTo: 'catalogo'/);
});

test('F10 a home consulta apenas endpoints já existentes e reaproveita o placeholder de Configurações', () => {
  const service = read('frontend/src/app/pages/home/home.service.ts');
  assert.match(service, /\/api\/lives/);
  assert.match(service, /\/api\/v1\/musicas/);
  const template = read('frontend/src/app/pages/home/home-page.component.html');
  const navigation = read('frontend/src/app/pages/home/home.navigation.ts');
  const renderedSources = `${template}\n${navigation}`;
  for (const label of ['Catálogo', 'Blocos', 'Lives', 'Execução', 'Nova música', 'Configurações']) {
    assert.match(renderedSources, new RegExp(label));
  }
});
