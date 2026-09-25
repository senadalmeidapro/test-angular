import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable, tap } from 'rxjs';
import { TaskApi } from '../api/task-api';
import { LoadState } from '../models/load-state.model';
import { CreateTaskRequest, Task, UpdateTaskRequest } from '../models/task.model';
import { toErrorMessage } from '../utils/http-error';

@Injectable()
export class TaskStore {
  private readonly api = inject(TaskApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tasksState = signal<readonly Task[]>([]);
  private readonly loadStateState = signal<LoadState>('idle');
  private readonly errorMessageState = signal<string | null>(null);
  private readonly activeProjectIdState = signal<string | null>(null);
  private readonly pendingTaskCountsState = signal<ReadonlyMap<string, number>>(new Map());
  private requestVersion = 0;

  readonly tasks = this.tasksState.asReadonly();
  readonly loadState = this.loadStateState.asReadonly();
  readonly errorMessage = this.errorMessageState.asReadonly();
  readonly activeProjectId = this.activeProjectIdState.asReadonly();
  readonly pendingTaskIds = computed(() => new Set(this.pendingTaskCountsState().keys()));
  readonly isMutating = computed(() => this.pendingTaskCountsState().size > 0);

  loadTasks(projectId: string): void {
    const requestVersion = ++this.requestVersion;
    this.activeProjectIdState.set(projectId);
    this.tasksState.set([]);
    this.loadStateState.set('loading');
    this.errorMessageState.set(null);

    this.api
      .getTasks(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tasks) => {
          if (requestVersion !== this.requestVersion || this.activeProjectIdState() !== projectId) {
            return;
          }

          this.tasksState.set(tasks);
          this.loadStateState.set(tasks.length === 0 ? 'empty' : 'success');
        },
        error: (error: unknown) => {
          if (requestVersion !== this.requestVersion || this.activeProjectIdState() !== projectId) {
            return;
          }

          this.errorMessageState.set(toErrorMessage(error, 'Impossible de charger les tâches.'));
          this.loadStateState.set('error');
        },
      });
  }

  createTask(projectId: string, request: CreateTaskRequest): Observable<Task> {
    const pendingId = `create:${projectId}`;
    this.setPending(pendingId, true);

    return this.api.createTask(projectId, request).pipe(
      tap((task) => {
        if (this.activeProjectIdState() === projectId) {
          this.tasksState.update((tasks) => [...tasks, task]);
          this.loadStateState.set('success');
        }
      }),
      finalize(() => this.setPending(pendingId, false)),
    );
  }

  updateTask(taskId: string, request: UpdateTaskRequest): Observable<Task> {
    this.setPending(taskId, true);

    return this.api.updateTask(taskId, request).pipe(
      tap((updatedTask) => {
        this.tasksState.update((tasks) =>
          tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        );
      }),
      finalize(() => this.setPending(taskId, false)),
    );
  }

  deleteTask(taskId: string): Observable<void> {
    this.setPending(taskId, true);

    return this.api.deleteTask(taskId).pipe(
      tap(() => {
        this.tasksState.update((tasks) => tasks.filter((task) => task.id !== taskId));
        this.loadStateState.set(this.tasksState().length === 0 ? 'empty' : 'success');
      }),
      finalize(() => this.setPending(taskId, false)),
    );
  }

  private setPending(taskId: string, isPending: boolean): void {
    this.pendingTaskCountsState.update((currentCounts) => {
      const nextCounts = new Map(currentCounts);
      const currentCount = nextCounts.get(taskId) ?? 0;
      const nextCount = currentCount + (isPending ? 1 : -1);

      if (nextCount > 0) {
        nextCounts.set(taskId, nextCount);
      } else {
        nextCounts.delete(taskId);
      }

      return nextCounts;
    });
  }
}
