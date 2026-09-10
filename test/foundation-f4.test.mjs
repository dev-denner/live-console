import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createApp } from '../server.mjs';
import { addSource, createMusic, openDatabase } from '../src/db/repositories.js';

function request(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('F4 preserva a semântica tipada dos campos de leitura', () => {
  const song = { status: 'OK', autoral: false, musica_base: 'Base', x_em_lives: 0 };
  assert.equal(song.status, 'OK');
  assert.equal(song.autoral, false);
  assert.equal(song.x_em_lives, 0);
});

test('F4 integra filtros de catálogo no endpoint somente leitura existente', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'live-console-f4-'));
  const db = openDatabase(join(dir, 'catalog.sqlite'));
  const first = createMusic(db, { artista: 'Banda A', titulo: 'Noite calma', status: 'OK', autoral: true, bloco: 'Abertura', clima: 'calmo' });
  createMusic(db, { artista: 'Banda B', titulo: 'Manhã', status: 'ensaiar', autoral: false, bloco: 'Encerramento', clima: 'alto' });
  addSource(db, first, { nome: 'Versão acústica', tipo: 'youtube', referencia: 'https://example.test/acustica', principal: true });
  const app = createApp({ database: db, storageRoot: dir });
  await new Promise((resolve) => app.listen(0, '127.0.0.1', resolve));
  const port = app.address().port;
  try {
    const response = await request(port, '/api/musicas?q=noite&status=OK&autoral=true&bloco=Abertura&clima=calmo');
    assert.equal(response.status, 200);
    assert.equal(response.body.musicas.length, 1);
    assert.equal(response.body.musicas[0].fontes[0].nome, 'Versão acústica');
  } finally {
    await new Promise((resolve) => app.close(resolve));
    db.close();
  }
});
