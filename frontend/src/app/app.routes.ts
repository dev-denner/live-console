import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';
import { PlaceholderPageComponent } from './pages/placeholder/placeholder-page.component';

export const routes: Routes = [{
  path: '',
  component: AppShellComponent,
  children: [
    { path: '', pathMatch: 'full', redirectTo: 'catalogo' },
    { path: 'catalogo', component: PlaceholderPageComponent, data: { title: 'Catálogo', description: 'A futura área de músicas e fontes será construída em uma feature própria.' } },
    { path: 'lives', component: PlaceholderPageComponent, data: { title: 'Lives', description: 'A futura área de planejamento de lives será construída em uma feature própria.' } },
    { path: 'blocos', component: PlaceholderPageComponent, data: { title: 'Blocos', description: 'A futura área de blocos reutilizáveis será construída em uma feature própria.' } },
    { path: 'execucao', component: PlaceholderPageComponent, data: { title: 'Execução', description: 'A futura área de condução e histórico será construída em uma feature própria.' } }
  ]
}];
