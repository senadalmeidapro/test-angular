export type ProjectStatus = 'planned' | 'active' | 'on-hold' | 'completed';
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  dueDate: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export interface ChecklistItemInput {
  label: string;
  done: boolean;
}

export interface ChecklistItem extends ChecklistItemInput {
  id: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string;
  tags: string[];
  checklist: ChecklistItem[];
  riskMitigation: string;
  createdAt: string;
}

export type CreateTaskRequest = Omit<Task, 'id' | 'projectId' | 'createdAt'>;
export type UpdateTaskRequest = Partial<CreateTaskRequest>;
