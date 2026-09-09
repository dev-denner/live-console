import { Routes } from '@angular/router';

export const routes: Routes = [{ path: '', pathMatch: 'full', redirectTo: 'shell' }, {
  path: 'shell',
  loadComponent: () => import('./shell/shell.component').then(({ ShellComponent }) => ShellComponent)
}];
