export interface HomeNavItem {
  label: string;
  path: string;
}

export const homeSidebarNavigation: readonly HomeNavItem[] = [
  { label: 'Catálogo', path: '/catalogo' },
  { label: 'Lives', path: '/lives' },
  { label: 'Blocos', path: '/blocos' },
  { label: 'Importar', path: '/importacao' },
  { label: 'Execução', path: '/execucao' },
  { label: 'Configurações', path: '/configuracoes' }
];

export interface HomeTile {
  label: string;
  description: string;
  path: string;
  queryParams?: Record<string, string>;
}

export const homeTiles: readonly HomeTile[] = [
  { label: 'Catálogo', description: 'Gerenciar músicas, versões e letras', path: '/catalogo' },
  { label: 'Blocos', description: 'Organizar blocos reutilizáveis de músicas', path: '/blocos' },
  { label: 'Lives', description: 'Planejar e gerar repertórios', path: '/lives' },
  { label: 'Execução', description: 'Conduzir uma live ao vivo', path: '/execucao' },
  { label: 'Nova música', description: 'Cadastrar uma música no catálogo', path: '/catalogo', queryParams: { novo: '1' } },
  { label: 'Configurações', description: 'Preferências do Live Console', path: '/configuracoes' }
];
