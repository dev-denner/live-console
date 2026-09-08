import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { openDatabase } from '../src/db.mjs';
import { createApp } from '../server.js';

test('servidor TypeScript preserva o contrato HTTP do catálogo', async () => {
  const root = mkdtempSync(join(tmpdir(), 'live-console-ts-'));
  const database = openDatabase(join(root, 'catalogo.sqlite'));
  const app = createApp({ database, storageRoot: join(root, 'storage') });

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

  const updated = await app.inject({ method: 'PATCH', url: `/api/musicas/${id}`, payload: { duracao: 0 } });
  assert.equal(updated.statusCode, 200);
  assert.equal(updated.json<{ musica: { duracao: number } }>().musica.duracao, 0);
  await app.close();
  database.close();
});
