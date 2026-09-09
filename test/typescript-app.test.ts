import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { getRepositoryInvocationCount, openDatabase } from '../src/db/repositories.js';
import { createApp } from '../server.js';
import { createDrizzleClient } from '../src/db/client.js';
import { musicas } from '../src/db/schema.js';

test('servidor TypeScript preserva o contrato HTTP do catálogo', async () => {
  const root = mkdtempSync(join(tmpdir(), 'live-console-ts-'));
  const database = openDatabase(join(root, 'catalogo.sqlite'));
  const drizzle = createDrizzleClient(database);
  const app = createApp({ database, storageRoot: join(root, 'storage') });
  const before = getRepositoryInvocationCount();

  const health = await app.inject({ method: 'GET', url: '/api/health' });
  assert.equal(health.statusCode, 200);
  assert.deepEqual(health.json(), { ok: true });

  const created = await app.inject({
    method: 'POST',
    url: '/api/musicas',
    payload: { artista: 'Artista fictício', titulo: 'Canção fictícia', autoral: false, xEmLives: 0 }
  });
  assert.equal(created.statusCode, 201);
  const id = created.json<{ musica: { id: string } }>().musica.id;
  assert.equal((await drizzle.select().from(musicas)).length, 1);
  assert.ok(getRepositoryInvocationCount() > before, 'HTTP flow uses the TypeScript/Drizzle repository boundary');

  const updated = await app.inject({ method: 'PATCH', url: `/api/musicas/${id}`, payload: { duracao: 0 } });
  assert.equal(updated.statusCode, 200);
  assert.equal(updated.json<{ musica: { duracao: number } }>().musica.duracao, 0);
  await app.close();
  database.close();
});

test('mount legado expõe o console v0 baseado em JSON sem alterar as APIs', async () => {
  const root = mkdtempSync(join(tmpdir(), 'live-console-legacy-'));
  const database = openDatabase(join(root, 'catalogo.sqlite'));
  const app = createApp({ database, storageRoot: join(root, 'storage') });
  const legacy = await app.inject({ method: 'GET', url: '/legacy' });
  assert.equal(legacy.statusCode, 200);
  assert.match(legacy.body, /Abra o JSON da live/);
  assert.match(legacy.body, /type="file"/);
  for (const path of ['/legacy/catalogo', '/legacy/lives', '/legacy/blocos', '/legacy/execucao']) {
    assert.equal((await app.inject({ method: 'GET', url: path })).statusCode, 404, path);
  }
  await app.close();
  database.close();
});

test('shell V1 possui uma fronteira de rota separada do legacy', async () => {
  const root = mkdtempSync(join(tmpdir(), 'live-console-v1-'));
  const database = openDatabase(join(root, 'catalogo.sqlite'));
  const app = createApp({ database, storageRoot: join(root, 'storage') });
  const v1 = await app.inject({ method: 'GET', url: '/v1' });
  assert.ok([200, 503].includes(v1.statusCode), 'shell não deve cair no catch-all da aplicação atual');
  const legacy = await app.inject({ method: 'GET', url: '/legacy' });
  assert.equal(legacy.statusCode, 200);
  await app.close();
  database.close();
});
