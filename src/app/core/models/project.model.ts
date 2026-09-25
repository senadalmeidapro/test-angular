export type ProjectStatus = 'planned' | 'active' | 'on-hold' | 'completed';

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: ProjectStatus;
  readonly ownerId: string;
  readonly dueDate: string;
  readonly createdAt: string;
}
