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

export interface MusicVersionDraft { id?: string; nome: string; ordem: number; tipo: 'youtube' | 'audio' | 'video'; referencia: string; stagingId?: string; duracao: number | null; abertura: boolean; }
export interface MusicRegistration { id?: string; titulo: string; artista: string; genero: string | null; origem: string | null; observacoes: string | null; autoral: boolean; ativo: boolean; xEmLives: number; letraMarkdown: string | null; letraCaminho?: string | null; letraAviso?: string | null; versoes: MusicVersionDraft[]; }

export interface CatalogMusic {
  id: string;
  artista: string;
  titulo: string;
  status: string | null;
  autoral: boolean;
  bloco: string | null;
  clima: string | null;
  musica_base: string | null;
  x_em_lives: number;
  fontes: CatalogSource[];
}

export interface CatalogFilters {
  q?: string;
  status?: string;
  autoral?: boolean | '';
  bloco?: string;
  clima?: string;
}

export interface CatalogResponse {
  musicas: CatalogMusic[];
}
