export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly done: boolean;
}

export interface Task {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly assigneeId: string;
  readonly dueDate: string;
  readonly tags: readonly string[];
  readonly checklist: readonly ChecklistItem[];
  readonly riskMitigation: string;
  readonly createdAt: string;
}

export interface CreateTaskRequest {
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly assigneeId: string;
  readonly dueDate: string;
  readonly tags: readonly string[];
  readonly checklist: readonly Omit<ChecklistItem, 'id'>[];
  readonly riskMitigation: string;
}

export type UpdateTaskRequest = Partial<Omit<CreateTaskRequest, 'checklist'>> & {
  readonly checklist?: readonly Omit<ChecklistItem, 'id'>[];
};

export interface TaskStatusChange {
  readonly taskId: string;
  readonly status: TaskStatus;
}
