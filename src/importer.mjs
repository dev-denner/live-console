import { existsSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createMusic, listMusic, getMusic, updateMusic, transaction } from './db/repositories.js';

const MUSIC_FIELDS = new Set([
  'artista', 'titulo', 'musicaBase', 'statusAtivo', 'status', 'observacoes', 'generoPrimario',
  'generoSecundario', 'xEmLives', 'origem', 'autoral', 'ativo', 'duracao',
  'vibePrincipal', 'vibeSecundaria', 'temperaturaDePalco', 'bloco', 'clima',
  'letra', 'letraCaminho'
]);
const permitted = new Set(['youtube', 'audio', 'video']);

const identity = item => `${item.artista}\u0000${item.titulo}\u0000${item.musicaBase ?? item.musica_base ?? item.titulo}`;
const sourceIdentity = source => `${source.tipo}\u0000${source.referencia}`;
const compare = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const comparableVersion = source => ({ nome: source.nome, tipo: source.tipo, referencia: source.referencia, ordem: source.ordem ?? null, duracao: source.duracao ?? null, abertura: Boolean(source.abertura) });
function versionMatch(incoming, current) {
  if (incoming.id) return incoming.id === current.id;
  if (sourceIdentity(incoming) === sourceIdentity(current)) return true;
  // The registration UI exposes the version name as its stable human key.
  // This lets an import update a version's URL/type without creating a copy.
  return Boolean(incoming.nome && current.nome === incoming.nome);
}

function normalizeVersion(version) {
  if (typeof version === 'string') return { nome: version, tipo: 'youtube', referencia: version };
  if (!version || typeof version !== 'object') return version;
  return {
    ...version,
    nome: version.nome ?? version.nomeVersao ?? version.versao,
    tipo: version.tipo ?? (version.youtube ? 'youtube' : undefined),
    referencia: version.referencia ?? version.linkOuCaminho ?? version.youtube ?? version.arquivo
  };
}

function incomingVersions(item) {
  const values = [];
  if (Array.isArray(item.fontes)) values.push(...item.fontes);
  if (Array.isArray(item.versoes)) values.push(...item.versoes);
  return values.map(normalizeVersion);
}

function normalizeMusic(item) {
  const normalized = { ...item };
  if (normalized.generoPrimario === undefined && normalized.genero !== undefined) normalized.generoPrimario = normalized.genero;
  if (normalized.letra === undefined && normalized.letraCaminho !== undefined) normalized.letra = normalized.letraCaminho;
  if (typeof normalized.status === 'boolean') {
    normalized.statusAtivo = normalized.status;
    delete normalized.status;
  } else if (normalized.statusAtivo === undefined && normalized.ativo !== undefined) {
    normalized.statusAtivo = Boolean(normalized.ativo);
  }
  normalized.fontes = incomingVersions(item);
  delete normalized.versoes;
  delete normalized.genero;
  delete normalized.letraCaminho;
  return normalized;
}

function comparableMusic(item) {
  const normalized = normalizeMusic(item);
  const comparable = {};
  for (const key of MUSIC_FIELDS) if (normalized[key] !== undefined && key !== 'xEmLives') comparable[key] = normalized[key];
  return comparable;
}

function comparableStoredMusic(item) {
  return comparableMusic({
    artista: item.artista,
    titulo: item.titulo,
    musicaBase: item.musicaBase ?? item.musica_base,
    statusAtivo: item.statusV1 ?? item.status_ativo ?? item.ativo,
    observacoes: item.observacoes,
    generoPrimario: item.generoPrimario ?? item.genero_primario,
    generoSecundario: item.generoSecundario ?? item.genero_secundario,
    origem: item.origem,
    autoral: item.autoral,
    letra: item.letra ?? item.letra_caminho,
    vibePrincipal: item.vibePrincipal ?? item.vibe_principal,
    vibeSecundaria: item.vibeSecundaria ?? item.vibe_secundaria,
    temperaturaDePalco: item.temperaturaDePalco ?? item.temperatura_de_palco,
    bloco: item.bloco,
    clima: item.clima
  });
}

function lyricReference(storageRoot, value) {
  if (typeof value !== 'string' || !value) return { path: null, found: false };
  const normalized = value.replace(/\\/g, '/');
  const candidates = [];
  if (isAbsolute(value)) {
    const relativePath = relative(storageRoot, resolve(value)).replace(/\\/g, '/');
    if (relativePath && !relativePath.startsWith('../') && !relativePath.includes(':')) candidates.push(relativePath);
  } else candidates.push(normalized);
  for (const candidate of candidates) {
    if (!candidate.startsWith('letras/') || candidate.includes('..') || candidate.startsWith('/') || candidate.includes(':')) continue;
    if (existsSync(resolve(storageRoot, candidate))) return { path: candidate, found: true };
  }
  return { path: null, found: false };
}

function sanitizeLyrics(normalized, rawItem, storageRoot, report, index) {
  const incomingLyrics = rawItem?.letraCaminho ?? rawItem?.letra_caminho ?? rawItem?.letra;
  if (incomingLyrics === undefined) return normalized;
  const resolvedLyrics = lyricReference(storageRoot, incomingLyrics);
  if (resolvedLyrics.found) normalized.letra = resolvedLyrics.path;
  else {
    normalized.letra = null;
    if (report) {
      report.letrasNaoEncontradas.push({ index, caminho: incomingLyrics });
      report.avisos.push({ index, mensagem: `Letra não encontrada: ${incomingLyrics}` });
    }
  }
  return normalized;
}

function validateVersion(source, index, errors) {
  if (!source || typeof source !== 'object' || !source.nome || !permitted.has(source.tipo) || !source.referencia) {
    errors.push(`versão ${index + 1} inválida: nome, tipo e referência são obrigatórios`);
    return;
  }
  if (source.ordem !== undefined && (!Number.isInteger(source.ordem) || source.ordem < 1)) errors.push(`versão ${index + 1}: ordem inválida`);
  if (source.duracao !== undefined && source.duracao !== null && (!Number.isInteger(source.duracao) || source.duracao < 0)) errors.push(`versão ${index + 1}: duração inválida`);
  if (source.principal !== undefined && typeof source.principal !== 'boolean') errors.push(`versão ${index + 1}: principal deve ser booleano`);
  if (source.abertura !== undefined && typeof source.abertura !== 'boolean') errors.push(`versão ${index + 1}: abertura deve ser booleano`);
}

function validate(item, index, report, storageRoot) {
  const errors = [];
  const normalized = normalizeMusic(item);
  if (!normalized || typeof normalized !== 'object' || !normalized.artista || !normalized.titulo) errors.push('artista e titulo são obrigatórios');
  if (item && item.fontes !== undefined && !Array.isArray(item.fontes)) errors.push('fontes deve ser uma lista');
  if (item && item.versoes !== undefined && !Array.isArray(item.versoes)) errors.push('versoes deve ser uma lista');

  sanitizeLyrics(normalized, item, storageRoot, report, index);

  const seen = new Set();
  normalized.fontes.forEach((source, sourceIndex) => {
    validateVersion(source, sourceIndex, errors);
    if (source && source.tipo && source.referencia) {
      const key = sourceIdentity(source);
      if (seen.has(key)) errors.push(`versão ${sourceIndex + 1}: referência duplicada no item`);
      seen.add(key);
    }
    if (typeof source?.referencia === 'string' && isAbsolute(source.referencia)) {
      report.caminhosLegados.push({ index, referencia: source.referencia });
      (existsSync(resolve(storageRoot, source.referencia)) ? report.arquivosEncontrados : report.arquivosNaoEncontrados).push(source.referencia);
    }
  });
  if (errors.length) {
    report.rejeitadas.push({ index, errors });
    return null;
  }
  return normalized;
}

function reportShape() {
  const report = {
    novas: [], atualizaveis: [], identicas: [], conflitantes: [], rejeitadas: [],
    referenciasNovas: 0, referenciasExistentes: 0, versoesNovas: 0,
    versoesAtualizadas: 0, versoesExistentes: 0, arquivosEncontrados: [],
    arquivosNaoEncontrados: [], caminhosLegados: [], letrasNaoEncontradas: [], avisos: []
  };
  report.inserted = report.novas;
  report.updated = report.atualizaveis;
  report.identical = report.identicas;
  report.rejected = report.rejeitadas;
  report.conflicts = report.conflitantes;
  report.legacyPaths = report.caminhosLegados;
  report.filesFound = report.arquivosEncontrados;
  report.filesMissing = report.arquivosNaoEncontrados;
  report.lyricsMissing = report.letrasNaoEncontradas;
  report.warnings = report.avisos;
  return report;
}

export function inspectImport(db, payload, { storageRoot = process.cwd() } = {}) {
  const report = reportShape();
  if (!payload || !Array.isArray(payload.musicas)) {
    report.rejeitadas.push({ index: null, errors: ['musicas deve ser uma lista'] });
    return report;
  }
  const existing = new Map(listMusic(db).map(song => [identity(song), song]));
  payload.musicas.forEach((item, index) => {
    const normalized = validate(item, index, report, storageRoot);
    if (!normalized) return;
    const prior = existing.get(identity(normalized));
    if (!prior) {
      report.novas.push(index);
      report.versoesNovas += normalized.fontes.length;
      return;
    }
    const oldSources = new Map(prior.fontes.map(source => [sourceIdentity(source), source]));
    const fields = comparableMusic(normalized);
    const storedFields = comparableStoredMusic(prior);
    const oldFields = Object.fromEntries(Object.keys(fields).map((key) => [key, storedFields[key]]));
    let hasNewVersion = false;
    let hasVersionUpdate = false;
    normalized.fontes.forEach(source => {
      const old = prior.fontes.find(candidate => versionMatch(source, candidate)) ?? oldSources.get(sourceIdentity(source));
      if (!old) { report.referenciasNovas++; report.versoesNovas++; hasNewVersion = true; }
      else if (compare(comparableVersion(old), comparableVersion(source))) { report.referenciasExistentes++; report.versoesExistentes++; }
      else { report.versoesAtualizadas++; hasVersionUpdate = true; }
    });
    if (compare(fields, oldFields) && !hasNewVersion && !hasVersionUpdate) report.identicas.push(index);
    else if (item.id && item.id !== prior.id) report.conflitantes.push({ index, reason: 'id não corresponde à identidade' });
    else report.atualizaveis.push(index);
  });
  return report;
}

function incomingMatches(source, current) {
  return versionMatch(source, current);
}

function mergeVersions(db, musicId, incoming, report) {
  const current = getMusic(db, musicId)?.fontes ?? [];
  const rows = current.map(source => ({ ...source, _incoming: null, _oldOrder: source.ordem }));
  const used = new Set();
  const additions = [];

  for (const source of incoming) {
    const match = rows.find(row => !used.has(row.id) && incomingMatches(source, row));
    if (match) {
      used.add(match.id);
      match._incoming = source;
    } else {
      const candidateId = source.id && !db.prepare('SELECT 1 FROM fontes_musica WHERE id=?').get(source.id) ? source.id : randomUUID();
      additions.push({
        id: candidateId, musica_id: musicId, nome: source.nome, tipo: source.tipo, referencia: source.referencia,
        principal: source.principal === true, ordem: source.ordem ?? null, duracao: source.duracao ?? null,
        abertura: source.abertura === true, _incoming: source, _oldOrder: Number.MAX_SAFE_INTEGER
      });
    }
  }

  const all = [...rows, ...additions];
  if (all.some(row => row._incoming?.ordem !== undefined)) {
    all.sort((a, b) => {
      const ao = a._incoming?.ordem ?? a.ordem ?? Number.MAX_SAFE_INTEGER;
      const bo = b._incoming?.ordem ?? b.ordem ?? Number.MAX_SAFE_INTEGER;
      return ao - bo || a._oldOrder - b._oldOrder;
    });
  }

  // Reserve temporary negative orders first so the unique order constraint
  // cannot reject a harmless update or an additive version merge.
  all.forEach((row, index) => db.prepare('UPDATE fontes_musica SET ordem=? WHERE id=? AND musica_id=?').run(-(index + 1), row.id, musicId));
  let principalId = all.find(row => row._incoming?.principal === true)?.id ?? current.find(row => row.principal)?.id ?? all[0]?.id;
  all.forEach((row, index) => {
    const patch = row._incoming;
    if (patch) {
      if (patch.principal === true) principalId = row.id;
      const principal = row.id === principalId;
      db.prepare('UPDATE fontes_musica SET nome=?,tipo=?,referencia=?,principal=?,ordem=?,duracao=?,abertura=?,atualizada_em=? WHERE id=? AND musica_id=?')
        .run(patch.nome, patch.tipo, patch.referencia, principal ? 1 : 0, index + 1, patch.duracao ?? row.duracao ?? null, (patch.abertura ?? row.abertura) ? 1 : 0, new Date().toISOString(), row.id, musicId);
    } else {
      db.prepare('UPDATE fontes_musica SET principal=?,ordem=?,atualizada_em=? WHERE id=? AND musica_id=?')
        .run(row.id === principalId ? 1 : 0, index + 1, new Date().toISOString(), row.id, musicId);
    }
  });
  for (const row of additions) {
    const source = row._incoming;
    const now = new Date().toISOString();
    db.prepare('INSERT INTO fontes_musica(id,musica_id,nome,tipo,referencia,principal,ordem,duracao,abertura,criada_em,atualizada_em) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
      .run(row.id, musicId, row.nome, row.tipo, row.referencia, row.id === principalId ? 1 : 0, all.findIndex(item => item.id === row.id) + 1, row.duracao, row.abertura ? 1 : 0, now, now);
  }
}

export function confirmImport(db, payload, options = {}) {
  const preview = inspectImport(db, payload, options);
  if (preview.rejeitadas.length && !options.partial) return { ...preview, applied: false };
  const rejected = new Set(preview.rejeitadas.map(item => item.index));
  const apply = () => {
    const report = { ...preview, applied: true, created: 0, updatedCount: 0 };
    const current = new Map(listMusic(db).map(song => [identity(song), song]));
    for (const [index, rawItem] of payload.musicas.entries()) {
      if (rejected.has(index)) continue;
      const item = sanitizeLyrics(normalizeMusic(rawItem), rawItem, options.storageRoot ?? process.cwd());
      const prior = current.get(identity(item)) ?? listMusic(db).find(song => identity(song) === identity(item));
      let id;
      if (prior) {
        id = prior.id;
        const patch = {};
        for (const [key, value] of Object.entries(item)) if (MUSIC_FIELDS.has(key) && key !== 'xEmLives' && key !== 'letraCaminho') patch[key] = value;
        if (item.letra !== undefined) patch.letra = item.letra;
        updateMusic(db, id, patch);
        report.updatedCount++;
      } else {
        const create = {};
        for (const [key, value] of Object.entries(item)) if (MUSIC_FIELDS.has(key) && key !== 'letraCaminho') create[key] = value;
        id = createMusic(db, create);
        report.created++;
        current.set(identity(item), getMusic(db, id));
      }
      mergeVersions(db, id, item.fontes, report);
    }
    return report;
  };
  return options.partial ? apply() : transaction(db, apply);
}

export { identity, sourceIdentity };
