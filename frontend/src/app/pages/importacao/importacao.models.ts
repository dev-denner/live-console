export interface ImportReport {
  novas: number[];
  atualizaveis: number[];
  identicas: number[];
  conflitantes: Array<{ index: number; reason: string }>;
  rejeitadas: Array<{ index: number | null; errors: string[] }>;
  referenciasNovas: number;
  referenciasExistentes: number;
  versoesNovas: number;
  versoesAtualizadas: number;
  versoesExistentes: number;
  applied?: boolean;
  created?: number;
  updatedCount?: number;
}

export interface ImportResponse { relatorio: ImportReport; }
