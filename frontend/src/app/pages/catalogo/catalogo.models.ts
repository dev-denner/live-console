export type MusicSourceType = 'youtube' | 'audio' | 'video' | string;

export interface CatalogSource {
  id: string;
  nome: string;
  tipo: MusicSourceType;
  referencia: string;
  principal: boolean;
  ordem: number;
  duracao: number | null;
  abertura?: boolean;
}

export interface MusicVersionDraft { id?: string; nome: string; ordem: number; tipo: 'youtube' | 'audio' | 'video'; referencia: string; referenciaRelativa?: string; stagingId?: string; duracao: number | null; abertura: boolean; }
export interface MusicRegistration { id?: string; titulo: string; artista: string; genero: string | null; origem: string | null; observacoes: string | null; autoral: boolean; ativo: boolean; xEmLives: number; letraMarkdown: string | null; letraCaminho?: string | null; letraAviso?: string | null; versoes: MusicVersionDraft[]; }

export interface CatalogMusic {
  id: string;
  artista: string;
  titulo: string;
  autoral: boolean;
  ativo: boolean;
  xEmLives: number;
  versoes: MusicVersionDraft[];
}

export interface CatalogFilters {
  q?: string;
  ativo?: boolean | '';
  autoral?: boolean | '';
}

export interface CatalogResponse {
  musicas: CatalogMusic[];
}
