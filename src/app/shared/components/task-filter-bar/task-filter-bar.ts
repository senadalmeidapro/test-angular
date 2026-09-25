import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TaskStatus } from '../../../core/models/task.model';
import { TaskStatusFilter } from '../../../core/utils/task-filter';

@Component({
  selector: 'app-task-filter-bar',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './task-filter-bar.html',
  styleUrl: './task-filter-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFilterBar {
  readonly searchTerm = model('');
  readonly statusFilter = model<TaskStatusFilter>('all');
  readonly resultCount = input(0);
  readonly filtersCleared = output<void>();
  protected readonly statusOptions = taskStatusOptions;

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected updateStatus(status: TaskStatusFilter): void {
    this.statusFilter.set(status);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('all');
    this.filtersCleared.emit();
  }
}

export const taskStatusOptions: readonly { value: TaskStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'todo', label: 'À faire' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'done', label: 'Terminé' },
];
