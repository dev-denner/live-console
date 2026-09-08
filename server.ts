import Fastify, { type FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  addSource, createMusic, exportCatalog, getMusic,
  listMusic, openDatabase, removeMusic, removeSource, reorderSources, setLyrics,
  setPrimarySource, updateMusic, updateSource, createLive, getLive, listLives, updateLive, removeLive, addLiveItem, updateLiveItem, removeLiveItem, reorderLiveItems, exportLegacyLive
} from './src/db.mjs';
import { confirmImport, inspectImport } from './src/importer.mjs';
import { musicPatchSchema, musicSchema, sourceSchema, messageForValidation } from './src/contracts.js';

const appRoot = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = basename(appRoot.replace(/[\\/]$/, '')).toLowerCase() === 'live-console'
  ? dirname(appRoot.replace(/[\\/]$/, ''))
  : appRoot;
const defaultDatabase = process.env.LIVE_CONSOLE_DB ?? join(appRoot, 'data', 'live-console.sqlite');
const defaultStorage = resolve(process.env.LIVE_CONSOLE_STORAGE ?? join(appRoot, 'storage'));
const maxUploadBytes = 5 * 1024 * 1024;
const staticTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8'
};
const uploadExtensions: Record<string, ReadonlySet<string>> = {
  audio: new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg']),
  video: new Set(['.mp4', '.mov', '.mkv', '.webm']),
  letras: new Set(['.txt', '.md'])
};

function isInside(parent: string, child: string): boolean {
  const relative = resolve(child).slice(resolve(parent).length);
  return resolve(child) === resolve(parent) || (relative.startsWith(sep) && !relative.includes(`..${sep}`));
}

function badRequest(message: string): Error & { statusCode: number } {
  return Object.assign(new Error(message), { statusCode: 400 });
}

function sourceFileForLegacyReference(reference: string): string {
  const portable = reference.replace(/\\/g, '/');
  const marker = '/lives/';
  const index = portable.toLowerCase().lastIndexOf(marker);
  const relative = index >= 0 ? portable.slice(index + marker.length) : portable.replace(/^\.?\/+/, '');
  const candidate = resolve(projectRoot, relative.split('/').join(sep));
  const permitted = ['musicas', 'letras', 'repertorios'].some((folder) => isInside(join(projectRoot, folder), candidate));
  if (!permitted) throw badRequest('Arquivo fora das pastas permitidas');
  return candidate;
}

async function sendStatic(reply: Parameters<FastifyInstance['get']>[1] extends never ? never : any, pathname: string): Promise<void> {
  const file = resolve(appRoot, pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, ''));
  if (!isInside(appRoot, file)) throw badRequest('Caminho inválido');
  const body = await readFile(file);
  reply.type(staticTypes[extname(file).toLowerCase()] ?? 'application/octet-stream').send(body);
}

export function createApp({ database = openDatabase(defaultDatabase), storageRoot = defaultStorage }: { database?: any; storageRoot?: string } = {}): FastifyInstance {
  const app = Fastify({ logger: false, bodyLimit: maxUploadBytes });
  app.register(multipart, { limits: { fileSize: maxUploadBytes, files: 1 } });

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
    reply.code(statusCode).send({ error: (error as Error).message || 'Erro interno' });
  });

  app.get('/api/health', async () => ({ ok: true }));
  app.get('/api/musicas', async (request) => ({ musicas: listMusic(database, request.query as Record<string, unknown>) }));
  app.post('/api/musicas', async (request, reply) => {
    const parsed = musicSchema.safeParse(request.body);
    if (!parsed.success) throw badRequest(messageForValidation(parsed.error));
    const { fontes = [], ...music } = parsed.data;
    const id = createMusic(database, music);
    for (const source of fontes) addSource(database, id, source);
    reply.code(201);
    return { musica: getMusic(database, id) };
  });
  app.get('/api/musicas/:id', async (request, reply) => {
    const music = getMusic(database, (request.params as { id: string }).id);
    if (!music) return reply.code(404).send({ error: 'Não encontrada' });
    return { musica: music };
  });
  app.patch('/api/musicas/:id', async (request, reply) => {
    const parsed = musicPatchSchema.safeParse(request.body);
    if (!parsed.success) throw badRequest(messageForValidation(parsed.error));
    const music = updateMusic(database, (request.params as { id: string }).id, parsed.data);
    if (!music) return reply.code(404).send({ error: 'Não encontrada' });
    return { musica: music };
  });
  app.delete('/api/musicas/:id', async (request, reply) => {
    const deleted = removeMusic(database, (request.params as { id: string }).id);
    return deleted ? reply.code(204).send() : reply.code(404).send({ error: 'Não encontrada' });
  });
  app.post('/api/musicas/:id/fontes', async (request, reply) => {
    const parsed = sourceSchema.safeParse(request.body);
    if (!parsed.success) throw badRequest(messageForValidation(parsed.error));
    const id = (request.params as { id: string }).id;
    const sourceId = addSource(database, id, parsed.data);
    reply.code(201);
    return { fonte: getMusic(database, id)?.fontes.find((source: { id: string }) => source.id === sourceId) };
  });
  app.patch('/api/musicas/:id/fontes/:sourceId', async (request, reply) => {
    const parsed = sourceSchema.partial().safeParse(request.body);
    if (!parsed.success) throw badRequest(messageForValidation(parsed.error));
    const params = request.params as { id: string; sourceId: string };
    const source = updateSource(database, params.id, params.sourceId, parsed.data);
    if (!source) return reply.code(404).send({ error: 'Não encontrada' });
    return { fonte: source };
  });
  app.delete('/api/musicas/:id/fontes/:sourceId', async (request, reply) => {
    const params = request.params as { id: string; sourceId: string };
    return removeSource(database, params.id, params.sourceId) ? reply.code(204).send() : reply.code(404).send({ error: 'Não encontrada' });
  });
  app.put('/api/musicas/:id/fontes/principal', async (request, reply) => {
    const body = request.body as { id?: string };
    if (!body?.id) throw badRequest('id é obrigatório');
    return setPrimarySource(database, (request.params as { id: string }).id, body.id)
      ? { musica: getMusic(database, (request.params as { id: string }).id) }
      : reply.code(404).send({ error: 'Não encontrada' });
  });
  app.put('/api/musicas/:id/fontes/ordem', async (request) => {
    const body = request.body as { ids?: string[] };
    if (!Array.isArray(body?.ids)) throw badRequest('ids deve ser uma lista');
    return { fontes: reorderSources(database, (request.params as { id: string }).id, body.ids) };
  });
  app.put('/api/musicas/:id/letra', async (request, reply) => {
    const body = request.body as { referencia?: string };
    if (typeof body?.referencia !== 'string') throw badRequest('referencia é obrigatória');
    const music = setLyrics(database, (request.params as { id: string }).id, body.referencia);
    if (!music) return reply.code(404).send({ error: 'Não encontrada' });
    return { musica: music };
  });
  app.delete('/api/musicas/:id/letra', async (request, reply) => {
    const music = setLyrics(database, (request.params as { id: string }).id, null);
    if (!music) return reply.code(404).send({ error: 'Não encontrada' });
    return { musica: music };
  });
  app.post('/api/importacao/previa', async (request) => ({ relatorio: inspectImport(database, request.body, { storageRoot }) }));
  app.post('/api/importacao/confirmar', async (request) => {
    const body = request.body as { payload?: unknown; partial?: boolean };
    return { relatorio: confirmImport(database, body.payload, { partial: body.partial === true, storageRoot }) };
  });
  app.get('/api/exportacao', async () => exportCatalog(database));
  app.get('/api/lives', async () => ({ lives: listLives(database) }));
  app.post('/api/lives', async (request, reply) => { const id=createLive(database,request.body as any);reply.code(201);return {live:getLive(database,id)}; });
  app.get('/api/lives/:id', async (request, reply) => { const live=getLive(database,(request.params as {id:string}).id);return live?{live}:reply.code(404).send({error:'Não encontrada'}); });
  app.patch('/api/lives/:id', async (request, reply) => {const live=updateLive(database,(request.params as {id:string}).id,request.body as any);return live?{live}:reply.code(404).send({error:'Não encontrada'});});
  app.delete('/api/lives/:id', async (request, reply) => removeLive(database,(request.params as {id:string}).id)?reply.code(204).send():reply.code(404).send({error:'Não encontrada'}));
  app.post('/api/lives/:id/itens', async (request, reply) => {const body=request.body as any;if(!body.musicaId||!body.referenciaReproducao||!body.tipoReproducao)throw badRequest('campos de item obrigatórios');const id=(request.params as {id:string}).id,item=addLiveItem(database,id,body);reply.code(201);return {item:getLive(database,id)?.itens.find((x:any)=>x.id===item)};});
  app.patch('/api/lives/:id/itens/:itemId', async (request, reply) => {const p=request.params as {id:string;itemId:string},item=updateLiveItem(database,p.id,p.itemId,request.body as any);return item?{item}:reply.code(404).send({error:'Não encontrada'});});
  app.delete('/api/lives/:id/itens/:itemId', async (request, reply) => {const p=request.params as {id:string;itemId:string};return removeLiveItem(database,p.id,p.itemId)?reply.code(204).send():reply.code(404).send({error:'Não encontrada'});});
  app.put('/api/lives/:id/itens/ordem', async (request) => {const ids=(request.body as {ids?:string[]}).ids;if(!Array.isArray(ids))throw badRequest('ids deve ser uma lista');return {itens:reorderLiveItems(database,(request.params as {id:string}).id,ids)};});
  app.get('/api/lives/:id/exportacao', async (request,reply) => {const x=exportLegacyLive(database,(request.params as {id:string}).id);return x??reply.code(404).send({error:'Não encontrada'});});
  app.post('/api/uploads/:kind', async (request, reply) => {
    const kind = (request.params as { kind: string }).kind;
    const accepted = uploadExtensions[kind];
    if (!accepted) throw badRequest('Tipo de upload inválido');
    const file = await request.file();
    if (!file) throw badRequest('Arquivo ausente');
    const extension = extname(basename(file.filename)).toLowerCase();
    if (!accepted.has(extension)) throw badRequest('Extensão não permitida');
    const targetDirectory = join(storageRoot, kind);
    await mkdir(targetDirectory, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    const target = join(targetDirectory, filename);
    try {
      await writeFile(target, await file.toBuffer(), { flag: 'wx' });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') await unlink(target).catch(() => undefined);
      throw error;
    }
    reply.code(201);
    return { referencia: `storage/${kind}/${filename}` };
  });
  app.get('/local', async (request, reply) => {
    const reference = (request.query as { path?: string }).path ?? '';
    const file = sourceFileForLegacyReference(reference);
    const body = await readFile(file);
    return reply.header('Cache-Control', 'no-store').type(staticTypes[extname(file).toLowerCase()] ?? 'application/octet-stream').send(body);
  });
  app.get('/catalogo', async (_request, reply) => sendStatic(reply, '/catalogo.html'));
  app.get('/lives', async (_request, reply) => sendStatic(reply, '/lives.html'));
  app.get('/', async (_request, reply) => sendStatic(reply, '/'));
  app.get('/*', async (request, reply) => {
    const pathname = request.url.split('?')[0] ?? '/';
    return sendStatic(reply, pathname);
  });
  return app;
}

function openBrowser(url: string): void {
  const command = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.on('error', () => undefined);
  child.unref();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT) || 8787;
  const app = createApp();
  void app.listen({ port, host: '127.0.0.1' }).then(() => {
    console.log(`Live Console: http://localhost:${port}`);
    console.log(`Catálogo: http://localhost:${port}/catalogo`);
    if (process.env.NO_OPEN !== '1') openBrowser(`http://localhost:${port}`);
  });
}
