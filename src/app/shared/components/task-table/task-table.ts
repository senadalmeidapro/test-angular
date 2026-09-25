import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Task, TaskStatus, TaskStatusChange } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-task-table',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './task-table.html',
  styleUrl: './task-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTable {
  readonly tasks = input.required<readonly Task[]>();
  readonly users = input.required<readonly User[]>();
  readonly pendingTaskIds = input<ReadonlySet<string>>(new Set());
  readonly refreshRequested = output<void>();
  readonly taskStatusChanged = output<TaskStatusChange>();
  readonly taskEditRequested = output<Task>();
  readonly taskDeleteRequested = output<Task>();

  protected readonly displayedColumns = [
    'done',
    'task',
    'assignee',
    'status',
    'dueDate',
    'actions',
  ] as const;
  protected readonly taskRows = computed(() => [...this.tasks()]);

  protected refresh(): void {
    this.refreshRequested.emit();
  }

  protected toggleDone(task: Task, isDone: boolean): void {
    this.taskStatusChanged.emit({ taskId: task.id, status: isDone ? 'done' : 'todo' });
  }

  protected changeStatus(task: Task, status: TaskStatus): void {
    if (task.status !== status) {
      this.taskStatusChanged.emit({ taskId: task.id, status });
    }
  }

  protected assigneeName(task: Task): string {
    return this.users().find((user) => user.id === task.assigneeId)?.name ?? 'Non assignée';
  }

  protected checklistProgress(task: Task): number {
    if (task.checklist.length === 0) {
      return 0;
    }

    const completed = task.checklist.filter((item) => item.done).length;
    return Math.round((completed / task.checklist.length) * 100);
  }

  protected isPending(taskId: string): boolean {
    return this.pendingTaskIds().has(taskId);
  }
}
