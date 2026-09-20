#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  addBlockMusic,
  addLiveItem,
  addSource,
  changeExecution,
  closeLive,
  createBlock,
  createLive,
  createMusic,
  endExecution,
  getBlock,
  getLive,
  openDatabase,
  startExecution,
} from '../src/db/repositories.ts';

const ROOT = resolve(process.cwd());
const DATABASE = resolve(process.env.LIVE_CONSOLE_DB ?? join(ROOT, 'data/live-console.sqlite'));
const STORAGE = resolve(process.env.LIVE_CONSOLE_STORAGE ?? join(ROOT, 'storage'));
const MARKER = 'fixture-layout-2026';
const PREFIX = '00000000-0000-4000-8000-';
const id = (group, number) => `${PREFIX}${String(group).padStart(4, '0')}${String(number).padStart(8, '0')}`;
const musicId = number => id(1, number);
const sourceId = (musicNumber, number) => id(2, musicNumber * 10 + number);
const blockId = number => id(3, number);
const liveId = number => id(4, number);
const itemId = (liveNumber, number) => id(5, liveNumber * 100 + number);
const key = (kind, number) => `${MARKER}:${kind}:${number}:${randomUUID()}`;

const styles = [
  ['MPB', 'Bossa nova', 'Íntima', 'Acolhedor', 'morna'],
  ['Rock', 'Alternative', 'Energética', 'Elétrico', 'quente'],
  ['Pop', 'Synth-pop', 'Solar', 'Leve', 'morna'],
  ['Samba', 'Samba-rock', 'Rítmica', 'Festivo', 'quente'],
  ['Forró', 'Xote', 'Dançante', 'Nordestino', 'quente'],
  ['Sertanejo', 'Universitário', 'Narrativa', 'Estrada', 'morna'],
  ['Jazz', 'Smooth jazz', 'Sofisticada', 'Noturno', 'fria'],
  ['Blues', 'Soul blues', 'Contemplativa', 'Noturno', 'fria'],
  ['Eletrônica', 'House', 'Hipnótica', 'Neon', 'quente'],
  ['Reggae', 'Roots', 'Relaxada', 'Praia', 'morna'],
  ['Gospel', 'Worship', 'Inspiradora', 'Comunitário', 'morna'],
  ['Indie', 'Dream pop', 'Atmosférica', 'Alternativo', 'fria'],
  ['Funk', 'Funk melody', 'Vibrante', 'Rua', 'quente'],
  ['Soul', 'Neo-soul', 'Elegante', 'Noturno', 'morna'],
  ['R&B', 'Contemporary R&B', 'Sedutora', 'Urbano', 'morna'],
  ['Frevo', 'Frevo de bloco', 'Festiva', 'Carnaval', 'quente'],
  ['Instrumental', 'Cinematic', 'Ampla', 'Paisagem', 'fria'],
];

const artists = ['Aurora Sul', 'Banda Horizonte', 'Clara & Cais', 'Duo Vértice', 'Estação 12', 'Luna Reis', 'Maré Alta', 'Nômade Elétrico', 'Orquestra Janela', 'Ponto de Encontro'];
const titles = [
  'Luz de Ensaio', 'Horizonte de Neon', 'Café na Varanda', 'Sinal Verde', 'Ritmo da Feira',
  'Mapa da Estrada', 'Blue Hour', 'Chuva no Vidro', 'Circuito Aberto', 'Ilha Particular',
  'Casa Acesa', 'Quase Amanhã', 'Frequência da Rua', 'Entre Nós', 'Vento de Agosto',
  'Rua do Sol', 'Cinema em Silêncio', 'Pulso da Cidade', 'Lado B do Verão', 'Maré Cheia',
  'Depois da Chuva', 'Sexta-Feira', 'Linha do Trem', 'Valsa para Dois', 'Retrato Falado',
  'Coração Elétrico', 'Pé na Estrada', 'Noite de Domingo', 'Janela Aberta', 'Passo a Passo',
  'O Que Fica', 'Festa no Quintal', 'Tempo Bom', 'Canção Sem Pressa', 'Vira a Página',
  'Poeira Estelar', 'Lugar Comum', 'Voz e Violão', 'Perto do Mar', 'Tarde Demais',
  'Chão de Giz', 'Amanhecer', 'Fio da Navalha', 'Tons de Azul', 'Pequenas Alegrias',
  'Último Bis', 'Nova Rota', 'Quando Começar', 'Longe Daqui', 'Encore Final',
];

function mediaFile(folder, filename, content) {
  const file = join(STORAGE, folder, filename);
  mkdirSync(resolve(file, '..'), { recursive: true });
  writeFileSync(file, content);
  return `${folder}/${filename}`;
}

function resetFixture(db) {
  db.exec(`
    DELETE FROM eventos_execucao_live WHERE live_id LIKE '${id(4, 0).slice(0, 24)}%';
    DELETE FROM reconciliacoes_execucao WHERE sessao_id LIKE '${id(4, 0).slice(0, 24)}%';
    DELETE FROM execucao_itens_live WHERE live_id LIKE '${id(4, 0).slice(0, 24)}%';
    DELETE FROM execucao_lives WHERE live_id LIKE '${id(4, 0).slice(0, 24)}%';
    DELETE FROM itens_da_live WHERE live_id LIKE '${id(4, 0).slice(0, 24)}%';
    DELETE FROM montagens_da_live WHERE live_id LIKE '${id(4, 0).slice(0, 24)}%';
    DELETE FROM live_drafts WHERE id LIKE '${id(4, 0).slice(0, 24)}%';
    DELETE FROM lives WHERE id LIKE '${id(4, 0).slice(0, 24)}%';
    DELETE FROM musicas_do_bloco WHERE bloco_id LIKE '${id(3, 0).slice(0, 24)}%';
    DELETE FROM blocos WHERE id LIKE '${id(3, 0).slice(0, 24)}%';
    DELETE FROM fontes_musica WHERE musica_id LIKE '${id(1, 0).slice(0, 24)}%';
    DELETE FROM musicas WHERE id LIKE '${id(1, 0).slice(0, 24)}%';
  `);
}

function createFixtureMusic(db) {
  const songs = [];
  for (let number = 1; number <= 50; number += 1) {
    const [genre, secondary, vibe, climate, temperature] = styles[(number - 1) % styles.length];
    const lyrics = number % 2 === 0 || number <= 5
      ? mediaFile('letras', `fixture-${String(number).padStart(2, '0')}.md`, `# ${titles[number - 1]}\n\nLetra fictícia para teste de leitura e edição.\n\n> Fixture ${number} — ${genre}.\n`)
      : null;
    const music = {
      id: musicId(number), artista: artists[(number - 1) % artists.length], titulo: titles[number - 1], musicaBase: titles[number - 1],
      status: number >= 46 ? 'INATIVO_FIXTURE' : 'OK', statusAtivo: number < 46, observacoes: `${MARKER} · cadastro ${number}/50`,
      generoPrimario: genre, generoSecundario: secondary, origem: number % 4 === 0 ? 'Importação de repertório' : number % 3 === 0 ? 'Composição própria' : 'Catálogo de teste',
      autoral: number % 4 === 0, duracao: 150 + ((number * 17) % 180), vibePrincipal: vibe, vibeSecundaria: secondary,
      temperaturaDePalco: temperature, clima: climate, letra: lyrics, xEmLives: 0,
    };
    createMusic(db, music);
    const youtube = `https://www.youtube.com/watch?v=fixture-${String(number).padStart(2, '0')}`;
    const audio = mediaFile('musicas', `fixture-audio-${String(number).padStart(2, '0')}.mp3`, `DJC fixture audio placeholder ${number}\n`);
    const audioAlt = mediaFile('musicas', `fixture-audio-${String(number).padStart(2, '0')}-ensaio.mp3`, `DJC fixture alternate audio placeholder ${number}\n`);
    const video = mediaFile('videos', `fixture-video-${String(number).padStart(2, '0')}.mp4`, `DJC fixture video placeholder ${number}\n`);
    const videoAlt = mediaFile('videos', `fixture-video-${String(number).padStart(2, '0')}-performance.mp4`, `DJC fixture alternate video placeholder ${number}\n`);
    const sources = [];
    const add = (_sourceNumber, nome, tipo, referencia, abertura = false) => {
      const order = sources.length + 1;
      addSource(db, music.id, { id: sourceId(number, order), nome, tipo, referencia, ordem: order, principal: order === 1, abertura, duracao: music.duracao });
      sources.push({ tipo, referencia, abertura });
    };
    if (number % 3 === 1) add(1, 'Vídeo local', 'video', video, number <= 3);
    else if (number % 3 === 2) add(1, 'Arquivo de áudio', 'audio', audio, number <= 3);
    else add(1, 'YouTube', 'youtube', youtube, number <= 3);
    if (number % 5 === 0) add(2, 'YouTube · alternativa', 'youtube', `${youtube}-alt`);
    if (number % 4 === 0) add(2, 'Áudio · ensaio', 'audio', audioAlt);
    if (number % 7 === 0) add(3, 'Vídeo · performance', 'video', videoAlt);
    songs.push({ ...music, sources });
  }
  return songs;
}

function createFixtureBlocks(db, songs) {
  const groups = [
    ['Fixture · Groove de Abertura · 3 músicas', 'Aberturas e entradas para testar a seleção inicial.', [1, 2, 3]],
    ['Fixture · MPB Acústico · 5 músicas', 'Bloco curto para uma sessão acústica.', [4, 5, 6, 7, 8]],
    ['Fixture · Rock de Estrada · 7 músicas', 'Bloco médio com energia crescente.', [9, 10, 11, 12, 13, 14, 15]],
    ['Fixture · Brasil em Festa · 8 músicas', 'Mistura brasileira para testar blocos maiores.', [16, 17, 18, 19, 20, 21, 22, 23]],
    ['Fixture · Especial de Sábado · 10 músicas', 'Bloco no limite permitido pelo produto.', [24, 25, 26, 27, 28, 29, 30, 31, 32, 33]],
  ];
  return groups.map(([nome, descricao, numbers], index) => {
    const created = createBlock(db, { id: blockId(index + 1), nome, descricao });
    numbers.forEach(number => addBlockMusic(db, created, songs[number - 1].id));
    return created;
  });
}

function addSongToLive(db, liveNumber, order, song, opening = false, block = null) {
  const source = song.sources.find(candidate => candidate.tipo === 'youtube') ?? song.sources[0];
  return addLiveItem(db, liveId(liveNumber), {
    id: itemId(liveNumber, order), musicaId: song.id, referenciaReproducao: source.referencia, tipoReproducao: source.tipo,
    duracaoPlanejada: song.duracao, blocoId: block, ehAbertura: opening,
    observacao: opening ? 'Abertura da live fixture' : `${MARKER} · item ${order}`,
  });
}

function createHistoricalLive(db, songs, number, title, songNumbers) {
  createLive(db, { id: liveId(number), titulo: title, data: `2026-0${number}-1${number}T20:00:00.000Z`, observacoes: `${MARKER} · live realizada para teste de histórico e execução.` });
  songNumbers.forEach((songNumber, index) => addSongToLive(db, number, index + 1, songs[songNumber - 1], index === 0 && number <= 3, songNumber <= 33 ? blockId(Math.ceil(songNumber / 8)) : null));
  closeLive(db, liveId(number));
  startExecution(db, liveId(number), key('start', number));
  getLive(db, liveId(number)).itens.forEach((item, index) => {
    if (index === songNumbers.length - 1 && number % 2 === 0) {
      changeExecution(db, liveId(number), item.id, { acao: 'pulada', idempotencyKey: key('skip', item.ordem) });
      return;
    }
    changeExecution(db, liveId(number), item.id, { acao: 'play', idempotencyKey: key('play', item.ordem) });
    changeExecution(db, liveId(number), item.id, { acao: 'tocada', idempotencyKey: key('played', item.ordem) });
  });
  endExecution(db, liveId(number), key('end', number));
}

function createPlannedLives(db, songs) {
  createLive(db, { id: liveId(6), titulo: 'Fixture · Próxima live · Quinta Acústica', data: '2026-10-08T20:00:00.000Z', observacoes: `${MARKER} · rascunho para testar montagem e edição.` });
  [1, 4, 5, 6, 34].forEach((number, index) => addSongToLive(db, 6, index + 1, songs[number - 1], index === 0, number <= 8 ? blockId(number === 1 ? 1 : 2) : null));
  createLive(db, { id: liveId(7), titulo: 'Fixture · Teste · Live em preparação', data: '2026-10-15T20:00:00.000Z', observacoes: `${MARKER} · repertório fechado para testar execução futura.` });
  [2, 9, 10, 16, 40, 41].forEach((number, index) => addSongToLive(db, 7, index + 1, songs[number - 1], index === 0, number <= 23 ? blockId(Math.ceil(number / 8)) : null));
  closeLive(db, liveId(7));
}

function validate(db) {
  const musicCount = db.prepare(`SELECT COUNT(*) count FROM musicas WHERE id LIKE '${PREFIX}0001%'`).get().count;
  const blockCount = db.prepare(`SELECT COUNT(*) count FROM blocos WHERE id LIKE '${PREFIX}0003%'`).get().count;
  const liveCounts = db.prepare(`SELECT status, COUNT(*) count FROM lives WHERE id LIKE '${PREFIX}0004%' GROUP BY status ORDER BY status`).all();
  const blockSizes = db.prepare(`SELECT b.nome, COUNT(m.musica_id) count FROM blocos b LEFT JOIN musicas_do_bloco m ON m.bloco_id=b.id WHERE b.id LIKE '${PREFIX}0003%' GROUP BY b.id ORDER BY b.nome`).all();
  const duplicateMembership = db.prepare(`SELECT musica_id, COUNT(*) count FROM musicas_do_bloco WHERE bloco_id LIKE '${PREFIX}0003%' GROUP BY musica_id HAVING COUNT(*) > 1`).all();
  if (musicCount !== 50 || blockCount !== 5 || duplicateMembership.length || blockSizes.some(row => row.count > 10)) throw new Error('Validação do fixture falhou');
  return { musicas: musicCount, blocos: blockCount, tamanhosDosBlocos: blockSizes, livesPorStatus: liveCounts, musicasForaDeBlocos: db.prepare(`SELECT COUNT(*) count FROM musicas m WHERE m.id LIKE '${PREFIX}0001%' AND NOT EXISTS (SELECT 1 FROM musicas_do_bloco b WHERE b.musica_id=m.id)`).get().count };
}

const db = openDatabase(DATABASE);
try {
  resetFixture(db);
  const songs = createFixtureMusic(db);
  createFixtureBlocks(db, songs);
  createHistoricalLive(db, songs, 1, 'Fixture · Live realizada · Abertura Pop', [1, 2, 4, 7, 12, 18, 34]);
  createHistoricalLive(db, songs, 2, 'Fixture · Live realizada · Noite Brasileira', [2, 5, 6, 16, 17, 20, 35, 36]);
  createHistoricalLive(db, songs, 3, 'Fixture · Live realizada · Rock e Indie', [3, 9, 10, 11, 13, 24, 37]);
  createHistoricalLive(db, songs, 4, 'Fixture · Live realizada · Baile de Sábado', [1, 14, 15, 19, 21, 25, 28, 38]);
  createHistoricalLive(db, songs, 5, 'Fixture · Live realizada · Encerramento', [2, 22, 23, 26, 29, 31, 39, 42]);
  createPlannedLives(db, songs);
  console.log(JSON.stringify({ seeded: true, database: DATABASE, storage: STORAGE, marker: MARKER, summary: validate(db) }, null, 2));
} finally {
  db.close();
}
