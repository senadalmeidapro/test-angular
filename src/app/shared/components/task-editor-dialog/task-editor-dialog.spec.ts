import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  highPriorityRiskValidator,
  minimumChecklistItems,
  nonBlank,
  TaskEditorDialog,
} from './task-editor-dialog';
import { TaskEditorDialogData, TaskEditorValue } from '../../../core/models/task-editor.model';
import { makeTask, USERS } from '../../../testing/test-data';

interface DialogHarness {
  submit(): void;
  cancel(): void;
}

describe('TaskEditorDialog', () => {
  it('pré-remplit un formulaire existant et émet toutes les valeurs', () => {
    const task = makeTask({ tags: [' Angular ', 'ANGULAR', 'forms'] });
    const { fixture, close } = createDialog({
      projectId: 'project-portal',
      users: USERS,
      task,
    });
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector<HTMLInputElement>('input[formcontrolname="title"]')?.value).toBe(
      task.title,
    );
    expect(
      element.querySelector<HTMLTextAreaElement>('textarea[formcontrolname="riskMitigation"]')
        ?.value,
    ).toBe(task.riskMitigation);

    (fixture.componentInstance as unknown as DialogHarness).submit();
    expect(close).toHaveBeenCalledOnce();
    const value = close.mock.calls[0][0] as TaskEditorValue;
    expect(value).toMatchObject({
      title: task.title,
      riskMitigation: task.riskMitigation,
      tags: ['angular', 'forms'],
    });
  });

  it('empêche la création quand le formulaire initial est invalide', () => {
    const { fixture, close } = createDialog({
      projectId: 'project-portal',
      users: USERS,
      task: null,
    });
    const element = fixture.nativeElement as HTMLElement;

    (fixture.componentInstance as unknown as DialogHarness).submit();

    expect(close).not.toHaveBeenCalled();
    expect(element.textContent).toContain('INVALID');
  });

  it('refuse un titre composé uniquement d’espaces', () => {
    const { fixture } = createDialog({
      projectId: 'project-portal',
      users: USERS,
      task: makeTask(),
    });
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input[formcontrolname="title"]',
    );
    if (!input) {
      throw new Error('Champ titre introuvable.');
    }

    input.value = '   ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
        'button[type="submit"]',
      )?.disabled,
    ).toBe(true);
  });

  it('ferme sans valeur quand l’utilisateur annule', () => {
    const { fixture, close } = createDialog({
      projectId: 'project-portal',
      users: USERS,
      task: makeTask(),
    });

    (fixture.componentInstance as unknown as DialogHarness).cancel();

    expect(close).toHaveBeenCalledWith();
  });

  it('normalise les validateurs de formulaire', () => {
    expect(nonBlank(new FormControl(' valide '))).toBeNull();
    expect(nonBlank(new FormControl('   '))).toEqual({ required: true });
    expect(minimumChecklistItems(2)(new FormControl([{}]))).toEqual({
      minimumItems: { required: 2, actual: 1 },
    });
    expect(
      highPriorityRiskValidator(
        new FormGroup({
          priority: new FormControl('high'),
          riskMitigation: new FormControl(' '),
        }),
      ),
    ).toEqual({ riskMitigationRequired: true });
  });
});

function createDialog(data: TaskEditorDialogData) {
  TestBed.resetTestingModule();
  const close = vi.fn();
  TestBed.configureTestingModule({
    imports: [TaskEditorDialog],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: MatDialogRef, useValue: { close } },
    ],
  });
  const fixture = TestBed.createComponent(TaskEditorDialog);
  fixture.detectChanges();
  return { fixture, close };
}
