import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
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

/** Contrôles du sous-formulaire représentant une étape de checklist. */
interface ChecklistItemControls {
  readonly label: FormControl<string>;
  readonly done: FormControl<boolean>;
}

/** Structure stricte du `FormGroup` racine, y compris ses tableaux dynamiques. */
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

/**
 * Dialogue de saisie piloté par Reactive Forms.
 *
 * Le component est standalone : `imports` déclare les directives et modules
 * Material utilisés par son template. `OnPush` convient car les lectures du
 * template passent par le FormGroup ou des Signals, sources explicitement
 * invalidées lorsqu'elles changent.
 */
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
  // `inject` résout le jeton dans le contexte de la classe. Cette forme évite un
  // constructeur uniquement destiné à l'injection et conserve un ordre de lecture explicite.
  private readonly formBuilder = inject(FormBuilder);
  private readonly data = inject<TaskEditorDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<TaskEditorDialog, TaskEditorValue>);

  // `nonNullable.group` construit ici le `FormGroup` racine tout en donnant à
  // TypeScript le type exact de chaque contrôle. `FormBuilder` sert de factory :
  // il évite de répéter `new FormControl` et centralise les options de création.
  protected readonly taskForm = this.formBuilder.nonNullable.group<TaskEditorControls>(
    {
      title: this.formBuilder.nonNullable.control(this.data.task?.title ?? '', {
        validators: [
          Validators.required,
          Validators.maxLength(100),
          trimmedMinimumLength(3),
          nonBlank,
        ],
      }),
      description: this.formBuilder.nonNullable.control(this.data.task?.description ?? '', {
        validators: [Validators.maxLength(500)],
      }),
      status: this.formBuilder.nonNullable.control<TaskStatus>(this.data.task?.status ?? 'todo'),
      priority: this.formBuilder.nonNullable.control<TaskPriority>(
        this.data.task?.priority ?? 'medium',
      ),
      assigneeId: this.formBuilder.nonNullable.control(this.data.task?.assigneeId ?? '', {
        validators: [Validators.required],
      }),
      dueDate: this.formBuilder.nonNullable.control(this.data.task?.dueDate ?? '', {
        validators: [Validators.required, validIsoDate],
      }),
      // Une liste variable nécessite un `FormArray`. `push` et `removeAt` font
      // recalculer sa valeur et la validity du groupe parent.
      tags: this.formBuilder.array<FormControl<string>>(
        (this.data.task?.tags.length ? this.data.task.tags : ['']).map((tag) =>
          this.formBuilder.nonNullable.control(tag),
        ),
      ),
      // Chaque élément de checklist possède deux contrôles liés. Le `FormGroup`
      // interne permet de traiter `label` et `done` comme une unité validable.
      checklist: this.formBuilder.array<FormGroup<ChecklistItemControls>>(
        (this.data.task?.checklist.length
          ? this.data.task.checklist
          : [{ label: '', done: false }]
        ).map((item) =>
          this.formBuilder.nonNullable.group<ChecklistItemControls>({
            label: this.formBuilder.nonNullable.control(item.label, {
              validators: [Validators.required, trimmedMinimumLength(2)],
            }),
            done: this.formBuilder.nonNullable.control(item.done),
          }),
        ),
        // Un validateur de `FormArray` contrôle une contrainte portant sur la
        // collection entière, ici son nombre minimum d'éléments.
        { validators: [minimumChecklistItems(1)] },
      ),
      riskMitigation: this.formBuilder.nonNullable.control(this.data.task?.riskMitigation ?? ''),
    },
    // Ce validateur reçoit le groupe complet, car sa règle dépend simultanément
    // de la priorité et de la mitigation.
    { validators: [highPriorityRiskValidator] },
  );

  // Les données d'un dialogue sont figées à son ouverture. Les valeurs qui
  // évoluent avec la saisie sont exposees sous forme de `Signal` afin que le
  // template depended directement de la valeur la plus recente.
  protected readonly users = this.data.users;
  protected readonly isEditing = this.data.task !== null;
  protected readonly priority = signal<TaskPriority>(this.data.task?.priority ?? 'medium');
  protected readonly formStatus = signal<FormStatus>(this.taskForm.status);
  protected readonly lastValueChange = signal<string | null>(null);
  protected readonly lastStatusChange = signal<FormStatus>(this.taskForm.status);

  // Ces références simplifient l'accès au `FormArray` depuis les méthodes et
  // le template sans dupliquer la navigation controls/tableau.
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
    // `valueChanges` se déclenche pour chaque modification du groupe. Il est
    // utile pour journaliser l'activité pédagogique, mais ne remplace pas
    // `statusChanges`, qui notifie uniquement les changements de validité.
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

    // `takeUntilDestroyed()` exploite le contexte d'injection du constructeur :
    // chaque abonnement est automatiquement fermé avec le dialog, sans champ
    // `Subscription` manuel susceptible d'être oublié.
    this.taskForm.statusChanges.pipe(takeUntilDestroyed()).subscribe((status) => {
      this.formStatus.set(status);
      this.lastStatusChange.set(status);
    });

    // La règle de mitigation appartient au groupe. `updateValueAndValidity`
    // recalcule donc les validateurs croisés après chaque changement de priorité.
    this.taskForm.controls.priority.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((priority) => {
        this.priority.set(priority);
        this.taskForm.updateValueAndValidity();
      });
  }

  protected addTag(): void {
    // `FormArray.push` accepte le même `FormControl` typé que la construction
    // initiale. Le template peut donc rendre chaque entrée avec `formControlName`.
    this.tagControls.push(this.formBuilder.nonNullable.control(''));
  }

  protected removeTag(index: number): void {
    // `removeAt` recalcule donc la valeur, la validité et les index du tableau.
    this.tagControls.removeAt(index);
  }

  protected addChecklistItem(): void {
    // Un nouvel élément reçoit aussi un sous-`FormGroup` typé : la structure
    // reste identique pendant création et édition.
    this.checklistItems.push(
      this.formBuilder.nonNullable.group<ChecklistItemControls>({
        label: this.formBuilder.nonNullable.control('', {
          validators: [Validators.required, trimmedMinimumLength(2)],
        }),
        done: this.formBuilder.nonNullable.control(false),
      }),
    );
  }

  protected removeChecklistItem(index: number): void {
    this.checklistItems.removeAt(index);
  }

  protected submit(): void {
    // La validation Angular est évaluée avant toute normalisation ou sortie.
    // `markAllAsTouched` révèle les messages d'erreur sans modifier les valeurs.
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    // `getRawValue` inclut aussi les contrôles désactivés. Les contrôles de ce
    // formulaire ne sont pas désactivés, mais cette API évite les `undefined`
    // possibles avec `value` lorsque la structure devient partielle.
    const value = this.taskForm.getRawValue();
    // `MatDialogRef.close` constitue le contrat de sortie du dialogue. La feature
    // parente reçoit uniquement la valeur métier normalisée, jamais le FormGroup.
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
    // Fermer sans argument produit `undefined`, ce qui distingue l'annulation
    // d'une confirmation et empêche toute mutation côté page parente.
    this.dialogRef.close();
  }
}

/**
 * Refuse une chaîne vide ou composée uniquement d'espaces.
 *
 * Ce validateur est nécessaire car `Validators.required` considère qu'une
 * chaîne non vide comme `'   '` comme valide. Il est donc utilisé avec les
 * validateurs de longueur sur les champs texte dont les espaces sont retirés
 * avant persistance.
 */
export function nonBlank(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { required: true };
}

/**
 * Applique une longueur minimale après suppression des espaces périphériques.
 *
 * Le message et la clé `minlength` restent compatibles avec les cas d'erreur
 * Material, tandis que la valeur contrôlée peut être calculée avant le `trim`.
 */
export function trimmedMinimumLength(minimum: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value.trim() : '';
    const actualLength = value.length;
    return actualLength >= minimum
      ? null
      : { minlength: { requiredLength: minimum, actualLength } };
  };
}

/**
 * Vérifie une date métier `YYYY-MM-DD` et sa réalité calendaire.
 *
 * Un input HTML `type="date"` réduit les erreurs de saisie, mais cette règle
 * protège également les saisies programmatiques et garantit la même contrainte
 * que la validation serveur.
 */
export function validIsoDate(control: AbstractControl): ValidationErrors | null {
  if (typeof control.value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(control.value)) {
    return { isoDate: true };
  }

  const parsedDate = new Date(`${control.value}T00:00:00.000Z`);
  const isCalendarDate =
    !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === control.value;
  return isCalendarDate ? null : { isoDate: true };
}

/**
 * Valide une règle qui dépend de plusieurs contrôles du même formulaire.
 *
 * Angular appelle ce validateur sur le `FormGroup` racine. Il convient donc aux
 * invariants comme « priorité haute implique une mitigation », mais pas à la
 * validation d'un seul champ.
 */
export function highPriorityRiskValidator(control: AbstractControl): ValidationErrors | null {
  const priority = control.get('priority')?.value;
  const riskMitigation = control.get('riskMitigation')?.value;

  if (priority === 'high' && (typeof riskMitigation !== 'string' || !riskMitigation.trim())) {
    return { riskMitigationRequired: true };
  }

  return null;
}

/**
 * Factory de validateur pour une contrainte portant sur un `FormArray`.
 *
 * La fonction reçoit `minimum` lors de la déclaration du validateur, puis
 * reçoit le tableau au moment du recalcul. Cela évite de dupliquer une règle
 * identique pour plusieurs collections.
 */
export function minimumChecklistItems(minimum: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const actual = Array.isArray(control.value) ? control.value.length : 0;
    return actual >= minimum ? null : { minimumItems: { required: minimum, actual } };
  };
}
