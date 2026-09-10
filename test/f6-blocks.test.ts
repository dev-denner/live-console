import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { addBlockMusic, createBlock, createMusic, getBlock, openDatabase } from '../src/db/repositories.js';
import { createApp } from '../server.js';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'f6-blocks-'));
  const database = openDatabase(join(root, 'catalog.sqlite'));
  return { root, database };
}

test('F6 impede que uma música-base pertença a dois blocos', () => {
  const { database } = fixture();
  const music = createMusic(database, { artista: 'A', titulo: 'Única' });
  const first = createBlock(database, { nome: 'Entrada' });
  const second = createBlock(database, { nome: 'Outra' });
  addBlockMusic(database, first, music);
  assert.throws(() => addBlockMusic(database, second, music), /já pertence ao bloco/);
  assert.equal(getBlock(database, second).musicas.length, 0);
  database.close();
});

test('F6 limita o bloco a dez músicas sem inserir parcialmente o décimo primeiro', () => {
  const { database } = fixture();
  const block = createBlock(database, { nome: 'Dez' });
  for (let index = 0; index < 11; index += 1) {
    const music = createMusic(database, { artista: 'A', titulo: `Música ${index + 1}` });
    if (index < 10) addBlockMusic(database, block, music);
    else assert.throws(() => addBlockMusic(database, block, music), /limitado a 10/);
  }
  assert.equal(getBlock(database, block).musicas.length, 10);
  database.close();
});

test('F6 API V1 informa opções indisponíveis e mantém o catálogo sem alterar xEmLives', async () => {
  const { root, database } = fixture();
  const available = createMusic(database, { artista: 'A', titulo: 'Livre' });
  const assigned = createMusic(database, { artista: 'B', titulo: 'Já usada', xEmLives: 8 });
  const block = createBlock(database, { nome: 'Escolha' });
  const other = createBlock(database, { nome: 'Outro' });
  addBlockMusic(database, other, assigned);
  const app = createApp({ database, storageRoot: root });
  let response = await app.inject({ method: 'GET', url: '/api/v1/blocos' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json<{ blocos: Array<{ id: string }> }>().blocos.length, 2);
  response = await app.inject({ method: 'PATCH', url: `/api/v1/blocos/${block}`, payload: { nome: 'Escolha editada', descricao: 'Manual' } });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json<{ bloco: { nome: string } }>().bloco.nome, 'Escolha editada');
  response = await app.inject({ method: 'GET', url: `/api/v1/blocos/${block}/opcoes-musicas` });
  assert.equal(response.statusCode, 200);
  const options = response.json<{ musicas: Array<{ id: string; disponivel: boolean; motivo: string | null }> }>().musicas;
  assert.equal(options.find((item) => item.id === available)?.disponivel, true);
  assert.match(options.find((item) => item.id === assigned)?.motivo ?? '', /Já pertence/);
  response = await app.inject({ method: 'POST', url: `/api/v1/blocos/${block}/musicas`, payload: { musicaId: available } });
  assert.equal(response.statusCode, 201);
  response = await app.inject({ method: 'POST', url: `/api/v1/blocos/${block}/musicas`, payload: { musicaId: assigned } });
  assert.equal(response.statusCode, 409);
  assert.equal(database.prepare('SELECT x_em_lives FROM musicas WHERE id=?').get(assigned).x_em_lives, 8);
  response = await app.inject({ method: 'DELETE', url: `/api/v1/blocos/${block}` });
  assert.equal(response.statusCode, 204);
  assert.equal(database.prepare('SELECT count(*) AS n FROM musicas WHERE id=?').get(available).n, 1);
  await app.close(); database.close();
});

test('F6 rota Angular deixou de ser placeholder e documenta o limite visual', async () => {
  const root = resolve(process.cwd());
  const routes = await readFile(join(root, 'frontend/src/app/app.routes.ts'), 'utf8');
  const page = await readFile(join(root, 'frontend/src/app/pages/blocos/blocos-page.component.html'), 'utf8');
  assert.match(routes, /path: 'blocos', component: BlocosPageComponent/);
  assert.match(page, /até 10/);
  assert.match(page, /option\.motivo/);
  assert.match(page, /Música-base, não versão/);
});
