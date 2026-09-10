import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';
import { PlaceholderPageComponent } from './pages/placeholder/placeholder-page.component';
import { CatalogoPageComponent } from './pages/catalogo/catalogo-page.component';
import { BlocosPageComponent } from './pages/blocos/blocos-page.component';

export const routes: Routes = [{
  path: '',
  component: AppShellComponent,
  children: [
    { path: '', pathMatch: 'full', redirectTo: 'catalogo' },
    { path: 'catalogo', component: CatalogoPageComponent },
    { path: 'lives', component: PlaceholderPageComponent, data: { title: 'Lives', description: 'A futura área de planejamento de lives será construída em uma feature própria.' } },
    { path: 'blocos', component: BlocosPageComponent },
    { path: 'execucao', component: PlaceholderPageComponent, data: { title: 'Execução', description: 'A futura área de condução e histórico será construída em uma feature própria.' } }
  ]
}];
