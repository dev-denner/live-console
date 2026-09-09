import Fastify, { type FastifyInstance, type FastifyReply } from 'fastify';
import { DatabaseSync } from 'node:sqlite';
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
  setPrimarySource, updateMusic, updateSource, createLive, getLive, listLives, updateLive, removeLive, addLiveItem, updateLiveItem, removeLiveItem, reorderLiveItems, exportLegacyLive, listBlocks, getBlock, createBlock, updateBlock, removeBlock, addBlockMusic, removeBlockMusic, reorderBlockMusic, addBlockToLive, previewMontagem, confirmMontagem, getMontagem, startExecution, changeExecution, endExecution, executionHistory
} from './src/db/repositories.js';
import { confirmImport, inspectImport } from './src/importer.mjs';
import { musicPatchSchema, musicSchema, sourceSchema, blocoSchema, blocoPatchSchema, blocoMusicSchema, orderSchema, montagemSchema, execucaoActionSchema, idempotencySchema, messageForValidation } from './src/contracts.js';
import { z } from 'zod';

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

async function sendStatic(reply: FastifyReply, pathname: string): Promise<void> {
  const file = resolve(appRoot, pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, ''));
  if (!isInside(appRoot, file)) throw badRequest('Caminho inválido');
  const body = await readFile(file);
  reply.type(staticTypes[extname(file).toLowerCase()] ?? 'application/octet-stream').send(body);
}

const legacyPages: Record<string, string> = {
  '/legacy': 'index.html',
  '/legacy/': 'index.html',
  '/legacy/catalogo': 'catalogo.html',
  '/legacy/lives': 'lives.html',
  '/legacy/blocos': 'blocos.html',
  '/legacy/execucao': 'execucao.html'
};

async function sendLegacyPage(reply: FastifyReply, pathname: string): Promise<void> {
  const filename = legacyPages[pathname];
  if (!filename) {
    reply.code(404).send({ error: 'Página legada não encontrada' });
    return;
  }
  let body = (await readFile(resolve(appRoot, filename))).toString('utf8');
  const pageLinks: Array<[string, string]> = [
    ['/', '/legacy'],
    ['/catalogo', '/legacy/catalogo'],
    ['/lives', '/legacy/lives'],
    ['/blocos', '/legacy/blocos'],
    ['/execucao', '/legacy/execucao']
  ];
  for (const [from, to] of pageLinks) body = body.replaceAll(`href="${from}"`, `href="${to}"`);
  reply.type('text/html; charset=utf-8').send(body);
}

const liveSchema = z.object({ id: z.string().uuid().optional(), titulo: z.string().trim().min(1), data: z.string().nullable().optional(), status: z.string().optional(), observacoes: z.string().nullable().optional() }).strict();
const livePatchSchema = liveSchema.partial().omit({ id: true });
const liveItemSchema = z.object({ id: z.string().uuid().optional(), musicaId: z.string().uuid(), referenciaReproducao: z.string().min(1), tipoReproducao: z.enum(['youtube', 'audio', 'video']), duracaoPlanejada: z.number().int().nonnegative().nullable().optional(), observacao: z.string().nullable().optional(), interacoes: z.string().nullable().optional() }).strict();
const liveItemPatchSchema = liveItemSchema.partial().omit({ id: true, musicaId: true });

export function createApp({ database = openDatabase(defaultDatabase), storageRoot = defaultStorage }: { database?: DatabaseSync; storageRoot?: string } = {}): FastifyInstance {
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
    const id = createMusic(database, { ...music, status: music.status || 'ensaiar' });
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
  app.get('/api/importacao/modelo', async (_request, reply) => reply.header('Content-Disposition', 'attachment; filename="musicas.skeleton.json"').type('application/json').send(await readFile(join(appRoot, 'docs', 'import-format', 'musicas.skeleton.json'))));
  app.get('/api/exportacao', async () => exportCatalog(database));
  app.get('/api/blocos', async () => ({ blocos: listBlocks(database) }));
  app.post('/api/blocos', async (request,reply) => { const parsed=blocoSchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error));const id=createBlock(database,parsed.data);reply.code(201);return {bloco:getBlock(database,id)}; });
  app.get('/api/blocos/:id', async (request,reply) => {const bloco=getBlock(database,(request.params as {id:string}).id);return bloco?{bloco}:reply.code(404).send({error:'Não encontrado'});});
  app.patch('/api/blocos/:id', async (request,reply) => {const parsed=blocoPatchSchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error));const bloco=updateBlock(database,(request.params as {id:string}).id,parsed.data);return bloco?{bloco}:reply.code(404).send({error:'Não encontrado'});});
  app.delete('/api/blocos/:id', async (request,reply) => removeBlock(database,(request.params as {id:string}).id)?reply.code(204).send():reply.code(404).send({error:'Não encontrado'}));
  app.post('/api/blocos/:id/musicas', async (request,reply) => {const parsed=blocoMusicSchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error));try{const bloco=addBlockMusic(database,(request.params as {id:string}).id,parsed.data.musicaId);reply.code(201);return {bloco};}catch(error){const message=(error as Error).message;return reply.code(message.includes('já pertence')?409:404).send({error:message});}});
  app.delete('/api/blocos/:id/musicas/:musicaId', async (request,reply) => removeBlockMusic(database,(request.params as {id:string}).id,(request.params as {musicaId:string}).musicaId)?reply.code(204).send():reply.code(404).send({error:'Não encontrado'}));
  app.put('/api/blocos/:id/musicas/ordem', async (request,reply) => {const parsed=orderSchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error));try{return {musicas:reorderBlockMusic(database,(request.params as {id:string}).id,parsed.data.ids)};}catch(error){return reply.code(400).send({error:(error as Error).message});}});
  app.get('/api/lives', async () => ({ lives: listLives(database) }));
  app.post('/api/lives', async (request, reply) => { const parsed=liveSchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error)); const id=createLive(database,parsed.data);reply.code(201);return {live:getLive(database,id)}; });
  app.get('/api/lives/:id', async (request, reply) => { const live=getLive(database,(request.params as {id:string}).id);return live?{live}:reply.code(404).send({error:'Não encontrada'}); });
  app.patch('/api/lives/:id', async (request, reply) => {const parsed=livePatchSchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error));const live=updateLive(database,(request.params as {id:string}).id,parsed.data);return live?{live}:reply.code(404).send({error:'Não encontrada'});});
  app.delete('/api/lives/:id', async (request, reply) => removeLive(database,(request.params as {id:string}).id)?reply.code(204).send():reply.code(404).send({error:'Não encontrada'}));
  app.post('/api/lives/:id/itens', async (request, reply) => {const parsed=liveItemSchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error));const id=(request.params as {id:string}).id,item=addLiveItem(database,id,parsed.data);reply.code(201);return {item:getLive(database,id)?.itens.find((x: { id: string })=>x.id===item)};});
  app.patch('/api/lives/:id/itens/:itemId', async (request, reply) => {const parsed=liveItemPatchSchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error));const p=request.params as {id:string;itemId:string},item=updateLiveItem(database,p.id,p.itemId,parsed.data);return item?{item}:reply.code(404).send({error:'Não encontrada'});});
  app.delete('/api/lives/:id/itens/:itemId', async (request, reply) => {const p=request.params as {id:string;itemId:string};return removeLiveItem(database,p.id,p.itemId)?reply.code(204).send():reply.code(404).send({error:'Não encontrada'});});
  app.put('/api/lives/:id/itens/ordem', async (request) => {const ids=(request.body as {ids?:string[]}).ids;if(!Array.isArray(ids))throw badRequest('ids deve ser uma lista');return {itens:reorderLiveItems(database,(request.params as {id:string}).id,ids)};});
  app.get('/api/lives/:id/exportacao', async (request,reply) => {const x=exportLegacyLive(database,(request.params as {id:string}).id);return x??reply.code(404).send({error:'Não encontrada'});});
  app.post('/api/lives/:id/montagem/previa', async (request,reply) => {const parsed=montagemSchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error));try{const preview=previewMontagem(database,(request.params as {id:string}).id,parsed.data);return preview.conflitos.length?reply.code(422).send(preview):preview;}catch(error){const m=(error as Error).message;return reply.code(m==='Live não encontrada'?404:409).send({error:m});}});
  app.post('/api/lives/:id/montagem/confirmacao', async (request,reply) => {const parsed=montagemSchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error));try{return confirmMontagem(database,(request.params as {id:string}).id,parsed.data);}catch(error){const m=(error as Error & {preview?:unknown}).message;if(m==='Critérios impossíveis')return reply.code(422).send({error:m,relatorio:(error as Error & {preview:unknown}).preview});return reply.code(m==='Live não encontrada'?404:409).send({error:m});}});
  app.get('/api/lives/:id/montagem', async (request,reply) => {if(!getLive(database,(request.params as {id:string}).id))return reply.code(404).send({error:'Não encontrada'});const montagem=getMontagem(database,(request.params as {id:string}).id);return montagem?{montagem}:reply.code(404).send({error:'Montagem não encontrada'});});
  app.post('/api/lives/:id/execucao/iniciar',async(request,reply)=>{const p=idempotencySchema.safeParse(request.body);if(!p.success)throw badRequest(messageForValidation(p.error));try{return startExecution(database,(request.params as {id:string}).id,p.data.idempotencyKey)}catch(e){return reply.code((e as Error).message==='Live não encontrada'?404:409).send({error:(e as Error).message})}});
  app.post('/api/lives/:id/execucao/encerrar',async(request,reply)=>{const p=idempotencySchema.safeParse(request.body);if(!p.success)throw badRequest(messageForValidation(p.error));try{return endExecution(database,(request.params as {id:string}).id,p.data.idempotencyKey)}catch(e){return reply.code((e as Error).message==='Live não encontrada'?404:409).send({error:(e as Error).message})}});
  app.get('/api/lives/:id/execucao',async(request,reply)=>{const x=executionHistory(database,(request.params as {id:string}).id);return x?{execucao:x}:reply.code(404).send({error:'Não encontrada'})});
  app.post('/api/lives/:id/itens/:itemId/execucao',async(request,reply)=>{const p=execucaoActionSchema.safeParse(request.body);if(!p.success)throw badRequest(messageForValidation(p.error));try{return changeExecution(database,(request.params as {id:string}).id,(request.params as {itemId:string}).itemId,p.data)}catch(e){const m=(e as Error).message;return reply.code(m.includes('não encontrada')||m.includes('não pertence')?404:409).send({error:m})}});
  app.get('/api/lives/:id/historico',async(request,reply)=>{const x=executionHistory(database,(request.params as {id:string}).id);return x?{historico:x}:reply.code(404).send({error:'Não encontrada'})});
  app.post('/api/lives/:id/blocos/:blocoId/itens', async (request,reply) => {try{return addBlockToLive(database,(request.params as {id:string}).id,(request.params as {blocoId:string}).blocoId);}catch(error){const message=(error as Error).message;if(['Live não está em rascunho','Música do bloco sem fonte principal válida'].includes(message))return reply.code(409).send({error:message});throw error;}});
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
  app.get('/blocos', async (_request, reply) => sendStatic(reply, '/blocos.html'));
  app.get('/execucao', async (_request, reply) => sendStatic(reply, '/execucao.html'));
  app.get('/legacy', async (_request, reply) => sendLegacyPage(reply, '/legacy'));
  app.get('/legacy/', async (_request, reply) => sendLegacyPage(reply, '/legacy/'));
  app.get('/legacy/catalogo', async (_request, reply) => sendLegacyPage(reply, '/legacy/catalogo'));
  app.get('/legacy/lives', async (_request, reply) => sendLegacyPage(reply, '/legacy/lives'));
  app.get('/legacy/blocos', async (_request, reply) => sendLegacyPage(reply, '/legacy/blocos'));
  app.get('/legacy/execucao', async (_request, reply) => sendLegacyPage(reply, '/legacy/execucao'));
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
