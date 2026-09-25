import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProjectApi } from './project-api';
import { LAB_API_URL } from './lab-api.tokens';
import { PROJECTS } from '../../testing/test-data';

describe('ProjectApi', () => {
  let api: ProjectApi;
  let http: HttpTestingController;

// [Angular Test — `TestBed`] `TestBed.configureTestingModule`
// Contexte : déclarer les dépendances HTTP de l’API des projets.
// Objectif : fournir un injecteur propre à chaque test.
// Justification : éviter l’état global et les requêtes partagées.

// [Angular HTTP — Injection] `provideHttpClient`
// Contexte : fournir le client HTTP consommé par `ProjectApi`.
// Objectif : tester le chemin Angular de construction des requêtes.
// Justification : conserver le contrat du service avant l’interception.

// [Angular HTTP — Test] `provideHttpClientTesting`
// Contexte : remplacer le transport par le contrôleur de test.
// Objectif : vérifier précisément les appels et réponses de l’API.
// Justification : rendre les scénarios indépendants du serveur.

// [Angular Test — `TestBed.inject`] `inject`
// Contexte : injecter l’API et le contrôleur depuis le module courant.
// Objectif : contrôler le service testé et son transport avec le même injecteur.
// Justification : préserver l’isolation des dépendances.

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LAB_API_URL, useValue: '/api' },
      ],
    });
    api = TestBed.inject(ProjectApi);
    http = TestBed.inject(HttpTestingController);
  });

// [Angular HTTP — Vérification] `HttpTestingController.verify`
// Contexte : clôturer le scénario après les appels de l’API des projets.
// Objectif : vérifier qu’aucune requête ne subsiste dans le contrôleur.
// Justification : garder les tests indépendants et sans effet de bord.

  afterEach(() => http.verify());

  it('charge la collection des projets', () => {
    const projects = api.getProjects();
    const received: unknown[] = [];
    projects.subscribe((value) => received.push(value));

    // [Angular HTTP — Attente] `HttpTestingController.expectOne`
    // Contexte : sélectionner la requête émise par `ProjectApi`.
    // Objectif : contrôler l’URL et le verbe HTTP attendu.
    // Justification : rendre le contrat de l’API déterministe.

    // [Angular HTTP — Simulation] `HttpTestingController.flush`
    // Contexte : fournir la collection de projets à l’observable.
// Objectif : déclencher la résolution attendue de l’API.
// Justification : contrôler la réponse sans dépendance extérieure.

    const request = http.expectOne('/api/projects');
    expect(request.request.method).toBe('GET');
    request.flush(PROJECTS);
    expect(received).toEqual([PROJECTS]);
  });

  it('charge un projet par identifiant', () => {
    api.getProject('project-portal').subscribe();

    const request = http.expectOne('/api/projects/project-portal');
    expect(request.request.method).toBe('GET');
    request.flush(PROJECTS[0]);
  });
});
