import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TaskApi } from './task-api';
import { LAB_API_URL } from './lab-api.tokens';
import { makeCreateTaskRequest, makeTask, TASKS } from '../../testing/test-data';

describe('TaskApi', () => {
  let api: TaskApi;
  let http: HttpTestingController;

// [Angular Test — `TestBed`] `TestBed.configureTestingModule`
// Contexte : déclarer le client HTTP de l’API des tâches et son double de test.
// Objectif : isoler les providers du service.
// Justification : rendre les méthodes et verbes HTTP déterministes.

// [Angular HTTP — Injection] `provideHttpClient`
// Contexte : fournir l’implémentation Angular utilisée par `TaskApi`.
// Objectif : observer la construction réelle des requêtes.
// Justification : ne pas remplacer le client au niveau du code métier.

// [Angular HTTP — Test] `provideHttpClientTesting`
// Contexte : brancher le contrôleur qui remplace le réseau.
// Objectif : inspecter puis compléter les appels de l’API.
// Justification : contrôler les réponses sans dépendance extérieure.

// [Angular Test — `TestBed.inject`] `inject`
// Contexte : résoudre l’API et son contrôleur depuis l’injecteur du test.
// Objectif : faire exercer le même graphe de dépendances qu’en production.
// Justification : garantir l’isolation du scénario.

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LAB_API_URL, useValue: '/api' },
      ],
    });
    api = TestBed.inject(TaskApi);
    http = TestBed.inject(HttpTestingController);
  });

// [Angular HTTP — Vérification] `HttpTestingController.verify`
// Contexte : clôturer le scénario après l’appel de l’API des tâches.
// Objectif : détecter toute requête non consommée par l’API.
// Justification : garantir que chaque test contrôle son transport.

  afterEach(() => http.verify());

  it('charge les tâches d’un projet', () => {
    api.getTasks('project-portal').subscribe();

    const request = http.expectOne('/api/projects/project-portal/tasks');
    expect(request.request.method).toBe('GET');
    request.flush(TASKS);
  });

  it('crée une tâche avec le projet dans le chemin', () => {
    const payload = makeCreateTaskRequest();
    api.createTask('project-portal', payload).subscribe();

    const request = http.expectOne('/api/projects/project-portal/tasks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(makeTask());
  });

  it('met à jour une tâche par PATCH', () => {
    api.updateTask('task-test', { status: 'done' }).subscribe();

    const request = http.expectOne('/api/tasks/task-test');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'done' });
    request.flush(makeTask({ status: 'done' }));
  });

  it('supprime une tâche par DELETE', () => {
    api.deleteTask('task-test').subscribe();

    const request = http.expectOne('/api/tasks/task-test');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
