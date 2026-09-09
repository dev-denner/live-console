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
