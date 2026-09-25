import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProjectPage } from './project-page';
import { LAB_API_URL } from '../../core/api/lab-api.tokens';
import { TaskEditorDialog } from '../../shared/components/task-editor-dialog/task-editor-dialog';
import { TaskEditorValue } from '../../core/models/task-editor.model';
import { Task } from '../../core/models/task.model';
import { TaskStore } from '../../core/services/task-store';
import { makeTask, PROJECTS, TASKS, USERS } from '../../testing/test-data';

registerLocaleData(localeFr);

interface ProjectPageHarness {
  openCreateDialog(): void;
  changeTaskStatus(change: {
    readonly taskId: string;
    readonly status: 'todo' | 'in-progress' | 'done';
  }): void;
  confirmDelete(task: Task): void;
}

describe('ProjectPage', () => {
  let http: HttpTestingController;
  const dialog = { open: vi.fn() };
  const snackBar = { open: vi.fn() };

  beforeEach(() => {
    dialog.open.mockReset();
    snackBar.open.mockReset();
    TestBed.configureTestingModule({
      imports: [ProjectPage],
      providers: [
        TaskStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: LAB_API_URL, useValue: '/api' },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ projectId: 'project-portal' })) },
        },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('charge le projet, les utilisateurs et ses tâches', async () => {
    const fixture = createPage();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Chargement du projet et des tâches',
    );

    flushInitialData(http, TASKS);
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Portail client');
    expect(element.textContent).toContain('Préparer la démonstration');
    expect(element.textContent).toContain('Nouvelle tâche');
  });

  it('affiche l’erreur de chargement des tâches', async () => {
    const fixture = createPage();
    http.expectOne('/api/users').flush(USERS);
    http.expectOne('/api/projects').flush(PROJECTS);
    http
      .expectOne('/api/projects/project-portal/tasks')
      .flush(
        { message: 'Les tâches sont indisponibles.' },
        { status: 500, statusText: 'Internal Server Error' },
      );
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Impossible de charger cet espace',
    );
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Les tâches sont indisponibles.',
    );
  });

  it('distingue un projet absent de la collection', async () => {
    const fixture = createPage();
    http.expectOne('/api/users').flush(USERS);
    http
      .expectOne('/api/projects')
      .flush(PROJECTS.filter((project) => project.id !== 'project-portal'));
    http.expectOne('/api/projects/project-portal/tasks').flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Projet introuvable');
  });

  it('crée une tâche et transmet toutes les valeurs du formulaire', async () => {
    const fixture = createPage();
    flushInitialData(http, [TASKS[0]]);
    const formValue: TaskEditorValue = {
      title: 'Nouvelle tâche API',
      description: 'Description complète.',
      status: 'todo',
      priority: 'high',
      assigneeId: 'user-noe',
      dueDate: '2026-10-20',
      tags: ['api', 'test'],
      checklist: [{ label: 'Valider la réponse', done: false }],
      riskMitigation: 'Rollback préparé.',
    };
    dialog.open.mockReturnValue({ afterClosed: () => of(formValue) });

    (fixture.componentInstance as unknown as ProjectPageHarness).openCreateDialog();

    expect(dialog.open).toHaveBeenCalledWith(TaskEditorDialog, expect.any(Object));
    const request = http.expectOne('/api/projects/project-portal/tasks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(formValue);
    request.flush(
      makeTask({
        id: 'task-new',
        title: formValue.title,
        description: formValue.description,
        status: formValue.status,
        priority: formValue.priority,
        assigneeId: formValue.assigneeId,
        dueDate: formValue.dueDate,
        tags: formValue.tags,
        checklist: formValue.checklist.map((item) => ({ ...item, id: 'check-new' })),
        riskMitigation: formValue.riskMitigation,
      }),
    );
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nouvelle tâche API');
    expect(snackBar.open).toHaveBeenCalledWith('Tâche créée.', 'Fermer', expect.any(Object));
  });

  it('met à jour un statut et supprime une tâche confirmée', async () => {
    const fixture = createPage();
    flushInitialData(http, [TASKS[0]]);
    (fixture.componentInstance as unknown as ProjectPageHarness).changeTaskStatus({
      taskId: TASKS[0].id,
      status: 'done',
    });
    const updateRequest = http.expectOne(`/api/tasks/${TASKS[0].id}`);
    expect(updateRequest.request.body).toEqual({ status: 'done' });
    updateRequest.flush(makeTask({ id: TASKS[0].id, status: 'done' }));

    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    (fixture.componentInstance as unknown as ProjectPageHarness).confirmDelete(TASKS[0]);
    const deleteRequest = http.expectOne(`/api/tasks/${TASKS[0].id}`);
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain(
      'Préparer la démonstration',
    );
  });
});

function createPage() {
  const fixture = TestBed.createComponent(ProjectPage);
  fixture.detectChanges();
  return fixture;
}

function flushInitialData(http: HttpTestingController, projectTasks: readonly Task[]): void {
  http.expectOne('/api/users').flush(USERS);
  http.expectOne('/api/projects').flush(PROJECTS);
  http.expectOne('/api/projects/project-portal/tasks').flush(projectTasks);
}
