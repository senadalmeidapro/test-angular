import { routes } from './app.routes';
import { TaskStore } from './core/services/task-store';

// [Angular Router — Configuration] `Routes`, `Route.loadComponent` et `Route.providers`
// Contexte : vérifier la configuration des routes, dont le chargement différé et les providers de portée.
// Objectif : contrôler la destination racine, les pages et l’isolation du store au niveau de la route.
// Justification : garder le contrat de navigation explicite avant de tester les composants chargés.

describe('app routes', () => {
  it('redirige la racine vers le dashboard', () => {
    expect(routes[0]).toMatchObject({ path: '', pathMatch: 'full', redirectTo: 'dashboard' });
  });

  it('déclare les pages lazily chargées avec leurs titres', () => {
    const dashboardRoute = routes.find((route) => route.path === 'dashboard');
    const projectRoute = routes.find((route) => route.path === 'projects/:projectId');
    const notFoundRoute = routes.find((route) => route.path === '**');

    expect(dashboardRoute?.loadComponent).toBeTypeOf('function');
    expect(dashboardRoute?.title).toContain('Dashboard');
    expect(projectRoute?.providers).toContain(TaskStore);
    expect(projectRoute?.loadComponent).toBeTypeOf('function');
    expect(notFoundRoute?.loadComponent).toBeTypeOf('function');
  });
});
