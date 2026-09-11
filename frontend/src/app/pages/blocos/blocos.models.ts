export interface BlockSummary {
  id: string;
  nome: string;
  descricao: string | null;
  quantidadeMusicas: number;
  criadaEm: string;
  atualizadaEm: string;
}

export interface BlockMusic {
  id: string;
  titulo: string;
  artista: string;
  status: boolean;
  autoral: boolean;
  xEmLives: number;
  ordem: number;
}

export interface Block {
  id: string;
  nome: string;
  descricao: string | null;
  criadaEm: string;
  atualizadaEm: string;
  musicas: BlockMusic[];
}

export interface BlockMusicOption {
  id: string;
  titulo: string;
  artista: string;
  status: boolean;
  autoral: boolean;
  xEmLives: number;
  disponivel: boolean;
  blocoAtualId: string | null;
  blocoAtualNome: string | null;
  motivo: string | null;
}

export interface BlockDraft { id?: string; nome: string; descricao: string | null; }
