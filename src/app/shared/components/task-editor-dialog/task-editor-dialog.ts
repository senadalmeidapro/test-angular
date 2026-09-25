import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TaskEditorDialogData, TaskEditorValue } from '../../../core/models/task-editor.model';
import { TaskPriority, TaskStatus } from '../../../core/models/task.model';

interface ChecklistItemControls {
  readonly label: FormControl<string>;
  readonly done: FormControl<boolean>;
}

interface TaskEditorControls {
  readonly title: FormControl<string>;
  readonly description: FormControl<string>;
  readonly status: FormControl<TaskStatus>;
  readonly priority: FormControl<TaskPriority>;
  readonly assigneeId: FormControl<string>;
  readonly dueDate: FormControl<string>;
  readonly tags: FormArray<FormControl<string>>;
  readonly checklist: FormArray<FormGroup<ChecklistItemControls>>;
  readonly riskMitigation: FormControl<string>;
}

type FormStatus = 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';

@Component({
  selector: 'app-task-editor-dialog',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './task-editor-dialog.html',
  styleUrl: './task-editor-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskEditorDialog {
  private readonly data = inject<TaskEditorDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<TaskEditorDialog, TaskEditorValue>);

  protected readonly taskForm = new FormGroup<TaskEditorControls>(
    {
      title: new FormControl(this.data.task?.title ?? '', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          nonBlank,
        ],
      }),
      description: new FormControl(this.data.task?.description ?? '', {
        nonNullable: true,
        validators: [Validators.maxLength(500)],
      }),
      status: new FormControl<TaskStatus>(this.data.task?.status ?? 'todo', { nonNullable: true }),
      priority: new FormControl<TaskPriority>(this.data.task?.priority ?? 'medium', {
        nonNullable: true,
      }),
      assigneeId: new FormControl(this.data.task?.assigneeId ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      dueDate: new FormControl(this.data.task?.dueDate ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      tags: new FormArray(
        (this.data.task?.tags.length ? this.data.task.tags : ['']).map(
          (tag) => new FormControl(tag, { nonNullable: true }),
        ),
      ),
      checklist: new FormArray(
        (this.data.task?.checklist.length
          ? this.data.task.checklist
          : [{ label: '', done: false }]
        ).map(
          (item) =>
            new FormGroup<ChecklistItemControls>({
              label: new FormControl(item.label, {
                nonNullable: true,
                validators: [Validators.required, Validators.minLength(2)],
              }),
              done: new FormControl(item.done, { nonNullable: true }),
            }),
        ),
        { validators: [minimumChecklistItems(1)] },
      ),
      riskMitigation: new FormControl(this.data.task?.riskMitigation ?? '', { nonNullable: true }),
    },
    { validators: [highPriorityRiskValidator] },
  );

  protected readonly users = this.data.users;
  protected readonly isEditing = this.data.task !== null;
  protected readonly priority = signal<TaskPriority>(this.data.task?.priority ?? 'medium');
  protected readonly formStatus = signal<FormStatus>(this.taskForm.status);
  protected readonly lastValueChange = signal<string | null>(null);
  protected readonly lastStatusChange = signal<FormStatus>(this.taskForm.status);
  protected readonly tagControls = this.taskForm.controls.tags;
  protected readonly checklistItems = this.taskForm.controls.checklist;
  protected readonly statusOptions: readonly { value: TaskStatus; label: string }[] = [
    { value: 'todo', label: 'À faire' },
    { value: 'in-progress', label: 'En cours' },
    { value: 'done', label: 'Terminé' },
  ];
  protected readonly priorityOptions: readonly { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Basse' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Haute' },
  ];

  constructor() {
    this.taskForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.lastValueChange.set(
        new Intl.DateTimeFormat('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date()),
      );
      this.formStatus.set(this.taskForm.status);
    });

    this.taskForm.statusChanges.pipe(takeUntilDestroyed()).subscribe((status) => {
      this.formStatus.set(status);
      this.lastStatusChange.set(status);
    });

    this.taskForm.controls.priority.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((priority) => {
        this.priority.set(priority);
        this.taskForm.updateValueAndValidity();
      });
  }

  protected addTag(): void {
    this.tagControls.push(new FormControl('', { nonNullable: true }));
  }

  protected removeTag(index: number): void {
    this.tagControls.removeAt(index);
  }

  protected addChecklistItem(): void {
    this.checklistItems.push(
      new FormGroup<ChecklistItemControls>({
        label: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.minLength(2)],
        }),
        done: new FormControl(false, { nonNullable: true }),
      }),
    );
  }

  protected removeChecklistItem(index: number): void {
    this.checklistItems.removeAt(index);
  }

  protected submit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const value = this.taskForm.getRawValue();
    this.dialogRef.close({
      ...value,
      tags: [
        ...new Set(value.tags.map((tag) => tag.trim().toLocaleLowerCase('fr')).filter(Boolean)),
      ],
      checklist: value.checklist.map((item) => ({
        label: item.label.trim(),
        done: item.done,
      })),
      riskMitigation: value.riskMitigation.trim(),
    });
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}

export function nonBlank(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { required: true };
}

export function highPriorityRiskValidator(control: AbstractControl): ValidationErrors | null {
  const priority = control.get('priority')?.value;
  const riskMitigation = control.get('riskMitigation')?.value;

  if (priority === 'high' && (typeof riskMitigation !== 'string' || !riskMitigation.trim())) {
    return { riskMitigationRequired: true };
  }

  return null;
}

export function minimumChecklistItems(minimum: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const actual = Array.isArray(control.value) ? control.value.length : 0;
    return actual >= minimum ? null : { minimumItems: { required: minimum, actual } };
  };
}
