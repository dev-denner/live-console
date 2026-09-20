import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';
import { PlaceholderPageComponent } from './pages/placeholder/placeholder-page.component';
import { HomePageComponent } from './pages/home/home-page.component';
import { CatalogoPageComponent } from './pages/catalogo/catalogo-page.component';
import { BlocosPageComponent } from './pages/blocos/blocos-page.component';
import { ImportacaoPageComponent } from './pages/importacao/importacao-page.component';
import { LiveDraftPageComponent } from './pages/lives/live-draft-page.component';
import { ExecucaoPageComponent } from './pages/execucao/execucao-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomePageComponent },
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: 'catalogo', component: CatalogoPageComponent },
      { path: 'lives', component: LiveDraftPageComponent },
      { path: 'lives/:id', component: LiveDraftPageComponent },
      { path: 'blocos', component: BlocosPageComponent },
      { path: 'importacao', component: ImportacaoPageComponent },
      { path: 'execucao', component: ExecucaoPageComponent },
      { path: 'execucao/:id', component: ExecucaoPageComponent },
      { path: 'configuracoes', component: PlaceholderPageComponent, data: { title: 'Configurações', description: 'Preferências do Live Console ainda não existem nesta fase. Esta página reserva o espaço para quando houver uma especificação aprovada.' } }
    ]
  }
];
