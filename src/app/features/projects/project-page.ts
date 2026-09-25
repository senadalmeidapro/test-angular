import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { LoadState } from '../../core/models/load-state.model';
import { TaskEditorDialogData, TaskEditorValue } from '../../core/models/task-editor.model';
import {
  CreateTaskRequest,
  Task,
  TaskStatusChange,
  UpdateTaskRequest,
} from '../../core/models/task.model';
import { ProjectStore } from '../../core/services/project-store';
import { NotificationService } from '../../core/services/notification.service';
import { TaskStore } from '../../core/services/task-store';
import { UserStore } from '../../core/services/user-store';
import { filterTasks, TaskStatusFilter } from '../../core/utils/task-filter';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { TaskEditorDialog } from '../../shared/components/task-editor-dialog/task-editor-dialog';
import { TaskFilterBar } from '../../shared/components/task-filter-bar/task-filter-bar';
import { TaskTable } from '../../shared/components/task-table/task-table';

@Component({
  selector: 'app-project-page',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    TaskFilterBar,
    TaskTable,
  ],
  templateUrl: './project-page.html',
  styleUrl: './project-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);

  protected readonly projectStore = inject(ProjectStore);
  protected readonly taskStore = inject(TaskStore);
  protected readonly userStore = inject(UserStore);
  protected readonly searchTerm = signal('');
  protected readonly debouncedSearch = signal('');
  protected readonly statusFilter = signal<TaskStatusFilter>('all');
  protected readonly projectId = signal<string | null>(null);

  protected readonly filteredTasks = computed(() =>
    filterTasks(this.taskStore.tasks(), {
      query: this.debouncedSearch(),
      status: this.statusFilter(),
    }),
  );
  protected readonly completedTaskCount = computed(
    () => this.taskStore.tasks().filter((task) => task.status === 'done').length,
  );
  protected readonly inProgressTaskCount = computed(
    () => this.taskStore.tasks().filter((task) => task.status === 'in-progress').length,
  );
  protected readonly progressPercent = computed(() => {
    const tasks = this.taskStore.tasks();
    if (tasks.length === 0) {
      return 0;
    }

    return Math.round((this.completedTaskCount() / tasks.length) * 100);
  });
  protected readonly workspaceState = computed<LoadState | 'not-found'>(() => {
    if (this.projectId() === null) {
      return 'idle';
    }
    if (
      this.taskStore.loadState() === 'loading' ||
      (this.projectStore.loadState() === 'loading' && !this.projectStore.selectedProject())
    ) {
      return 'loading';
    }
    if (
      (this.projectStore.loadState() === 'success' || this.projectStore.loadState() === 'empty') &&
      !this.projectStore.selectedProject()
    ) {
      return 'not-found';
    }
    if (this.taskStore.loadState() === 'error' || this.projectStore.loadState() === 'error') {
      return 'error';
    }
    return this.taskStore.loadState();
  });
  protected readonly workspaceError = computed(
    () => this.taskStore.errorMessage() ?? this.projectStore.errorMessage(),
  );

  constructor() {
    toObservable(this.searchTerm)
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query) => this.debouncedSearch.set(query));

    this.route.paramMap
      .pipe(
        filter((parameters) => parameters.get('projectId') !== null),
        map((parameters) => parameters.get('projectId') as string),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((projectId) => {
        this.projectId.set(projectId);
        this.projectStore.selectProject(projectId);
        if (this.projectStore.loadState() === 'idle') {
          this.projectStore.loadProjects();
        }
        this.taskStore.loadTasks(projectId);
      });
  }

  protected refresh(): void {
    this.taskStore.loadTasks(this.projectId() ?? '');
    if (this.projectStore.loadState() === 'error') {
      this.projectStore.loadProjects();
    }
  }

  protected backToDashboard(): void {
    void this.router.navigate(['/dashboard']);
  }

  protected openCreateDialog(): void {
    const projectId = this.projectId();
    if (!projectId) {
      return;
    }

    this.openEditor(projectId, null);
  }

  protected openEditDialog(task: Task): void {
    const projectId = this.projectId();
    if (projectId) {
      this.openEditor(projectId, task);
    }
  }

  protected changeTaskStatus(change: TaskStatusChange): void {
    this.taskStore.updateTask(change.taskId, { status: change.status }).subscribe({
      next: () => this.notifications.success('Statut de la tâche mis à jour.'),
      error: (error: unknown) => this.notifications.fromError(error, 'Mise à jour impossible.'),
    });
  }

  protected confirmDelete(task: Task): void {
    this.dialog
      .open<ConfirmDialog, { title: string; message: string; confirmLabel: string }, boolean>(
        ConfirmDialog,
        {
          data: {
            title: 'Supprimer la tâche',
            message: `« ${task.title} » sera supprimée de cette session API.`,
            confirmLabel: 'Supprimer',
          },
        },
      )
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.taskStore.deleteTask(task.id).subscribe({
          next: () => this.notifications.success('Tâche supprimée.'),
          error: (error: unknown) => this.notifications.fromError(error, 'Suppression impossible.'),
        });
      });
  }

  protected filtersCleared(): void {
    this.notifications.success('Filtres réinitialisés.');
  }

  private openEditor(projectId: string, task: Task | null): void {
    const data: TaskEditorDialogData = {
      projectId,
      users: this.userStore.users(),
      task,
    };

    this.dialog
      .open<TaskEditorDialog, TaskEditorDialogData, TaskEditorValue>(TaskEditorDialog, {
        data,
        autoFocus: 'first-tabbable',
        maxWidth: '96vw',
      })
      .afterClosed()
      .pipe(filter((value): value is TaskEditorValue => value !== undefined))
      .subscribe((value) => {
        if (task) {
          this.updateTaskFromDialog(task, value);
        } else {
          this.createTask(projectId, value);
        }
      });
  }

  private createTask(projectId: string, value: TaskEditorValue): void {
    this.taskStore.createTask(projectId, toCreateTaskRequest(value)).subscribe({
      next: () => this.notifications.success('Tâche créée.'),
      error: (error: unknown) => this.notifications.fromError(error, 'Création impossible.'),
    });
  }

  private updateTaskFromDialog(task: Task, value: TaskEditorValue): void {
    this.taskStore.updateTask(task.id, toUpdateTaskRequest(value)).subscribe({
      next: () => this.notifications.success('Tâche modifiée.'),
      error: (error: unknown) => this.notifications.fromError(error, 'Modification impossible.'),
    });
  }
}

function toCreateTaskRequest(value: TaskEditorValue): CreateTaskRequest {
  return {
    title: value.title,
    description: value.description,
    status: value.status,
    priority: value.priority,
    assigneeId: value.assigneeId,
    dueDate: value.dueDate,
    tags: value.tags,
    checklist: value.checklist,
    riskMitigation: value.riskMitigation,
  };
}

function toUpdateTaskRequest(value: TaskEditorValue): UpdateTaskRequest {
  return toCreateTaskRequest(value);
}
