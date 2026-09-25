import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { LAB_API_URL } from './core/api/lab-api.tokens';
import { routes } from './app.routes';

// [Angular — Configuration] `ApplicationConfig`
// Contexte : cette valeur décrit la configuration globale de l’application.
// Objectif : typer les providers consommés au bootstrap.
// Justification : le type standard expose le contrat attendu par Angular sans introduire de configuration implicite.
export const appConfig: ApplicationConfig = {
  providers: [
    // [Angular — Erreurs globales] `provideBrowserGlobalErrorListeners`
    // Contexte : l’application veut remonter les erreurs du navigateur pendant son exécution.
    // Objectif : installer les écouteurs Angular des erreurs globales.
    // Justification : le provider centralise ce comportement pour toute l’application.
    provideBrowserGlobalErrorListeners(),

    // [Angular — Router] `provideRouter`
    // Contexte : le routeur doit être disponible dans l’injecteur racine.
    // Objectif : enregistrer le routeur et appliquer les options de navigation fournies.
    // Justification : ce provider est le point d’entrée du routage de l’application.
    provideRouter(
      routes,

      // [Angular — Router] `withComponentInputBinding`
      // Contexte : les paramètres de route peuvent alimenter les inputs des composants.
      // Objectif : activer la liaison entre paramètres d’URL et `@Input`/`input`.
      // Justification : les composants de feature restent ainsi-less dépendants d’une lecture manuelle de l’URL.
      withComponentInputBinding(),

      // [Angular — Router] `withInMemoryScrolling`
      // Contexte : la navigation doit réinitialiser la position de défilement lors des changements de page.
      // Objectif : restaurer le haut de la page pour chaque nouvelle navigation.
      // Justification : cette option évite de conserver une position qui ne correspond plus au contenu affiché.
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),

    // [Angular — HTTP] `provideHttpClient`
    // Contexte : les stores de l’application consomment des requêtes HTTP.
    // Objectif : fournir l’implémentation Angular de `HttpClient` à l’injecteur.
    // Justification : les services peuvent ensuite injecter le client sans gérer une instance manuelle.
    provideHttpClient(),

    // [Angular — Injection] `provide` et `useValue`
    // Contexte : l’URL de l’API est une dépendance applicative configurable.
    // Objectif : associer le token `LAB_API_URL` à sa valeur concrète.
    // Justification : un provider par valeur garde les services découplés de l’environnement d’exécution.
    { provide: LAB_API_URL, useValue: '/api' },
  ],
};
