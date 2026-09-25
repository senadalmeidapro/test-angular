import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TaskApi } from './task-api';
import { LAB_API_URL } from './lab-api.tokens';
import { makeCreateTaskRequest, makeTask, TASKS } from '../../testing/test-data';

describe('TaskApi', () => {
  let api: TaskApi;
  let http: HttpTestingController;

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
