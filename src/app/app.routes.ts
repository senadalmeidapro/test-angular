import { Routes } from '@angular/router';
import { TaskStore } from './core/services/task-store';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    title: 'Dashboard — Angular Lab',
    loadComponent: () =>
      import('./features/dashboard/dashboard-page').then((module) => module.DashboardPage),
  },
  {
    path: 'projects/:projectId',
    title: 'Projet — Angular Lab',
    providers: [TaskStore],
    loadComponent: () =>
      import('./features/projects/project-page').then((module) => module.ProjectPage),
  },
  {
    path: '**',
    title: 'Page introuvable — Angular Lab',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((module) => module.NotFoundPage),
  },
];
