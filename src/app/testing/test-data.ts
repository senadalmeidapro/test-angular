import { Project, ProjectStatus } from '../core/models/project.model';
import {
  ChecklistItem,
  CreateTaskRequest,
  Task,
  TaskPriority,
  TaskStatus,
} from '../core/models/task.model';
import { User } from '../core/models/user.model';

export const USERS: readonly User[] = [
  { id: 'user-ada', name: 'Ada Nguyen', role: 'Product owner', initials: 'AN' },
  { id: 'user-sami', name: 'Sami Benali', role: 'Tech lead', initials: 'SB' },
  { id: 'user-lea', name: 'Léa Martin', role: 'Frontend engineer', initials: 'LM' },
  { id: 'user-noe', name: 'Noé Dubois', role: 'QA engineer', initials: 'ND' },
];

export const PROJECTS: readonly Project[] = [
  {
    id: 'project-portal',
    name: 'Portail client',
    description: 'Simplifier la prise de contact et le suivi des demandes clients.',
    status: 'active',
    ownerId: 'user-ada',
    dueDate: '2026-10-15',
    createdAt: '2026-07-02T09:00:00.000Z',
  },
  {
    id: 'project-mobile',
    name: 'Refonte mobile',
    description: 'Adapter les parcours essentiels aux écrans tactiles.',
    status: 'planned',
    ownerId: 'user-sami',
    dueDate: '2026-11-30',
    createdAt: '2026-08-12T09:00:00.000Z',
  },
  {
    id: 'project-payments',
    name: 'Fiabilité des paiements',
    description: 'Réduire les échecs de paiement et accélérer le diagnostic.',
    status: 'active',
    ownerId: 'user-lea',
    dueDate: '2026-09-30',
    createdAt: '2026-06-20T09:00:00.000Z',
  },
  {
    id: 'project-docs',
    name: 'Documentation API',
    description: 'Publier une référence claire pour les intégrations partenaires.',
    status: 'completed',
    ownerId: 'user-noe',
    dueDate: '2026-08-31',
    createdAt: '2026-05-11T09:00:00.000Z',
  },
];

export const CHECKLIST: readonly ChecklistItem[] = [
  { id: 'check-1', label: 'Préparer le test', done: true },
  { id: 'check-2', label: 'Valider le résultat', done: false },
];

export const TASKS: readonly Task[] = [
  makeTask(),
  makeTask({
    id: 'task-2',
    title: 'Corriger les erreurs réseau',
    description: 'Documenter les scénarios resilient.',
    status: 'todo',
    priority: 'medium',
    tags: ['http', 'qualité'],
  }),
  makeTask({
    id: 'task-3',
    title: 'Publier la documentation',
    description: 'Terminer les exemples publics.',
    status: 'done',
    priority: 'low',
    assigneeId: 'user-noe',
    dueDate: '2026-08-28',
    tags: ['documentation'],
    checklist: [{ id: 'check-3', label: 'Exemples relus', done: true }],
  }),
];

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-test',
    name: 'Projet de test',
    description: 'Description du projet de test.',
    status: 'active' satisfies ProjectStatus,
    ownerId: 'user-ada',
    dueDate: '2026-10-15',
    createdAt: '2026-07-02T09:00:00.000Z',
    ...overrides,
  };
}

export function makeTask(overrides: Partial<Task> = {}): Task {
  const priority = overrides.priority ?? ('high' satisfies TaskPriority);
  return {
    id: 'task-test',
    projectId: 'project-portal',
    title: 'Préparer la démonstration',
    description: 'Vérifier le parcours Angular complet.',
    status: 'in-progress' satisfies TaskStatus,
    priority,
    assigneeId: 'user-lea',
    dueDate: '2026-09-30',
    tags: ['angular', 'démo'],
    checklist: [...CHECKLIST],
    riskMitigation: priority === 'high' ? 'Prévoir un rollback si la démo échoue.' : '',
    createdAt: '2026-08-20T10:00:00.000Z',
    ...overrides,
  };
}

export function makeCreateTaskRequest(
  overrides: Partial<CreateTaskRequest> = {},
): CreateTaskRequest {
  const priority = overrides.priority ?? 'high';
  return {
    title: 'Nouvelle tâche',
    description: 'Description de la nouvelle tâche.',
    status: 'todo',
    priority,
    assigneeId: 'user-ada',
    dueDate: '2026-10-01',
    tags: ['api'],
    checklist: [{ label: 'Vérifier le résultat', done: false }],
    riskMitigation: priority === 'high' ? 'Mitigation testée.' : '',
    ...overrides,
  };
}
