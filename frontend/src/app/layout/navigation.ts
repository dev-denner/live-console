export interface V1NavigationItem {
  label: string;
  path: string;
}

export const v1Navigation: readonly V1NavigationItem[] = [
  { label: 'Catálogo', path: 'catalogo' },
  { label: 'Lives', path: 'lives' },
  { label: 'Blocos', path: 'blocos' },
  { label: 'Importar', path: 'importacao' },
  { label: 'Execução', path: 'execucao' }
];
