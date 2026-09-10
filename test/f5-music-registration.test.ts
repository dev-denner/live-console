import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, existsSync, unlinkSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { createApp } from '../server.js';
import { openDatabase, getMusic } from '../src/db/repositories.js';

function setup() {
  const root = mkdtempSync(join(tmpdir(), 'live-console-f5-'));
  const database = openDatabase(join(root, 'catalog.sqlite'));
  const app = createApp({ database, storageRoot: root });
  return { root, database, app };
}

test('F5 cria, edita e round-tripa música, Markdown e versões sem alterar xEmLives', async () => {
  const { root, database, app } = setup();
  const payload = { titulo: 'Canção F5', artista: 'Artista F5', genero: null, origem: null, observacoes: null, autoral: true, ativo: true, letraMarkdown: '# Refrão\n\nTexto UTF-8: ação', versoes: [
    { id: crypto.randomUUID(), nome: 'Principal', ordem: 1, tipo: 'youtube', referencia: 'https://youtu.be/a?x=1&y=2', duracao: 120, abertura: true },
    { id: crypto.randomUUID(), nome: 'Acústica', ordem: 2, tipo: 'youtube', referencia: 'https://youtube.com/watch?v=literal%2Fvalue', duracao: null, abertura: false }
  ] };
  const created = await app.inject({ method: 'POST', url: '/api/v1/musicas', payload });
  assert.equal(created.statusCode, 201);
  const music = created.json<{ musica: { id: string; xEmLives: number; versoes: Array<{ ordem: number; abertura: boolean; referencia: string }> } }>().musica;
  assert.equal(music.xEmLives, 0);
  assert.equal(music.versoes[0]?.ordem, 1);
  assert.equal(music.versoes[0]?.abertura, true);
  assert.equal(music.versoes[0]?.referencia, payload.versoes[0].referencia);
  const lyricsPath = join(root, 'letras', `${music.id}.md`);
  assert.equal(readFileSync(lyricsPath, 'utf8'), payload.letraMarkdown);
  const loaded = await app.inject({ method: 'GET', url: `/api/v1/musicas/${music.id}` });
  assert.equal(loaded.json<{ musica: { letraMarkdown: string } }>().musica.letraMarkdown, payload.letraMarkdown);
  const edited = { ...payload, id: music.id, titulo: 'Canção F5 editada', letraMarkdown: '## Nova letra' };
  const updated = await app.inject({ method: 'PUT', url: `/api/v1/musicas/${music.id}`, payload: edited });
  assert.equal(updated.statusCode, 200);
  assert.equal(readFileSync(lyricsPath, 'utf8'), '## Nova letra');
  assert.equal(getMusic(database, music.id).x_em_lives, 0);
  unlinkSync(lyricsPath);
  const missing = await app.inject({ method: 'GET', url: `/api/v1/musicas/${music.id}` });
  assert.match(missing.json<{ musica: { letraAviso: string } }>().musica.letraAviso, /não foi encontrada/);
  await app.close(); database.close();
});

test('F5 rejeita ordens duplicadas e remove mídia promovida quando o agregado falha', async () => {
  const { root, database, app } = setup();
  const stagingId = crypto.randomUUID();
  const staging = join(root, '.staging');
  const staged = join(staging, `${stagingId}.mp3`);
  const { mkdirSync } = await import('node:fs'); mkdirSync(staging, { recursive: true }); writeFileSync(staged, Buffer.from('audio'));
  const response = await app.inject({ method: 'POST', url: '/api/v1/musicas', payload: {
    titulo: 'Falha', artista: 'Artista', autoral: false, ativo: true, versoes: [
      { id: crypto.randomUUID(), nome: 'A', ordem: 1, tipo: 'audio', referencia: 'A.mp3', stagingId, abertura: false },
      { id: crypto.randomUUID(), nome: 'B', ordem: 1, tipo: 'audio', referencia: 'B.mp3', abertura: true }
    ]
  } });
  assert.equal(response.statusCode, 400);
  assert.equal(existsSync(join(root, 'musicas')) ? readdirSync(join(root, 'musicas')).length : 0, 0);
  assert.equal(existsSync(staged), false);
  assert.equal(database.prepare('SELECT count(*) AS n FROM musicas').get().n, 0);
  await app.close(); database.close();
});

test('F5 serve mídia local por URL HTTP e não expõe caminho absoluto', async () => {
  const { root, database, app } = setup();
  const stagingId = crypto.randomUUID(); const staging = join(root, '.staging');
  const { mkdirSync } = await import('node:fs'); mkdirSync(staging, { recursive: true }); writeFileSync(join(staging, `${stagingId}.mp3`), Buffer.from('audio'));
  const result = await app.inject({ method: 'POST', url: '/api/v1/musicas', payload: { titulo: 'Mídia', artista: 'A', autoral: false, ativo: true, versoes: [{ id: crypto.randomUUID(), nome: 'Arquivo', ordem: 1, tipo: 'audio', referencia: 'x.mp3', stagingId, abertura: false }] } });
  assert.equal(result.statusCode, 201);
  const version = result.json<{ musica: { versoes: Array<{ referencia: string }> } }>().musica.versoes[0];
  assert.match(version.referencia, /^\/media\/musicas\//); assert.equal(version.referencia.includes(root), false);
  const media = await app.inject({ method: 'GET', url: version.referencia }); assert.equal(media.statusCode, 200); assert.equal(media.body, 'audio');
  await app.close(); database.close();
});

test('F5 valida extensão/tamanho e cancela staging sem deixar arquivo', async () => {
  const { root, database, app } = setup();
  const invalid = new FormData(); invalid.append('file', new File(['x'], 'capa.exe'));
  const invalidResponse = await app.inject({ method: 'POST', url: '/api/media/staging?kind=audio', payload: invalid });
  assert.equal(invalidResponse.statusCode, 400);
  const valid = new FormData(); valid.append('file', new File(['audio'], 'capa.mp3'));
  const staged = await app.inject({ method: 'POST', url: '/api/media/staging?kind=audio', payload: valid });
  assert.equal(staged.statusCode, 201);
  const stagingId = staged.json<{ stagingId: string }>().stagingId;
  assert.equal(existsSync(join(root, '.staging', `${stagingId}.mp3`)), true);
  const cancelled = await app.inject({ method: 'DELETE', url: `/api/media/staging/${stagingId}` });
  assert.equal(cancelled.statusCode, 204);
  assert.equal(existsSync(join(root, '.staging', `${stagingId}.mp3`)), false);
  await app.close(); database.close();
});
