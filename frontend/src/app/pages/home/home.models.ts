export interface HomeLive {
  id: string;
  titulo: string;
  data: string | null;
  status: string;
  itens: unknown[];
}

export interface HomeMusic {
  id: string;
  titulo: string;
  artista: string;
  xEmLives: number;
}

export interface HomeDashboardData {
  lives: HomeLive[];
  musicas: HomeMusic[];
}
