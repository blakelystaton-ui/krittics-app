import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'interests',
    loadComponent: () => import('./pages/interests/interests.page').then(m => m.InterestsPage)
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
];
