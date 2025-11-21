import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'interests',
    loadComponent: () => import('./pages/interests/interests.page').then(m => m.InterestsPage)
  },
  {
    path: 'crew-demo',
    loadComponent: () => import('./pages/crew-demo/crew-demo.page').then(m => m.CrewDemoPage)
  },
  {
    path: 'crew-watch',
    loadComponent: () => import('./pages/crew-watch/crew-watch.page').then(m => m.CrewWatchPage)
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
];
