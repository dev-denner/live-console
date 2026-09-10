export type MusicSourceType = 'youtube' | 'audio' | 'video' | string;

export interface CatalogSource {
  id: string;
  nome: string;
  tipo: MusicSourceType;
  referencia: string;
  principal: boolean;
  ordem: number;
  duracao: number | null;
}

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
