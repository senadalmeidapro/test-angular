import { Task, TaskPriority, TaskStatus } from './task.model';
import { User } from './user.model';

export interface ChecklistItemFormValue {
  readonly label: string;
  readonly done: boolean;
}

export interface TaskEditorValue {
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly assigneeId: string;
  readonly dueDate: string;
  readonly tags: readonly string[];
  readonly checklist: readonly ChecklistItemFormValue[];
  readonly riskMitigation: string;
}

export interface TaskEditorDialogData {
  readonly projectId: string;
  readonly users: readonly User[];
  readonly task: Task | null;
}

export type CreateTaskFromForm = Omit<TaskEditorValue, 'riskMitigation'>;
