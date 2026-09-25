import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';

export type WorkspaceDensity = 'comfortable' | 'compact';

const STORAGE_KEY = 'angular-lab.workspace-density';

@Injectable({ providedIn: 'root' })
export class WorkspacePreferencesStore {
  private readonly document = inject(DOCUMENT);
  private readonly densityState = signal<WorkspaceDensity>('comfortable');

  readonly density = this.densityState.asReadonly();
  readonly isCompact = computed(() => this.densityState() === 'compact');

  constructor() {
    const storedDensity = this.readStoredDensity();
    if (storedDensity) {
      this.densityState.set(storedDensity);
    }

    // localStorage est une API impérative du navigateur : c’est un effet, pas un état dérivé.
    effect(() => this.writeStoredDensity(this.densityState()));
  }

  toggleDensity(): void {
    this.densityState.update((density) => (density === 'comfortable' ? 'compact' : 'comfortable'));
  }

  private readStoredDensity(): WorkspaceDensity | null {
    try {
      const value = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return value === 'compact' || value === 'comfortable' ? value : null;
    } catch {
      return null;
    }
  }

  private writeStoredDensity(density: WorkspaceDensity): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, density);
    } catch {
      return;
    }
  }
}
