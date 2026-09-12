import Fastify, { type FastifyInstance, type FastifyReply } from 'fastify';
import { DatabaseSync } from 'node:sqlite';
import multipart from '@fastify/multipart';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile, mkdir, writeFile, unlink, rename, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  addSource, createMusic, exportCatalog, getMusic,
  listMusic, openDatabase, removeMusic, removeSource, reorderSources, setLyrics,
  setPrimarySource, updateMusic, updateSource, createLive, getLive, listLives, updateLive, removeLive, addLiveItem, updateLiveItem, removeLiveItem, reorderLiveItems, exportLegacyLive, closeLive, duplicateLive, listBlocks, getBlock, createBlock, updateBlock, removeBlock, addBlockMusic, removeBlockMusic, reorderBlockMusic, listBlockMusicOptions, addBlockToLive, previewMontagem, confirmMontagem, getMontagem, startExecution, changeExecution, endExecution, executionHistory, getMusicRegistrationArtifacts, removeMusicRegistration
} from './src/db/repositories.js';
import { createLiveDraft, generateLiveDraft, getLiveDraft, listLiveDrafts, removeLiveDraft, updateLiveDraft } from './src/db/live-drafts.repository.js';
import { confirmImport, inspectImport } from './src/importer.mjs';
import { musicPatchSchema, musicSchema, sourceSchema, blocoSchema, blocoPatchSchema, blocoMusicSchema, orderSchema, montagemSchema, execucaoActionSchema, idempotencySchema, musicRegistrationSchema, liveDraftSchema, liveDraftGenerateSchema, messageForValidation } from './src/contracts.js';
import { saveMusicRegistration } from './src/db/repositories.js';
import { z } from 'zod';

const appRoot = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = basename(appRoot.replace(/[\\/]$/, '')).toLowerCase() === 'live-console'
  ? dirname(appRoot.replace(/[\\/]$/, ''))
  : appRoot;
const defaultDatabase = process.env.LIVE_CONSOLE_DB ?? join(appRoot, 'data', 'live-console.sqlite');
const defaultStorage = resolve(process.env.LIVE_CONSOLE_STORAGE ?? join(appRoot, 'storage'));
const workspaceRoot = existsSync(join(appRoot, 'frontend')) ? appRoot : resolve(appRoot, '..');
const v1BrowserRoot = resolve(workspaceRoot, 'frontend', 'dist', 'live-console-v1', 'browser');
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
const registrationUploadExtensions: Record<string, ReadonlySet<string>> = { audio: uploadExtensions.audio ?? new Set(), video: uploadExtensions.video ?? new Set() };

function isInside(parent: string, child: string): boolean {
  const relative = resolve(child).slice(resolve(parent).length);
  return resolve(child) === resolve(parent) || (relative.startsWith(sep) && !relative.includes(`..${sep}`));
}

function badRequest(message: string): Error & { statusCode: number } {
  return Object.assign(new Error(message), { statusCode: 400 });
}

function conflict(message: string): Error & { statusCode: number } { return Object.assign(new Error(message), { statusCode: 409 }); }
function mediaRelativePath(kind: 'audio' | 'video', filename: string): string { return `${kind === 'audio' ? 'musicas' : 'videos'}/${filename}`; }
function mediaUrl(relative: string): string { const [folder, ...rest] = relative.replace(/\\/g, '/').split('/'); return folder && rest.length ? `/media/${folder}/${rest.join('/')}` : relative; }
function lyricsRelativePath(path: string | null | undefined): string | null {
  if (path === null || path === undefined) return null;
  const normalized = path.replace(/\\/g, '/');
  if (!normalized.startsWith('letras/') || normalized.includes('..') || normalized.startsWith('/') || normalized.includes(':')) return null;
  return normalized;
}
function registrationView(music: any, lyrics: string | null, warning: string | null) {
  return { id: music.id, titulo: music.titulo, artista: music.artista, genero: music.genero_primario, origem: music.origem,
    observacoes: music.observacoes, autoral: music.autoral, status: Boolean(music.statusV1), xEmLives: music.x_em_lives,
    letraCaminho: music.letra_caminho, letraEncontrada: Boolean(music.letra_caminho && warning === null && lyrics !== null), letraMarkdown: lyrics, letraAviso: warning,
    versoes: music.fontes.map((source: any) => ({ id: source.id, nome: source.nome, ordem: source.ordem, tipo: source.tipo,
      referencia: source.tipo === 'youtube' ? source.referencia : mediaUrl(source.referencia), ...(source.tipo === 'youtube' ? {} : { referenciaRelativa: source.referencia }),
      duracao: source.duracao, abertura: source.abertura })) };
}

function catalogView(music: any) {
  return { id: music.id, titulo: music.titulo, artista: music.artista, autoral: music.autoral,
    status: Boolean(music.statusV1), xEmLives: music.x_em_lives,
    versoes: music.fontes.map((source: any) => ({ id: source.id, nome: source.nome, ordem: source.ordem,
      tipo: source.tipo, referencia: source.tipo === 'youtube' ? source.referencia : mediaUrl(source.referencia),
      duracao: source.duracao, abertura: source.abertura })) };
}

function blockSummaryView(block: any) {
  return { id: block.id, nome: block.nome, descricao: block.descricao, quantidadeMusicas: Number(block.quantidade_musicas ?? 0), criadaEm: block.criada_em, atualizadaEm: block.atualizada_em };
}

function blockMusicView(song: any) {
  return { id: song.id, titulo: song.titulo, artista: song.artista, status: Boolean(song.statusV1), autoral: song.autoral, xEmLives: song.x_em_lives, ordem: Number(song.ordem), fontes: song.fontes?.map((source: any) => ({ tipo: source.tipo, nome: source.nome, ordem: source.ordem })) ?? [] };
}

function blockView(block: any) {
  return { id: block.id, nome: block.nome, descricao: block.descricao, criadaEm: block.criada_em, atualizadaEm: block.atualizada_em, musicas: block.musicas.map(blockMusicView) };
}

function blockMusicOptionView(option: any) {
  return { id: option.id, titulo: option.titulo, artista: option.artista, status: Boolean(option.statusV1), autoral: option.autoral, xEmLives: option.x_em_lives, disponivel: option.disponivel, blocoAtualId: option.blocoAtualId, blocoAtualNome: option.blocoAtualNome, motivo: option.motivo };
}

function localRegistrationReference(storageRoot: string, type: 'audio' | 'video', reference: string): string {
  const folder = type === 'audio' ? 'musicas' : 'videos';
  const normalized = reference.replace(/\\/g, '/');
  if (!normalized.startsWith(`${folder}/`) || normalized.startsWith('/') || normalized.includes('..') || normalized.includes(':')) throw badRequest('Referência de mídia local inválida');
  const file = resolve(storageRoot, normalized);
  if (!isInside(join(storageRoot, folder), file) || !(registrationUploadExtensions[type] ?? new Set()).has(extname(file).toLowerCase())) throw badRequest('Referência de mídia local inválida');
  return file;
}

async function cleanupStaging(storageRoot: string, versions: Array<{ stagingId?: string | undefined }>, lyricStagingId?: string): Promise<void> {
  for (const version of versions) if (version.stagingId) for (const extension of [...(registrationUploadExtensions.audio ?? new Set()), ...(registrationUploadExtensions.video ?? new Set())]) await unlink(join(storageRoot, '.staging', `${version.stagingId}${extension}`)).catch(() => undefined);
  if (lyricStagingId) for (const extension of uploadExtensions.letras ?? new Set()) await unlink(join(storageRoot, '.staging', `${lyricStagingId}${extension}`)).catch(() => undefined);
}

async function promoteLyricsStaging(storageRoot: string, musicId: string, stagingId: string): Promise<{ path: string; content: string; target: string }> {
  const extension = [...(uploadExtensions.letras ?? new Set())].find((candidate) => existsSync(join(storageRoot, '.staging', `${stagingId}${candidate}`)));
  if (!extension) throw badRequest('Upload de letra staged não encontrado');
  const content = await readFile(join(storageRoot, '.staging', `${stagingId}${extension}`), 'utf8');
  if (!content.length) throw badRequest('Arquivo de letra vazio');
  const path = `letras/${musicId}-${randomUUID()}.md`;
  const target = join(storageRoot, path);
  await mkdir(dirname(target), { recursive: true }); await writeFile(target, content, 'utf8');
  await unlink(join(storageRoot, '.staging', `${stagingId}${extension}`));
  return { path, content, target };
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

async function sendLegacyConsole(reply: FastifyReply): Promise<void> {
  const body = await readFile(resolve(appRoot, 'legacy', 'index.html'));
  reply.type('text/html; charset=utf-8').send(body);
}

async function sendV1(reply: FastifyReply, pathname = '/v1'): Promise<void> {
  const relative = pathname.replace(/^\/v1\/?/, '');
  const candidate = resolve(v1BrowserRoot, relative || 'index.html');
  const file = isInside(v1BrowserRoot, candidate) && existsSync(candidate) ? candidate : resolve(v1BrowserRoot, 'index.html');
  if (!existsSync(file)) {
    reply.code(503).send({ error: 'Shell V1 ainda não foi compilado. Execute npm run build.' });
    return;
  }
  const body = await readFile(file);
  reply.type(staticTypes[extname(file).toLowerCase()] ?? 'application/octet-stream').send(body);
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
  app.post('/api/media/staging', async (request, reply) => {
    const kind = String((request.query as { kind?: string }).kind ?? '');
    const accepted = uploadExtensions[kind];
    if (!accepted) throw badRequest('Tipo de mídia inválido');
    const file = await request.file();
    if (!file) throw badRequest('Arquivo ausente');
    const extension = extname(basename(file.filename)).toLowerCase();
    if (!accepted.has(extension)) throw badRequest('Extensão não permitida');
    const stagingId = randomUUID();
    const stagingDirectory = join(storageRoot, '.staging');
    await mkdir(stagingDirectory, { recursive: true });
    await writeFile(join(stagingDirectory, `${stagingId}${extension}`), await file.toBuffer(), { flag: 'wx' });
    reply.code(201);
    return { stagingId, originalName: basename(file.filename), type: kind, size: Number(file.file.bytesRead) };
  });
  app.delete('/api/media/staging/:stagingId', async (request, reply) => {
    const stagingId = (request.params as { stagingId: string }).stagingId;
    if (!z.string().uuid().safeParse(stagingId).success) throw badRequest('Staging inválido');
    for (const extension of [...(registrationUploadExtensions.audio ?? new Set()), ...(registrationUploadExtensions.video ?? new Set())]) await unlink(join(storageRoot, '.staging', `${stagingId}${extension}`)).catch(() => undefined);
    return reply.code(204).send();
  });
  app.get('/media/:kind/*', async (request, reply) => {
    const params = request.params as { kind: string; '*': string };
    if (!['musicas', 'videos'].includes(params.kind)) return reply.code(404).send({ error: 'Mídia não encontrada' });
    const file = resolve(storageRoot, params.kind, params['*']);
    if (!isInside(join(storageRoot, params.kind), file) || !existsSync(file)) return reply.code(404).send({ error: 'Mídia não encontrada' });
    return reply.header('Cache-Control', 'no-store').type(staticTypes[extname(file).toLowerCase()] ?? 'application/octet-stream').send(await readFile(file));
  });
  app.get('/api/v1/musicas/:id', async (request, reply) => {
    const id = (request.params as { id: string }).id;
    const music = getMusic(database, id);
    if (!music) return reply.code(404).send({ error: 'Não encontrada' });
    let lyrics: string | null = null; let warning: string | null = null;
    const storedLyricsPath = lyricsRelativePath(music.letra_caminho);
    if (storedLyricsPath) { try { lyrics = await readFile(join(storageRoot, storedLyricsPath), 'utf8'); } catch { warning = 'A letra registrada não foi encontrada. Você pode recriá-la ao salvar.'; } }
    else if (music.letra_caminho) warning = 'A letra registrada usa um caminho inválido. Você pode recriá-la ao salvar.';
    return { musica: registrationView(music, lyrics, warning) };
  });
  app.post('/api/v1/musicas', async (request, reply) => {
    const parsed = musicRegistrationSchema.safeParse(request.body);
    if (!parsed.success) throw badRequest(messageForValidation(parsed.error));
    const id = parsed.data.id ?? randomUUID();
    if (parsed.data.id && getMusic(database, id)) throw conflict('A música já existe');
    const requestedLyricsPath = lyricsRelativePath(parsed.data.letraCaminho);
    const versions = parsed.data.versoes.map((version) => ({ ...version, id: version.id ?? randomUUID() }));
    const promoted: string[] = [];
    let lyricsPath: string | null = null;
    let lyricsTarget: string | null = null;
    let lyricsCreated = false;
    let lyricsContent: string | null = null;
    try {
      const finalizedVersions = [];
      for (const version of versions) {
        let reference = version.referencia;
        if (version.stagingId) {
          const extension = [...(registrationUploadExtensions[version.tipo] ?? [])].find((candidate) => existsSync(join(storageRoot, '.staging', `${version.stagingId}${candidate}`)));
          if (!extension) throw badRequest('Upload staged não encontrado');
          const folder = version.tipo === 'audio' ? 'musicas' : 'videos';
          const filename = `${id}-${version.id}-${randomUUID()}${extension}`;
          const target = join(storageRoot, folder, filename);
          if (existsSync(target)) throw conflict('Colisão de arquivo: o destino já existe');
          await mkdir(dirname(target), { recursive: true });
          await rename(join(storageRoot, '.staging', `${version.stagingId}${extension}`), target);
          promoted.push(target); reference = `${folder}/${filename}`;
        } else if (version.tipo !== 'youtube') {
          localRegistrationReference(storageRoot, version.tipo, version.referencia);
        }
        finalizedVersions.push({ ...version, referencia: reference });
      }
      if (parsed.data.letraStagingId) {
        const promotedLyrics = await promoteLyricsStaging(storageRoot, id, parsed.data.letraStagingId);
        lyricsPath = promotedLyrics.path; lyricsTarget = promotedLyrics.target; lyricsContent = promotedLyrics.content; lyricsCreated = true;
      } else if (typeof parsed.data.letraMarkdown === 'string' && parsed.data.letraMarkdown.length > 0) {
        lyricsContent = parsed.data.letraMarkdown; lyricsPath = requestedLyricsPath ?? `letras/${id}.md`;
      }
      if (lyricsContent !== null && lyricsPath && !lyricsCreated) {
        lyricsTarget = join(storageRoot, lyricsPath); await mkdir(dirname(lyricsTarget), { recursive: true });
        const temporary = `${lyricsTarget}.${randomUUID()}.tmp`; await writeFile(temporary, lyricsContent, 'utf8'); await rename(temporary, lyricsTarget); lyricsCreated = true;
      }
      const savedId = saveMusicRegistration(database, { ...parsed.data, id, letraCaminho: lyricsPath, versoes: finalizedVersions });
      return reply.code(201).send({ musica: registrationView(getMusic(database, savedId), lyricsContent, null) });
    } catch (error) {
      for (const path of promoted) await unlink(path).catch(() => undefined);
      if (lyricsCreated && lyricsTarget) await unlink(lyricsTarget).catch(() => undefined);
      if ((error as Error).message === 'Ordens duplicadas' || (error as Error).message.includes('ordens devem')) return reply.code(400).send({ error: (error as Error).message });
      throw error;
    } finally {
      await cleanupStaging(storageRoot, parsed.data.versoes, parsed.data.letraStagingId);
    }
  });
  app.put('/api/v1/musicas/:id', async (request, reply) => {
    const id = (request.params as { id: string }).id;
    const parsed = musicRegistrationSchema.safeParse({ ...(request.body as object), id });
    if (!parsed.success) throw badRequest(messageForValidation(parsed.error));
    const previous = getMusic(database, id);
    if (!previous) return reply.code(404).send({ error: 'Não encontrada' });
    const versions = parsed.data.versoes.map((version) => ({ ...version, id: version.id ?? randomUUID() }));
    const promoted: string[] = [];
    const storedPreviousLyricsPath = lyricsRelativePath(previous.letra_caminho);
    const previousLyricsPath = storedPreviousLyricsPath && existsSync(join(storageRoot, storedPreviousLyricsPath)) ? storedPreviousLyricsPath : null;
    const previousLyrics = previousLyricsPath ? join(storageRoot, previousLyricsPath) : null;
    const previousLyricsBytes = previousLyrics && existsSync(previousLyrics) ? await readFile(previousLyrics) : null;
    let lyricsTarget: string | null = null;
    let lyricsChanged = false;
    let lyricsContent: string | null = null;
    try {
      const finalizedVersions = [];
      for (const version of versions) {
        let reference = version.referencia;
        if (version.stagingId) {
          const extension = [...(registrationUploadExtensions[version.tipo] ?? [])].find((candidate) => existsSync(join(storageRoot, '.staging', `${version.stagingId}${candidate}`)));
          if (!extension) throw badRequest('Upload staged não encontrado');
          const folder = version.tipo === 'audio' ? 'musicas' : 'videos'; const target = join(storageRoot, folder, `${id}-${version.id}-${randomUUID()}${extension}`);
          await mkdir(dirname(target), { recursive: true }); await rename(join(storageRoot, '.staging', `${version.stagingId}${extension}`), target); promoted.push(target); reference = `${folder}/${basename(target)}`;
        } else if (version.tipo !== 'youtube') localRegistrationReference(storageRoot, version.tipo, version.referencia);
        finalizedVersions.push({ ...version, referencia: reference });
      }
      let lyricsPath: string | null = null;
      if (parsed.data.letraStagingId) {
        const promotedLyrics = await promoteLyricsStaging(storageRoot, id, parsed.data.letraStagingId);
        lyricsContent = promotedLyrics.content; lyricsTarget = promotedLyrics.target; lyricsPath = promotedLyrics.path; lyricsChanged = true;
      } else if (typeof parsed.data.letraMarkdown === 'string' && parsed.data.letraMarkdown.length > 0) lyricsContent = parsed.data.letraMarkdown;
      const hasLyricsContent = lyricsContent !== null;
      if (hasLyricsContent && !lyricsPath) lyricsPath = `letras/${id}-${randomUUID()}.md`;
      if (!hasLyricsContent) lyricsPath = parsed.data.letraMarkdown === null || parsed.data.letraMarkdown === '' ? null : previousLyricsPath;
      if (hasLyricsContent && lyricsPath) {
        if (!lyricsTarget) { lyricsTarget = join(storageRoot, lyricsPath); await mkdir(dirname(lyricsTarget), { recursive: true }); const temporary = `${lyricsTarget}.${randomUUID()}.tmp`; await writeFile(temporary, lyricsContent as string, 'utf8'); await rename(temporary, lyricsTarget); }
      }
      const savedId = saveMusicRegistration(database, { ...parsed.data, id, letraCaminho: lyricsPath, versoes: finalizedVersions });
      const savedLyricsPath = lyricsRelativePath(getMusic(database, savedId).letra_caminho);
      const savedLyrics = savedLyricsPath && existsSync(join(storageRoot, savedLyricsPath)) ? await readFile(join(storageRoot, savedLyricsPath), 'utf8') : null;
      return reply.code(200).send({ musica: registrationView(getMusic(database, savedId), savedLyrics, null) });
    } catch (error) {
      for (const path of promoted) await unlink(path).catch(() => undefined);
      if (lyricsChanged && lyricsTarget) {
        if (lyricsTarget === previousLyrics && previousLyricsBytes) await writeFile(lyricsTarget, previousLyricsBytes);
        else await unlink(lyricsTarget).catch(() => undefined);
      }
      if ((error as Error).message === 'Ordens duplicadas' || (error as Error).message.includes('ordens devem')) return reply.code(400).send({ error: (error as Error).message });
      throw error;
    } finally { await cleanupStaging(storageRoot, parsed.data.versoes, parsed.data.letraStagingId); }
  });
  app.delete('/api/v1/musicas/:id', async (request, reply) => {
    const id = (request.params as { id: string }).id;
    const artifacts = getMusicRegistrationArtifacts(database, id);
    if (!artifacts) return reply.code(404).send({ error: 'Não encontrada' });
    if (artifacts.liveLinks.length) return reply.code(409).send({ error: 'A música está vinculada a uma live e não pode ser excluída sem alterar a live.' });
    if (artifacts.sharedReferences.length) return reply.code(409).send({ error: 'Há arquivos compartilhados por outra música; a exclusão foi cancelada.', referenciasCompartilhadas: artifacts.sharedReferences });
    const quarantine = join(storageRoot, 'quarentena', `musica-${id}-${randomUUID()}`);
    const moved: Array<{ from: string; to: string }> = [];
    let committed = false;
    try {
      for (const artifact of artifacts.localReferences) {
        const source = artifact.kind === 'lyrics' ? join(storageRoot, lyricsRelativePath(artifact.reference) as string) : localRegistrationReference(storageRoot, artifact.kind, artifact.reference);
        if (!existsSync(source)) continue;
        const target = join(quarantine, artifact.kind, basename(source)); await mkdir(dirname(target), { recursive: true }); await rename(source, target); moved.push({ from: source, to: target });
      }
      removeMusicRegistration(database, id);
      committed = true;
      await rm(quarantine, { recursive: true, force: true });
      return reply.code(200).send({ removidos: moved.map(({ from }) => from.replace(storageRoot, '').replace(/\\/g, '/')) });
    } catch (error) {
      if (committed) throw Object.assign(new Error(`Música excluída, mas a quarentena não pôde ser apagada: ${quarantine}`), { statusCode: 500 });
      for (const item of moved.reverse()) { await mkdir(dirname(item.from), { recursive: true }); await rename(item.to, item.from).catch(() => undefined); }
      throw error;
    }
  });
  app.get('/api/v1/musicas', async (request) => {
    const query = { ...(request.query as Record<string, unknown>) };
    if (query.status !== undefined) { query.statusV1 = query.status; delete query.status; }
    return { musicas: listMusic(database, query).map(catalogView) };
  });
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
  app.get('/api/v1/blocos', async () => ({ blocos: listBlocks(database).map(blockSummaryView) }));
  app.post('/api/v1/blocos', async (request, reply) => { const parsed=blocoSchema.safeParse(request.body); if(!parsed.success) throw badRequest(messageForValidation(parsed.error)); const id=createBlock(database,parsed.data); reply.code(201); return { bloco:blockView(getBlock(database,id)) }; });
  app.get('/api/v1/blocos/:id', async (request, reply) => { const block=getBlock(database,(request.params as {id:string}).id); return block ? { bloco:blockView(block) } : reply.code(404).send({error:'Bloco não encontrado'}); });
  app.patch('/api/v1/blocos/:id', async (request, reply) => { const parsed=blocoPatchSchema.safeParse(request.body); if(!parsed.success) throw badRequest(messageForValidation(parsed.error)); const block=updateBlock(database,(request.params as {id:string}).id,parsed.data); return block ? { bloco:blockView(block) } : reply.code(404).send({error:'Bloco não encontrado'}); });
  app.delete('/api/v1/blocos/:id', async (request, reply) => removeBlock(database,(request.params as {id:string}).id) ? reply.code(204).send() : reply.code(404).send({error:'Bloco não encontrado'}));
  app.get('/api/v1/blocos/:id/opcoes-musicas', async (request, reply) => { const params=request.params as {id:string}; const query=request.query as {q?:string}; const options=listBlockMusicOptions(database,params.id,query.q ?? ''); return options ? { musicas:options.map(blockMusicOptionView) } : reply.code(404).send({error:'Bloco não encontrado'}); });
  app.post('/api/v1/blocos/:id/musicas', async (request, reply) => { const parsed=blocoMusicSchema.safeParse(request.body); if(!parsed.success) throw badRequest(messageForValidation(parsed.error)); try { const block=addBlockMusic(database,(request.params as {id:string}).id,parsed.data.musicaId); reply.code(201); return { bloco:blockView(block) }; } catch(error) { const message=(error as Error).message; const status=message.includes('não encontrado') ? 404 : 409; return reply.code(status).send({error:message}); } });
  app.delete('/api/v1/blocos/:id/musicas/:musicaId', async (request, reply) => removeBlockMusic(database,(request.params as {id:string}).id,(request.params as {musicaId:string}).musicaId) ? reply.code(204).send() : reply.code(404).send({error:'Vínculo não encontrado'}));
  app.put('/api/v1/blocos/:id/musicas/ordem', async (request, reply) => { const parsed=orderSchema.safeParse(request.body); if(!parsed.success) throw badRequest(messageForValidation(parsed.error)); try { return { musicas:reorderBlockMusic(database,(request.params as {id:string}).id,parsed.data.ids).map(blockMusicView) }; } catch(error) { return reply.code(400).send({error:(error as Error).message}); } });
  app.get('/api/v1/live-drafts', async () => ({ rascunhos:listLiveDrafts(database) }));
  app.post('/api/v1/live-drafts/generate', async (request, reply) => { const parsed=liveDraftGenerateSchema.safeParse(request.body ?? {}); if(!parsed.success) throw badRequest(messageForValidation(parsed.error)); try { const generated=generateLiveDraft(database,storageRoot,parsed.data); reply.code(201); return {rascunho:generated.draft,geracao:generated.metadata}; } catch(error) { return reply.code(409).send({error:(error as Error).message}); } });
  app.post('/api/v1/live-drafts', async (request, reply) => { const body=(request.body ?? {}) as {nome?:string}; const id=createLiveDraft(database,body.nome ? {nome:body.nome} : {}); reply.code(201); return { rascunho:getLiveDraft(database,id,storageRoot) }; });
  app.get('/api/v1/live-drafts/:id', async (request, reply) => { const draft=getLiveDraft(database,(request.params as {id:string}).id,storageRoot); return draft?{rascunho:draft}:reply.code(404).send({error:'Rascunho não encontrado'}); });
  app.put('/api/v1/live-drafts/:id', async (request, reply) => { const parsed=liveDraftSchema.safeParse({...((request.body ?? {}) as Record<string, unknown>),id:(request.params as {id:string}).id}); if(!parsed.success) throw badRequest(messageForValidation(parsed.error)); try { const draft=updateLiveDraft(database,(request.params as {id:string}).id,parsed.data,storageRoot); return draft?{rascunho:draft}:reply.code(404).send({error:'Rascunho não encontrado'}); } catch(error) { return reply.code(409).send({error:(error as Error).message}); } });
  app.delete('/api/v1/live-drafts/:id', async (request, reply) => removeLiveDraft(database,(request.params as {id:string}).id)?reply.code(204).send():reply.code(404).send({error:'Rascunho não encontrado'}));
  app.get('/api/lives', async () => ({ lives: listLives(database) }));
  app.post('/api/lives', async (request, reply) => { const parsed=liveSchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error)); const id=createLive(database,parsed.data);reply.code(201);return {live:getLive(database,id)}; });
  app.get('/api/lives/:id', async (request, reply) => { const live=getLive(database,(request.params as {id:string}).id);return live?{live}:reply.code(404).send({error:'Não encontrada'}); });
  app.patch('/api/lives/:id', async (request, reply) => {const parsed=livePatchSchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error));const live=updateLive(database,(request.params as {id:string}).id,parsed.data);return live?{live}:reply.code(404).send({error:'Não encontrada'});});
  app.post('/api/lives/:id/fechar', async (request,reply)=>{try{return {live:closeLive(database,(request.params as {id:string}).id)};}catch(error){return reply.code((error as Error).message==='Live não encontrada'?404:409).send({error:(error as Error).message});}});
  app.post('/api/lives/:id/duplicar', async (request,reply)=>{try{reply.code(201);return duplicateLive(database,(request.params as {id:string}).id,request.body ?? {});}catch(error){return reply.code((error as Error).message==='Live não encontrada'?404:409).send({error:(error as Error).message});}});
  app.delete('/api/lives/:id', async (request, reply) => removeLive(database,(request.params as {id:string}).id)?reply.code(204).send():reply.code(404).send({error:'Não encontrada'}));
  app.post('/api/lives/:id/itens', async (request, reply) => {const parsed=liveItemSchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error));try{const id=(request.params as {id:string}).id,item=addLiveItem(database,id,parsed.data);reply.code(201);return {item:getLive(database,id)?.itens.find((x: { id: string })=>x.id===item)};}catch(error){return reply.code(409).send({error:(error as Error).message});}});
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
  const actionAlias = async (request: any, reply: any, action: string) => { const body={...(request.body ?? {}),acao:action,idempotencyKey:(request.body ?? {}).idempotencyKey ?? randomUUID()}; const parsed=execucaoActionSchema.safeParse(body); if(!parsed.success)throw badRequest(messageForValidation(parsed.error)); try{return changeExecution(database,request.params.id,request.params.itemId,parsed.data);}catch(error){return reply.code((error as Error).message==='Item não encontrado'?404:409).send({error:(error as Error).message});} };
  const closeRepertoire = async (request: any, reply: any) => { try { return { repertorio: closeLive(database,request.params.id) }; } catch (error) { const message=(error as Error).message; return reply.code(message==='Live não encontrada'?404:409).send({error:message}); } };
  const duplicateRepertoire = async (request: any, reply: any) => { try { reply.code(201); return duplicateLive(database,request.params.id,request.body ?? {}); } catch (error) { const message=(error as Error).message; return reply.code(message==='Live não encontrada'?404:409).send({error:message}); } };
  app.post('/api/repertorios/:id/fechar', closeRepertoire);
  app.post('/api/repertorios/:id/duplicar', duplicateRepertoire);
  app.post('/api/repertorios/:id/executar', async (request:any,reply:any) => { const parsed=idempotencySchema.safeParse(request.body); if(!parsed.success)throw badRequest(messageForValidation(parsed.error)); try{return startExecution(database,request.params.id,parsed.data.idempotencyKey);}catch(error){return reply.code((error as Error).message==='Live não encontrada'?404:409).send({error:(error as Error).message});} });
  app.get('/api/repertorios/:id/opcoes-musicas', async (request:any,reply:any) => { const live=getLive(database,request.params.id); if(!live)return reply.code(404).send({error:'Repertório não encontrado'}); const used=new Set(live.itens.map((item:any)=>item.musica_id)); const q=String(request.query?.q ?? '').trim().toLowerCase(); return {musicas:listMusic(database,{activeOnly:true,q}).filter((song:any)=>!used.has(song.id)).map((song:any)=>({id:song.id,titulo:song.titulo,artista:song.artista,versoes:song.fontes}))}; });
  app.post('/api/execucoes/:id/adicoes', async (request:any,reply:any) => { const parsed=liveItemSchema.safeParse(request.body); if(!parsed.success)throw badRequest(messageForValidation(parsed.error)); try { const itemId=addLiveItem(database,request.params.id,parsed.data); reply.code(201); return {item:getLive(database,request.params.id)?.itens.find((item:any)=>item.id===itemId)}; } catch(error) { return reply.code(409).send({error:(error as Error).message}); } });
  app.post('/api/execucoes/:id/reordenar', async (request:any,reply:any) => { const parsed=orderSchema.safeParse(request.body); if(!parsed.success)throw badRequest(messageForValidation(parsed.error)); try{return {itens:reorderLiveItems(database,request.params.id,parsed.data.ids)};}catch(error){return reply.code(409).send({error:(error as Error).message});} });
  app.post('/api/execucoes/:id/itens/:itemId/play', async (request:any,reply:any) => actionAlias(request,reply,'play'));
  app.post('/api/execucoes/:id/itens/:itemId/marcar-tocada', async (request:any,reply:any) => actionAlias(request,reply,'tocada'));
  app.post('/api/execucoes/:id/itens/:itemId/pular', async (request:any,reply:any) => actionAlias(request,reply,'pulada'));
  app.post('/api/execucoes/:id/itens/:itemId/desfazer-tocada', async (request:any,reply:any) => actionAlias(request,reply,'desfazer_tocada'));
  app.post('/api/execucoes/:id/encerrar', async (request:any,reply:any) => { const parsed=idempotencySchema.safeParse(request.body);if(!parsed.success)throw badRequest(messageForValidation(parsed.error));try{return endExecution(database,request.params.id,parsed.data.idempotencyKey);}catch(error){return reply.code((error as Error).message==='Live não encontrada'?404:409).send({error:(error as Error).message});} });
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
  app.get('/legacy', async (_request, reply) => sendLegacyConsole(reply));
  app.get('/legacy/*', async (_request, reply) => reply.code(404).send({ error: 'Página legada não encontrada' }));
  app.get('/v1', async (_request, reply) => sendV1(reply));
  app.get('/v1/*', async (request, reply) => sendV1(reply, request.url.split('?')[0] ?? '/v1'));
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
