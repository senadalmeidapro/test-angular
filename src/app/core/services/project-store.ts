import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectApi } from '../api/project-api';
import { LoadState } from '../models/load-state.model';
import { Project } from '../models/project.model';
import { toErrorMessage } from '../utils/http-error';

@Injectable({ providedIn: 'root' })
export class ProjectStore {
  private readonly api = inject(ProjectApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly projectsState = signal<readonly Project[]>([]);
  private readonly loadStateState = signal<LoadState>('idle');
  private readonly errorMessageState = signal<string | null>(null);
  private readonly selectedProjectIdState = signal<string | null>(null);
  private requestVersion = 0;

  readonly projects = this.projectsState.asReadonly();
  readonly loadState = this.loadStateState.asReadonly();
  readonly errorMessage = this.errorMessageState.asReadonly();
  readonly selectedProjectId = this.selectedProjectIdState.asReadonly();
  readonly selectedProject = computed(
    () =>
      this.projectsState().find((project) => project.id === this.selectedProjectIdState()) ?? null,
  );
  readonly activeProjectCount = computed(
    () => this.projectsState().filter((project) => project.status === 'active').length,
  );
  readonly completedProjectCount = computed(
    () => this.projectsState().filter((project) => project.status === 'completed').length,
  );
  readonly totalProjectCount = computed(() => this.projectsState().length);

  loadProjects(): void {
    if (this.loadStateState() === 'loading') {
      return;
    }

    const requestVersion = ++this.requestVersion;
    this.loadStateState.set('loading');
    this.errorMessageState.set(null);

    this.api
      .getProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (projects) => {
          if (requestVersion !== this.requestVersion) {
            return;
          }

          this.projectsState.set(projects);
          this.loadStateState.set(projects.length === 0 ? 'empty' : 'success');
        },
        error: (error: unknown) => {
          if (requestVersion !== this.requestVersion) {
            return;
          }

          this.errorMessageState.set(toErrorMessage(error, 'Impossible de charger les projets.'));
          this.loadStateState.set('error');
        },
      });
  }

  selectProject(projectId: string | null): void {
    this.selectedProjectIdState.set(projectId);
  }
}
