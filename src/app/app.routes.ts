import { Routes } from '@angular/router';
import { TaskStore } from './core/services/task-store';

// [Angular — Router] `Routes`
// Contexte : la table décrit les URL de l’application et les composants associés.
// Objectif : donner au routeur une configuration fortement typée.
// Justification : le type standard permet de valider la structure des routes au niveau de l’application.
export const routes: Routes = [
  // [Angular — Router] `redirectTo`
  // Contexte : la racine ne correspond à aucune page de travail.
  // Objectif : rediriger l’URL racine vers le dashboard.
  // Justification : une redirection évite d’afficher un écran intermédiaire pour la route par défaut.
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },

  // [Angular — Router] `title`
  // Contexte : le dashboard possède un titre de document spécifique.
  // Objectif : associer ce titre à sa route.
  // Justification : le routeur peut ainsi l’appliquer automatiquement à la navigation.

  // [Angular — Router] `loadComponent`
  // Contexte : la page dashboard est une feature séparée du shell.
  // Objectif : charger son composant à la demande avec un import dynamique.
  // Justification : le code de la feature n’est pas chargé dans le premier chargement de l’application.
  {
    path: 'dashboard',
    title: 'Dashboard — Angular Lab',
    loadComponent: () =>
      import('./features/dashboard/dashboard-page').then((module) => module.DashboardPage),
  },

  // [Angular — Router] `title`
  // Contexte : la page projet varie selon l’identifiant présent dans l’URL.
  // Objectif : fournir un titre de document commun à cette feature.
  // Justification : le titre reste cohérent sans dupliquer sa définition dans le composant.

  // [Angular — Router] `providers`
  // Contexte : `TaskStore` doit partager son état avec la page projet qui l’utilise.
  // Objectif : fournir cette dépendance au niveau de la route.
  // Justification : le scope de route isole l’état des tâches de cette page des autres workspaces.

  // [Angular — Router] `loadComponent`
  // Contexte : la page projet est une feature chargable séparément.
  // Objectif : charger `ProjectPage` uniquement lorsque son URL est visitée.
  // Justification : le chargement différé réduit le coût initial du dashboard.
  {
    path: 'projects/:projectId',
    title: 'Projet — Angular Lab',
    providers: [TaskStore],
    loadComponent: () =>
      import('./features/projects/project-page').then((module) => module.ProjectPage),
  },

  // [Angular — Router] `title`
  // Contexte : la route générique sert d’écran de secours pour les URL inconnues.
  // Objectif : définir le titre de la page 404.
  // Justification : le routeur conserve ainsi une métadonne cohérente même pour une erreur de navigation.

  // [Angular — Router] `loadComponent`
  // Contexte : aucune route connue ne correspond à certaines URL.
  // Objectif : charger la page `NotFoundPage` comme composant de secours.
  // Justification : le motif générique garantit une issue lisible pour toute navigation non reconnue.
  {
    path: '**',
    title: 'Page introuvable — Angular Lab',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((module) => module.NotFoundPage),
  },
];
