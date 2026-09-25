import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TaskStore } from './task-store';
import { LAB_API_URL } from '../api/lab-api.tokens';
import { makeCreateTaskRequest, makeTask, TASKS } from '../../testing/test-data';

describe('TaskStore', () => {
  let store: TaskStore;
  let http: HttpTestingController;

// [Angular Test — `TestBed`] `TestBed.configureTestingModule`
// Contexte : déclarer le store, le client HTTP et son adaptateur de test.
// Objectif : construire un injecteur isolé pour les scénarios de tâches.
// Justification : contrôler les dépendances et éviter les effets entre tests.

// [Angular HTTP — Injection] `provideHttpClient`
// Contexte : fournir l’implémentation Angular utilisée par `TaskStore`.
// Objectif : tester le chemin réel de création des requêtes.
// Justification : conserver le contrat HTTP du service avant de le simuler.

// [Angular HTTP — Test] `provideHttpClientTesting`
// Contexte : installer le contrôleur backend qui remplacera les réponses réseau.
// Objectif : observer et compléter chaque requête du store.
// Justification : rendre les transitions d’état reproductibles.

// [Angular Test — `TestBed.inject`] `inject`
// Contexte : résoudre le store et le contrôleur depuis le même injecteur.
// Objectif : contrôler à la fois l’état du store et ses requêtes.
// Justification : garantir que le service testé utilise bien les dépendances du scénario.

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LAB_API_URL, useValue: '/api' },
      ],
    });
    store = TestBed.inject(TaskStore);
    http = TestBed.inject(HttpTestingController);
  });

// [Angular HTTP — Vérification] `HttpTestingController.verify`
// Contexte : clôturer le scénario après les assertions sur les requêtes.
// Objectif : détecter toute requête attendue mais non consommée ou restante.
// Justification : garantir qu’aucune dépendance HTTP ne fuit hors du test.

  afterEach(() => http.verify());

  it('charge les tâches du projet actif', () => {
    store.loadTasks('project-portal');
    expect(store.loadState()).toBe('loading');
    expect(store.activeProjectId()).toBe('project-portal');

    // [Angular HTTP — Attente] `HttpTestingController.expectOne`
    // Contexte : sélectionner la requête de chargement des tâches du projet.
    // Objectif : contrôler précisément l’URL déclenchée par le store.
    // Justification : rendre le contrat HTTP observable et reproductible.

    // [Angular HTTP — Simulation] `HttpTestingController.flush`
    // Contexte : injecter la collection de tâches attendue par le store.
    // Objectif : faire évoluer les Signals d’état sans appel réseau.
    // Justification : contrôler la transformation de la réponse.

    http.expectOne('/api/projects/project-portal/tasks').flush(TASKS);

    expect(store.loadState()).toBe('success');
    expect(store.tasks()).toEqual(TASKS);
  });

  it('distingue un projet sans tâche', () => {
    store.loadTasks('project-portal');
    http.expectOne('/api/projects/project-portal/tasks').flush([]);

    expect(store.loadState()).toBe('empty');
  });

  it('ignore la réponse d’un projet devenu obsolète', () => {
    store.loadTasks('project-a');
    store.loadTasks('project-b');
    const secondRequest = http.expectOne('/api/projects/project-b/tasks');
    const firstRequest = http.expectOne('/api/projects/project-a/tasks');

    const projectBTask = makeTask({ id: 'task-b', projectId: 'project-b' });
    secondRequest.flush([projectBTask]);
    firstRequest.flush([makeTask({ id: 'task-a', projectId: 'project-a' })]);

    expect(store.activeProjectId()).toBe('project-b');
    expect(store.tasks()).toEqual([projectBTask]);
  });

  it('expose une erreur de chargement normalisée', () => {
    store.loadTasks('project-portal');
    http
      .expectOne('/api/projects/project-portal/tasks')
      .flush(
        { message: 'Tâches indisponibles.' },
        { status: 500, statusText: 'Internal Server Error' },
      );

    expect(store.loadState()).toBe('error');
    expect(store.errorMessage()).toBe('Tâches indisponibles.');
  });

  it('ajoute une tâche créée et libère son état pending', () => {
    store.loadTasks('project-portal');
    http.expectOne('/api/projects/project-portal/tasks').flush([TASKS[0]]);

    const createdTask = makeTask({ id: 'task-new' });
    const created: unknown[] = [];
    store
      .createTask('project-portal', makeCreateTaskRequest())
      .subscribe((task) => created.push(task));

    expect(store.pendingTaskIds().has('create:project-portal')).toBe(true);
    const request = http.expectOne('/api/projects/project-portal/tasks');
    expect(request.request.method).toBe('POST');
    request.flush(createdTask);

    expect(created).toEqual([createdTask]);
    expect(store.tasks().at(-1)).toEqual(createdTask);
    expect(store.pendingTaskIds().has('create:project-portal')).toBe(false);
  });

  it('ne supprime pas prematurely une mutation concurrente sur la même tâche', () => {
    store.loadTasks('project-portal');
    http.expectOne('/api/projects/project-portal/tasks').flush([TASKS[0]]);

    store.updateTask('task-test', { status: 'todo' }).subscribe();
    store.updateTask('task-test', { status: 'done' }).subscribe();
    expect(store.isMutating()).toBe(true);

    const requests = http.match('/api/tasks/task-test');
    expect(requests).toHaveLength(2);
    requests[0].flush(makeTask({ id: 'task-test', status: 'todo' }));
    expect(store.pendingTaskIds().has('task-test')).toBe(true);

    requests[1].flush(makeTask({ id: 'task-test', status: 'done' }));
    expect(store.pendingTaskIds().has('task-test')).toBe(false);
    expect(store.tasks()[0].status).toBe('done');
  });

  it('ne pollue pas le projet courant si une création arrive après une navigation', () => {
    store.loadTasks('project-a');
    http.expectOne('/api/projects/project-a/tasks').flush([]);

    store.createTask('project-a', makeCreateTaskRequest()).subscribe();
    store.loadTasks('project-b');
    const projectBRequest = http.expectOne('/api/projects/project-b/tasks');
    const projectBTask = makeTask({ id: 'task-b', projectId: 'project-b' });
    projectBRequest.flush([projectBTask]);

    http
      .expectOne('/api/projects/project-a/tasks')
      .flush(makeTask({ id: 'late-task', projectId: 'project-a' }));

    expect(store.activeProjectId()).toBe('project-b');
    expect(store.tasks()).toEqual([projectBTask]);
  });

  it('retire une tâche supprimée', () => {
    store.loadTasks('project-portal');
    http.expectOne('/api/projects/project-portal/tasks').flush([TASKS[0]]);
    store.deleteTask('task-test').subscribe();
    http.expectOne('/api/tasks/task-test').flush(null);

    expect(store.tasks()).toEqual([]);
    expect(store.loadState()).toBe('empty');
  });
});
