import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { TestBed } from '@angular/core/testing';
import { TaskTable } from './task-table';
import { TaskStatusChange } from '../../../core/models/task.model';
import { makeTask, USERS } from '../../../testing/test-data';

registerLocaleData(localeFr);

describe('TaskTable', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TaskTable] }).compileComponents();
  });

  it('affiche la tâche, le responsable, la date et la progression', () => {
    const fixture = createTable([makeTask()], new Set());

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Préparer la démonstration');
    expect(element.textContent).toContain('Léa Martin');
    expect(element.textContent).toContain('30');
    expect(element.textContent).toContain('9');
    expect(element.textContent).toContain('50 % de la checklist');
    expect(element.querySelector('.risk-icon')?.getAttribute('aria-label')).toBe(
      'Plan de mitigation du risque',
    );
  });

  it('retombe sur un nom de responsable inconnu', () => {
    const fixture = createTable([makeTask({ assigneeId: 'missing' })], new Set());
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Non assignée');
  });

  it('émet un changement de statut depuis la checkbox', () => {
    const fixture = createTable([makeTask({ status: 'todo' })], new Set());
    const changes: TaskStatusChange[] = [];
    fixture.componentInstance.taskStatusChanged.subscribe((change) => changes.push(change));
    fixture.detectChanges();

    const checkbox = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'mat-checkbox input',
    );
    checkbox?.click();
    fixture.detectChanges();

    expect(changes).toEqual([{ taskId: 'task-test', status: 'done' }]);
  });

  it('désactive les mutations et affiche un spinner pour une tâche pending', () => {
    const fixture = createTable([makeTask()], new Set(['task-test']));
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector<HTMLInputElement>('mat-checkbox input')?.disabled).toBe(true);
    expect(element.querySelector('mat-spinner')).toBeTruthy();
  });

  it('émet une demande de rafraîchissement', () => {
    const fixture = createTable([makeTask()], new Set());
    const refresh = vi.fn();
    fixture.componentInstance.refreshRequested.subscribe(refresh);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button[aria-label="Recharger les tâches"]')
      ?.click();

    expect(refresh).toHaveBeenCalledOnce();
  });
});

function createTable(tasks: ReturnType<typeof makeTask>[], pendingTaskIds: Set<string>) {
  const fixture = TestBed.createComponent(TaskTable);
  fixture.componentRef.setInput('tasks', tasks);
  fixture.componentRef.setInput('users', USERS);
  fixture.componentRef.setInput('pendingTaskIds', pendingTaskIds);
  fixture.detectChanges();
  return fixture;
}
