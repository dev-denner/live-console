export type DraftSourceType = 'youtube' | 'audio' | 'video';
export interface DraftVersion { id:string; nome:string; tipo:DraftSourceType; referencia:string; duracao:number|null; abertura:boolean; principal:boolean; ordem:number; }
export interface DraftSong { id:string; titulo:string; artista:string; musicaBase:string; autoral:boolean; xEmLives:number; versoes:DraftVersion[]; }
export interface DraftOpening extends DraftSong { versao:DraftVersion; }
export interface DraftBlockItem { musicaId:string; versaoId:string; titulo:string; artista:string; musicaBase:string; duracao:number|null; xEmLives:number; autoral:boolean; tipo:DraftSourceType; nomeVersao:string; }
export type DraftCompositionItem = Pick<DraftBlockItem,'musicaId'|'versaoId'|'titulo'|'artista'|'musicaBase'|'duracao'|'xEmLives'>;
export interface DraftBlock { id:string; nome:string; descricao:string|null; xEmLives:number; itens:DraftBlockItem[]; }
export interface DraftOptions { aberturas:DraftOpening[]; blocos:DraftBlock[]; musicasSemBloco:DraftSong[]; }
export interface DraftOpeningSelection { musicaId:string; versaoId:string; titulo:string; artista:string; nomeVersao:string; duracao:number|null; xEmLives:number; }
export interface DraftMusicSegment { tipo:'musica'; musicaId:string; versaoId:string; titulo:string; artista:string; musicaBase:string; duracao:number|null; xEmLives:number; }
export interface DraftBlockSegment { tipo:'bloco'; blocoId:string; nome:string; itens:DraftCompositionItem[]; }
export type DraftSegment = DraftMusicSegment | DraftBlockSegment;
export interface DraftComposition { abertura:DraftOpeningSelection|null; segmentos:DraftSegment[]; }
export interface LiveDraft { id:string; nome:string; status:'draft'; composicao:DraftComposition; opcoes:DraftOptions; geracao?:DraftGeneration|null; criadaEm:string; atualizadaEm:string; }
export interface DraftGeneration { modo:'automatico'; quantidadeReferencia:number; quantidadeGerada:number; autoraisDesejadas:number; autoraisGeradas:number; seed:string; algoritmo:string; geradoEm:string; avisos:string[]; }
