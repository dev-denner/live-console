import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, unlinkSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { createApp } from '../server.js';
import { openDatabase, getMusic, updateMusic, createBlock, addBlockMusic } from '../src/db/repositories.js';

function setup() {
  const root = mkdtempSync(join(tmpdir(), 'live-console-f5-'));
  const database = openDatabase(join(root, 'catalog.sqlite'));
  const app = createApp({ database, storageRoot: root });
  return { root, database, app };
}

test('F5 cria, edita e round-tripa música, Markdown e versões sem alterar xEmLives', async () => {
  const { root, database, app } = setup();
  const payload = { titulo: 'Canção F5', artista: 'Artista F5', genero: null, origem: null, observacoes: null, autoral: true, status: true, letraMarkdown: '# Refrão\n\nTexto UTF-8: ação', versoes: [
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
  const editedLyricsPath = updated.json<{ musica: { letraCaminho: string } }>().musica.letraCaminho;
  assert.notEqual(editedLyricsPath, music.letraCaminho);
  assert.equal(readFileSync(join(root, editedLyricsPath), 'utf8'), '## Nova letra');
  assert.equal(getMusic(database, music.id).x_em_lives, 0);
  unlinkSync(join(root, editedLyricsPath));
  const missing = await app.inject({ method: 'GET', url: `/api/v1/musicas/${music.id}` });
  assert.match(missing.json<{ musica: { letraAviso: string } }>().musica.letraAviso, /não foi encontrada/);
  await app.close(); database.close();
});

test('F5 edita mídia local sem reenviar referenciaRelativa e preserva o agregado', async () => {
  const { root, database, app } = setup(); const staging = join(root, '.staging'); mkdirSync(staging, { recursive: true });
  const oldStagingId = crypto.randomUUID(); writeFileSync(join(staging, `${oldStagingId}.mp3`), Buffer.from('old-audio'));
  const videoStagingId = crypto.randomUUID(); writeFileSync(join(staging, `${videoStagingId}.mp4`), Buffer.from('video'));
  const valid = await app.inject({ method: 'POST', url: '/api/v1/musicas', payload: { titulo: 'Mídia editável', artista: 'Artista F5', status: true, letraMarkdown: '# Letra intacta', versoes: [
    { id: crypto.randomUUID(), nome: 'Áudio', ordem: 1, tipo: 'audio', referencia: 'old.mp3', stagingId: oldStagingId, duracao: 120, abertura: false },
    { id: crypto.randomUUID(), nome: 'Vídeo', ordem: 2, tipo: 'video', referencia: 'video.mp4', stagingId: videoStagingId, duracao: 130, abertura: false },
    { id: crypto.randomUUID(), nome: 'YouTube', ordem: 3, tipo: 'youtube', referencia: 'https://youtu.be/preservado', duracao: 140, abertura: false }
  ] } });
  assert.equal(valid.statusCode, 201);
  const initial = valid.json<{ musica: { id: string; xEmLives: number; letraMarkdown: string; versoes: Array<{ id: string; nome: string; ordem: number; tipo: string; referencia: string; referenciaRelativa?: string; duracao: number; abertura: boolean }> } }>().musica;
  updateMusic(database, initial.id, { xEmLives: 7 });
  const loaded = await app.inject({ method: 'GET', url: `/api/v1/musicas/${initial.id}` });
  const read = loaded.json<{ musica: typeof initial }>().musica;
  assert.ok(read.versoes.find((version) => version.tipo === 'audio')?.referenciaRelativa);

  const writeVersion = (version: typeof read.versoes[number], extra: Record<string, unknown> = {}) => ({ id: version.id, nome: version.nome, ordem: version.ordem, tipo: version.tipo, referencia: version.tipo === 'youtube' ? version.referencia : version.referenciaRelativa, duracao: version.duracao, abertura: version.abertura, ...extra });
  const withoutReplacement = { id: read.id, titulo: read.titulo, artista: read.artista, genero: read.genero, origem: read.origem, observacoes: read.observacoes, autoral: read.autoral, status: read.status, letraMarkdown: read.letraMarkdown, versoes: read.versoes.map((version) => writeVersion(version)) };
  const savedWithoutReplacement = await app.inject({ method: 'PUT', url: `/api/v1/musicas/${initial.id}`, payload: withoutReplacement });
  assert.equal(savedWithoutReplacement.statusCode, 200);
  assert.equal(savedWithoutReplacement.json<{ musica: { letraMarkdown: string } }>().musica.letraMarkdown, '# Letra intacta');
  assert.equal(getMusic(database, initial.id).x_em_lives, 7);

  const newStagingId = crypto.randomUUID(); writeFileSync(join(staging, `${newStagingId}.mp3`), Buffer.from('new-audio'));
  const oldAudio = read.versoes.find((version) => version.tipo === 'audio'); const oldAudioPath = join(root, oldAudio?.referenciaRelativa as string);
  const replacement = { ...withoutReplacement, versoes: read.versoes.map((version) => version.tipo === 'audio' ? writeVersion(version, { referencia: 'new.mp3', stagingId: newStagingId }) : writeVersion(version)) };
  const savedReplacement = await app.inject({ method: 'PUT', url: `/api/v1/musicas/${initial.id}`, payload: replacement });
  assert.equal(savedReplacement.statusCode, 200);
  const after = savedReplacement.json<{ musica: { versoes: Array<{ tipo: string; referencia: string; referenciaRelativa?: string }> } }>().musica;
  const newAudio = after.versoes.find((version) => version.tipo === 'audio');
  assert.ok(newAudio?.referenciaRelativa); assert.equal(existsSync(join(root, newAudio.referenciaRelativa)), true); assert.equal(existsSync(oldAudioPath), true);
  assert.equal(after.versoes.find((version) => version.tipo === 'youtube')?.referencia, 'https://youtu.be/preservado');
  assert.ok(after.versoes.find((version) => version.tipo === 'video')?.referenciaRelativa);
  assert.equal(existsSync(join(root, '.staging', `${newStagingId}.mp3`)), false);
  assert.equal((await app.inject({ method: 'GET', url: '/legacy' })).statusCode, 200);
  await app.close(); database.close();
});

test('F5 trata caminho de letra ausente sem criar arquivo e permite recriar', async () => {
  const { root, database, app } = setup();
  const created = await app.inject({ method: 'POST', url: '/api/v1/musicas', payload: { titulo: 'Letra ausente', artista: 'Artista F5', letraMarkdown: 'letra original', versoes: [] } });
  const music = created.json<{ musica: { id: string; letraCaminho: string } }>().musica;
  const originalPath = join(root, music.letraCaminho); unlinkSync(originalPath);
  const missing = await app.inject({ method: 'GET', url: `/api/v1/musicas/${music.id}` });
  const missingView = missing.json<{ musica: { letraEncontrada: boolean; letraAviso: string; letraMarkdown: null; letraCaminho: string } }>().musica;
  assert.equal(missingView.letraEncontrada, false); assert.match(missingView.letraAviso, /não foi encontrada/);
  const metadataOnly = await app.inject({ method: 'PUT', url: `/api/v1/musicas/${music.id}`, payload: { id: music.id, titulo: 'Letra ausente editada', artista: 'Artista F5', versoes: [] } });
  assert.equal(metadataOnly.statusCode, 200); assert.equal(getMusic(database, music.id).letra_caminho, null); assert.equal(readdirSync(join(root, 'letras')).length, 0);
  const edited = await app.inject({ method: 'PUT', url: `/api/v1/musicas/${music.id}`, payload: { id: music.id, titulo: 'Letra ausente editada', artista: 'Artista F5', letraMarkdown: 'nova letra explícita', versoes: [] } });
  assert.equal(edited.statusCode, 200); const editedMusic = edited.json<{ musica: { letraCaminho: string; letraEncontrada: boolean } }>().musica; assert.equal(editedMusic.letraEncontrada, true); assert.notEqual(editedMusic.letraCaminho, music.letraCaminho); assert.equal(readFileSync(join(root, editedMusic.letraCaminho), 'utf8'), 'nova letra explícita');
  const absolute = await app.inject({ method: 'PUT', url: `/api/v1/musicas/${music.id}`, payload: { id: music.id, titulo: 'Letra ausente editada', artista: 'Artista F5', letraCaminho: '/tmp/nao-persistir.md', versoes: [] } });
  assert.equal(absolute.statusCode, 200); assert.equal(getMusic(database, music.id).letra_caminho, editedMusic.letraCaminho); assert.equal((await app.inject({ method: 'GET', url: '/legacy' })).statusCode, 200);
  const stagingId = crypto.randomUUID(); mkdirSync(join(root, '.staging'), { recursive: true }); writeFileSync(join(root, '.staging', `${stagingId}.md`), 'letra por upload explícito');
  const uploaded = await app.inject({ method: 'PUT', url: `/api/v1/musicas/${music.id}`, payload: { id: music.id, titulo: 'Letra ausente editada', artista: 'Artista F5', letraStagingId: stagingId, versoes: [] } });
  assert.equal(uploaded.statusCode, 200); const uploadedMusic = uploaded.json<{ musica: { letraCaminho: string } }>().musica; assert.equal(readFileSync(join(root, uploadedMusic.letraCaminho), 'utf8'), 'letra por upload explícito'); assert.equal(existsSync(join(root, '.staging', `${stagingId}.md`)), false); assert.ok(readdirSync(join(root, 'letras')).every((name) => readFileSync(join(root, 'letras', name), 'utf8').length > 0));
  await app.close(); database.close();
});

test('F5.1 persiste status booleano, permite alternar o campo e filtra a listagem V1', async () => {
  const { database, app } = setup();
  const active = await app.inject({ method: 'POST', url: '/api/v1/musicas', payload: { titulo: 'Ativa', artista: 'A' } });
  const inactive = await app.inject({ method: 'POST', url: '/api/v1/musicas', payload: { titulo: 'Inativa', artista: 'B', status: false } });
  assert.equal(active.json<{ musica: { status: boolean } }>().musica.status, true);
  const inactiveId = inactive.json<{ musica: { id: string; status: boolean } }>().musica.id;
  assert.equal(inactive.json<{ musica: { status: boolean } }>().musica.status, false);
  let list = await app.inject({ method: 'GET', url: '/api/v1/musicas?status=false' });
  assert.deepEqual(list.json<{ musicas: Array<{ titulo: string; status: boolean }> }>().musicas.map((music) => [music.titulo, music.status]), [['Inativa', false]]);
  const edited = await app.inject({ method: 'PUT', url: `/api/v1/musicas/${inactiveId}`, payload: { titulo: 'Inativa', artista: 'B', status: true, versoes: [] } });
  assert.equal(edited.json<{ musica: { status: boolean } }>().musica.status, true);
  const reloaded = await app.inject({ method: 'GET', url: `/api/v1/musicas/${inactiveId}` });
  assert.equal(reloaded.json<{ musica: { status: boolean } }>().musica.status, true);
  list = await app.inject({ method: 'GET', url: '/api/v1/musicas?status=true' });
  assert.equal(list.json<{ musicas: Array<{ titulo: string }> }>().musicas.some((music) => music.titulo === 'Inativa'), true);
  assert.equal(database.prepare('SELECT x_em_lives FROM musicas WHERE id=?').get(inactiveId).x_em_lives, 0);
  await app.close(); database.close();
});

test('F5 rejeita ordens duplicadas e remove mídia promovida quando o agregado falha', async () => {
  const { root, database, app } = setup();
  const stagingId = crypto.randomUUID();
  const staging = join(root, '.staging');
  const staged = join(staging, `${stagingId}.mp3`);
  const { mkdirSync } = await import('node:fs'); mkdirSync(staging, { recursive: true }); writeFileSync(staged, Buffer.from('audio'));
  const response = await app.inject({ method: 'POST', url: '/api/v1/musicas', payload: {
    titulo: 'Falha', artista: 'Artista', autoral: false, status: true, versoes: [
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
  const result = await app.inject({ method: 'POST', url: '/api/v1/musicas', payload: { titulo: 'Mídia', artista: 'A', autoral: false, status: true, versoes: [{ id: crypto.randomUUID(), nome: 'Arquivo', ordem: 1, tipo: 'audio', referencia: 'x.mp3', stagingId, abertura: false }] } });
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

test('F5.1 exclui agregado, vínculos, letra e mídias locais sem tocar xEmLives', async () => {
  const { root, database, app } = setup();
  const staging = join(root, '.staging'); const { mkdirSync } = await import('node:fs'); mkdirSync(staging, { recursive: true });
  const audioId = crypto.randomUUID(); const videoId = crypto.randomUUID();
  writeFileSync(join(staging, `${audioId}.mp3`), Buffer.from('audio')); writeFileSync(join(staging, `${videoId}.mp4`), Buffer.from('video'));
  const created = await app.inject({ method: 'POST', url: '/api/v1/musicas', payload: { titulo: 'Excluir', artista: 'Artista', letraMarkdown: '# letra', versoes: [
    { id: crypto.randomUUID(), nome: 'Áudio', ordem: 1, tipo: 'audio', referencia: 'audio.mp3', stagingId: audioId, abertura: false },
    { id: crypto.randomUUID(), nome: 'Vídeo', ordem: 2, tipo: 'video', referencia: 'video.mp4', stagingId: videoId, abertura: false },
    { id: crypto.randomUUID(), nome: 'YouTube', ordem: 3, tipo: 'youtube', referencia: 'https://youtu.be/literal', abertura: false }
  ] } });
  const music = created.json<{ musica: { id: string; xEmLives: number; versoes: Array<{ referenciaRelativa: string }> } }>().musica;
  const blockId = createBlock(database, { nome: 'Bloco de teste' }); addBlockMusic(database, blockId, music.id);
  const files = music.versoes.filter((version) => version.referenciaRelativa).map((version) => join(root, version.referenciaRelativa)); files.push(join(root, 'letras', `${music.id}.md`));
  assert.equal(files.every((file) => existsSync(file)), true);
  const deleted = await app.inject({ method: 'DELETE', url: `/api/v1/musicas/${music.id}` });
  assert.equal(deleted.statusCode, 200); assert.equal((getMusic(database, music.id)), null);
  assert.equal(database.prepare('SELECT count(*) AS n FROM musicas_do_bloco WHERE musica_id=?').get(music.id).n, 0);
  assert.equal(files.every((file) => !existsSync(file)), true);
  assert.equal(deleted.json<{ removidos: string[] }>().removidos.some((path) => path.includes('http')), false);
  const missing = await app.inject({ method: 'GET', url: `/api/v1/musicas/${music.id}` }); assert.equal(missing.statusCode, 404);
  await app.close(); database.close();
});

test('F5.1 cancela exclusão quando arquivo físico é compartilhado e retorna 404 para ID inexistente', async () => {
  const first = setup(); const second = setup();
  const shared = 'musicas/shared.mp3'; mkdirSync(join(first.root, 'musicas'), { recursive: true }); writeFileSync(join(first.root, shared), Buffer.from('shared'));
  const one = await first.app.inject({ method: 'POST', url: '/api/v1/musicas', payload: { titulo: 'Um', artista: 'A', versoes: [{ nome: 'Arquivo', ordem: 1, tipo: 'audio', referencia: shared, abertura: false }] } });
  const id = one.json<{ musica: { id: string } }>().musica.id;
  const secondId = crypto.randomUUID(); const secondMusic = second.database;
  // The repository-level scenario is intentionally isolated per database; create the shared reference in the same DB.
  const same = await first.app.inject({ method: 'POST', url: '/api/v1/musicas', payload: { id: secondId, titulo: 'Dois', artista: 'B', versoes: [{ nome: 'Arquivo', ordem: 1, tipo: 'audio', referencia: shared, abertura: false }] } });
  assert.equal(same.statusCode, 201);
  const conflictResponse = await first.app.inject({ method: 'DELETE', url: `/api/v1/musicas/${id}` }); assert.equal(conflictResponse.statusCode, 409);
  assert.equal(getMusic(first.database, id) !== null, true); assert.equal(existsSync(join(first.root, shared)), true);
  assert.equal((await first.app.inject({ method: 'DELETE', url: '/api/v1/musicas/00000000-0000-0000-0000-000000000000' })).statusCode, 404);
  await first.app.close(); first.database.close(); await second.app.close(); second.database.close();
});

test('F5.1 rollback de edição preserva música, letra e mídia anterior', async () => {
  const { root, database, app } = setup(); const staging = join(root, '.staging'); mkdirSync(staging, { recursive: true });
  const created = await app.inject({ method: 'POST', url: '/api/v1/musicas', payload: { titulo: 'Original', artista: 'A', letraMarkdown: 'antiga', versoes: [{ id: crypto.randomUUID(), nome: 'YouTube', ordem: 1, tipo: 'youtube', referencia: 'https://youtu.be/original', abertura: false }] } });
  const music = created.json<{ musica: { id: string } }>().musica; const stagedId = crypto.randomUUID(); writeFileSync(join(staging, `${stagedId}.mp3`), Buffer.from('new'));
  const failed = await app.inject({ method: 'PUT', url: `/api/v1/musicas/${music.id}`, payload: { titulo: 'Alterada', artista: 'A', letraMarkdown: 'nova', versoes: [
    { nome: 'novo áudio', ordem: 1, tipo: 'audio', referencia: 'new.mp3', stagingId: stagedId, abertura: false }, { nome: 'duplicada', ordem: 1, tipo: 'youtube', referencia: 'https://youtu.be/fail', abertura: false }
  ] } });
  assert.equal(failed.statusCode, 400); const loaded = await app.inject({ method: 'GET', url: `/api/v1/musicas/${music.id}` });
  assert.equal(loaded.json<{ musica: { titulo: string; letraMarkdown: string } }>().musica.titulo, 'Original'); assert.equal(loaded.json<{ musica: { letraMarkdown: string } }>().musica.letraMarkdown, 'antiga');
  assert.equal(existsSync(join(root, 'musicas')) ? readdirSync(join(root, 'musicas')).length : 0, 0); assert.equal(existsSync(join(staging, `${stagedId}.mp3`)), false);
  await app.close(); database.close();
});
