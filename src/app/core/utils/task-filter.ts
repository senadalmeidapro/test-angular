import { Task, TaskStatus } from '../models/task.model';

export type TaskStatusFilter = TaskStatus | 'all';

export interface TaskFilterCriteria {
  readonly query: string;
  readonly status: TaskStatusFilter;
}

export function filterTasks(tasks: readonly Task[], criteria: TaskFilterCriteria): readonly Task[] {
  const normalizedQuery = criteria.query.trim().toLocaleLowerCase('fr');

  return tasks.filter((task) => {
    const matchesStatus = criteria.status === 'all' || task.status === criteria.status;
    const searchableText = [task.title, task.description, ...task.tags]
      .join(' ')
      .toLocaleLowerCase('fr');
    const matchesQuery = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}
