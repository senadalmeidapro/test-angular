import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// [Angular — Internationalisation] `registerLocaleData`
// Contexte : l’application doit prendre en charge la locale française.
// Objectif : enregistrer les données de locale utilisées par les pipes et services Angular.
// Justification : sans cet enregistrement, les formats français ne sont pas disponibles de façon fiable.

// [Angular — Démarrage] `bootstrapApplication`
// Contexte : le point d’entrée monte le composant racine avec la configuration applicative.
// Objectif : créer l’application Angular et appliquer ses providers au premier démarrage.
// Justification : cette API remplace le bootstrap modulaire et centralise l’initialisation.
registerLocaleData(localeFr);

bootstrapApplication(App, appConfig).catch((error: unknown) => console.error(error));
