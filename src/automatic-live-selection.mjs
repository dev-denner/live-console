const hash = (value) => { let result = 2166136261; for (const char of String(value)) { result ^= char.codePointAt(0); result = Math.imul(result, 16777619); } return result >>> 0; };
const rank = (seed, id) => hash(`${seed}:${id}`);

export function chooseOpening(openings, { openingId = null, previousMusicIds = new Set(), seed = 'f8.2' } = {}) {
  if (!openings.length) return null;
  if (openingId) return openings.find((opening) => opening.id === openingId) ?? null;
  return [...openings].sort((a, b) => {
    const previous = Number(previousMusicIds.has(a.id)) - Number(previousMusicIds.has(b.id));
    return previous || a.xEmLives - b.xEmLives || rank(seed, a.id) - rank(seed, b.id) || a.id.localeCompare(b.id);
  })[0] ?? null;
}

export function generateAutomaticComposition({ openings = [], blocks = [], songs = [], openingId = null, quantidadeReferencia = 30, autoraisDesejadas = 0, previousMusicIds = new Set(), seed = 'f8.2' }) {
  const opening = chooseOpening(openings, { openingId, previousMusicIds, seed });
  const reserved = opening?.id ?? null;
  const units = [];
  const occupied = new Set(reserved ? [reserved] : []);
  for (const block of blocks) {
    // Blocks are atomic. The repository normally supplies valid blocks, but this
    // boundary also protects direct callers from selecting a partial block.
    if (!Array.isArray(block.itens) || block.itens.length === 0 || block.itens.some((item) => !item?.musicaId || !item.versaoId)) continue;
    const items = block.itens.filter((item) => item.musicaId !== reserved);
    if (!items.length) continue;
    if (new Set(items.map((item) => item.musicaId)).size !== items.length || items.some((item) => occupied.has(item.musicaId))) continue;
    items.forEach((item) => occupied.add(item.musicaId));
    units.push({ id:`bloco:${block.id}`, tipo:'bloco', itens:items, nome:block.nome, quantidade:items.length, autorais:items.filter((item) => item.autoral).length, xEmLives:items.reduce((sum, item) => sum + item.xEmLives, 0), musicaIds:items.map((item) => item.musicaId) });
  }
  for (const song of songs) {
    if (song.id === reserved) continue;
    if (!song?.id || occupied.has(song.id)) continue;
    const version = song.versoes.find((item) => item.principal) ?? song.versoes[0];
    if (!version) continue;
    occupied.add(song.id);
    units.push({ id:`musica:${song.id}`, tipo:'musica', musicaId:song.id, versaoId:version.id, titulo:song.titulo, artista:song.artista, musicaBase:song.musicaBase, duracao:version.duracao, xEmLives:song.xEmLives, quantidade:1, autorais:Number(song.autoral), musicaIds:[song.id] });
  }
  units.sort((a, b) => rank(seed, a.id) - rank(seed, b.id) || a.id.localeCompare(b.id));
  const limit = Math.max(1, Math.min(200, Number(quantidadeReferencia) || 30));
  const targetAuthors = Math.max(0, Math.min(limit, Number(autoraisDesejadas) || 0));
  const states = Array.from({ length:limit + 1 }, () => new Map());
  states[0].set(0, { units:[], xEmLives:0 });
  for (const unit of units) {
    for (let quantity = limit - unit.quantidade; quantity >= 0; quantity--) {
      for (const [authors, state] of states[quantity]) {
        const nextQuantity = quantity + unit.quantidade; const nextAuthors = authors + unit.autorais;
        if (nextQuantity > limit) continue;
        const candidate = { units:[...state.units,unit], xEmLives:state.xEmLives + unit.xEmLives };
        const current = states[nextQuantity].get(nextAuthors);
        if (!current || candidate.xEmLives < current.xEmLives) states[nextQuantity].set(nextAuthors,candidate);
      }
    }
  }
  let best = null;
  for (let quantity=limit; quantity>=0 && !best; quantity--) {
    for (const [authors,state] of states[quantity]) {
      const candidate={...state,quantity,authors,authorGap:Math.abs(authors-targetAuthors)};
      if (!best || candidate.authorGap<best.authorGap || candidate.authorGap===best.authorGap&&candidate.xEmLives<best.xEmLives) best=candidate;
    }
  }
  const selected = (best?.units ?? []).sort((a,b) => rank(seed,a.id)-rank(seed,b.id)||a.id.localeCompare(b.id));
  const segmentos=selected.map((unit) => unit.tipo==='bloco' ? {tipo:'bloco',blocoId:unit.id.slice(6),nome:unit.nome,itens:unit.itens.map(({musicaId,versaoId,titulo,artista,musicaBase,duracao,xEmLives})=>({musicaId,versaoId,titulo,artista,musicaBase,duracao,xEmLives}))} : {tipo:'musica',musicaId:unit.musicaId,versaoId:unit.versaoId,titulo:unit.titulo,artista:unit.artista,musicaBase:unit.musicaBase,duracao:unit.duracao,xEmLives:unit.xEmLives});
  const warnings=[];
  if ((best?.quantity ?? 0) < limit) warnings.push(`Foram solicitadas ${limit} músicas e geradas ${best?.quantity ?? 0}. Não foi encontrada uma combinação válida com ${limit} ou menos unidades que alcançasse a referência.`);
  if ((best?.authors ?? 0) < targetAuthors) warnings.push('A quantidade de músicas foi atingida, mas a meta de autorais não foi totalmente alcançada.');
  return { composition:{abertura:opening?{musicaId:opening.id,versaoId:opening.versao.id,titulo:opening.titulo,artista:opening.artista,nomeVersao:opening.versao.nome,duracao:opening.versao.duracao,xEmLives:opening.xEmLives}:null,segmentos}, metadata:{modo:'automatico',quantidadeReferencia:limit,quantidadeGerada:best?.quantity??0,autoraisDesejadas:targetAuthors,autoraisGeradas:best?.authors??0,seed,algoritmo:'f8.2',geradoEm:new Date().toISOString(),avisos:warnings} };
}
