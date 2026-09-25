import cors from 'cors';
import express, { Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { projects, tasks, users } from './data.js';
import { ChecklistItemInput, CreateTaskRequest, Task, TaskPriority, TaskStatus } from './types.js';

export interface ApiAppOptions {
  readonly latencyMs?: number;
}

export function createApiApp(options: ApiAppOptions = {}): express.Express {
  const app = express();
  const latencyMs = options.latencyMs ?? 300;

  app.disable('x-powered-by');
  app.use(cors({ origin: 'http://localhost:4200' }));
  app.use(express.json({ limit: '100kb' }));

  if (latencyMs > 0) {
    const simulateLatency: RequestHandler = (_request, _response, next) => {
      setTimeout(next, latencyMs);
    };
    app.use('/api', simulateLatency);
  }

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/api/users', (_request, response) => {
    response.json(users);
  });

  app.get('/api/projects', (request, response) => {
    if (request.query['simulateError'] === 'true') {
      response.status(503).json({ message: 'Panne simulée de l’API.' });
      return;
    }

    response.json(projects);
  });

  app.get('/api/projects/:projectId', (request, response) => {
    const project = projects.find((candidate) => candidate.id === request.params['projectId']);
    if (!project) {
      response.status(404).json({ message: 'Projet introuvable.' });
      return;
    }

    response.json(project);
  });

  app.get('/api/projects/:projectId/tasks', (request, response) => {
    const projectId = request.params['projectId'];
    if (!projects.some((project) => project.id === projectId)) {
      response.status(404).json({ message: 'Projet introuvable.' });
      return;
    }

    response.json(tasks.filter((task) => task.projectId === projectId));
  });

  app.post('/api/projects/:projectId/tasks', (request, response) => {
    const projectId = request.params['projectId'];
    if (!projects.some((project) => project.id === projectId)) {
      response.status(404).json({ message: 'Projet introuvable.' });
      return;
    }

    const body = readTaskRequest(request);
    if (!body) {
      sendValidationError(response, 'Le corps de la requête doit être un objet JSON.');
      return;
    }

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (title.length < 3 || title.length > 100) {
      sendValidationError(response, 'Le titre doit contenir entre 3 et 100 caractères.');
      return;
    }

    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (description.length > 500) {
      sendValidationError(response, 'La description ne peut pas dépasser 500 caractères.');
      return;
    }

    const status = body.status ?? 'todo';
    if (!isTaskStatus(status)) {
      sendValidationError(response, 'Le statut est invalide.');
      return;
    }

    const priority = body.priority ?? 'medium';
    if (!isTaskPriority(priority)) {
      sendValidationError(response, 'La priorité est invalide.');
      return;
    }

    const assigneeId = typeof body.assigneeId === 'string' ? body.assigneeId : users[0].id;
    if (!users.some((user) => user.id === assigneeId)) {
      sendValidationError(response, 'Le responsable sélectionné est introuvable.');
      return;
    }

    const dueDate = typeof body.dueDate === 'string' ? body.dueDate : '';
    if (!isIsoDate(dueDate)) {
      sendValidationError(response, 'L’échéance doit être une date ISO valide.');
      return;
    }

    const tags = normalizeTags(body.tags);
    if (!tags) {
      sendValidationError(response, 'Les étiquettes doivent être un tableau de chaînes.');
      return;
    }

    const checklist = normalizeChecklist(body.checklist);
    if (!checklist) {
      sendValidationError(response, 'La checklist est invalide.');
      return;
    }

    const riskMitigation = normalizeRiskMitigation(body.riskMitigation);
    if (priority === 'high' && riskMitigation.length === 0) {
      sendValidationError(response, 'Une priorité haute exige une mesure de mitigation.');
      return;
    }

    const task: Task = {
      id: randomUUID(),
      projectId,
      title,
      description,
      status,
      priority,
      assigneeId,
      dueDate,
      tags,
      checklist,
      riskMitigation,
      createdAt: new Date().toISOString(),
    };

    tasks.push(task);
    response.status(201).json(task);
  });

  app.patch('/api/tasks/:taskId', (request, response) => {
    const task = tasks.find((candidate) => candidate.id === request.params['taskId']);
    if (!task) {
      response.status(404).json({ message: 'Tâche introuvable.' });
      return;
    }

    const body = readTaskRequest(request);
    if (!body) {
      sendValidationError(response, 'Le corps de la requête doit être un objet JSON.');
      return;
    }

    if (body.title !== undefined) {
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      if (title.length < 3 || title.length > 100) {
        sendValidationError(response, 'Le titre doit contenir entre 3 et 100 caractères.');
        return;
      }
      body.title = title;
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string' || body.description.trim().length > 500) {
        sendValidationError(response, 'La description ne peut pas dépasser 500 caractères.');
        return;
      }
      body.description = body.description.trim();
    }

    if (body.status !== undefined && !isTaskStatus(body.status)) {
      sendValidationError(response, 'Le statut est invalide.');
      return;
    }

    if (body.priority !== undefined && !isTaskPriority(body.priority)) {
      sendValidationError(response, 'La priorité est invalide.');
      return;
    }

    if (body.assigneeId !== undefined && !users.some((user) => user.id === body.assigneeId)) {
      sendValidationError(response, 'Le responsable sélectionné est introuvable.');
      return;
    }

    if (
      body.dueDate !== undefined &&
      (typeof body.dueDate !== 'string' || !isIsoDate(body.dueDate))
    ) {
      sendValidationError(response, 'L’échéance doit être une date ISO valide.');
      return;
    }

    const nextTags = body.tags === undefined ? task.tags : normalizeTags(body.tags);
    if (!nextTags) {
      sendValidationError(response, 'Les étiquettes doivent être un tableau de chaînes.');
      return;
    }

    const nextChecklist =
      body.checklist === undefined ? task.checklist : normalizeChecklist(body.checklist);
    if (!nextChecklist) {
      sendValidationError(response, 'La checklist est invalide.');
      return;
    }

    const nextRiskMitigation =
      body.riskMitigation === undefined
        ? task.riskMitigation
        : normalizeRiskMitigation(body.riskMitigation);
    if (body.riskMitigation !== undefined && !nextRiskMitigation) {
      sendValidationError(response, 'La mitigation doit être une chaîne de caractères.');
      return;
    }

    const nextPriority = body.priority ?? task.priority;
    if (nextPriority === 'high' && nextRiskMitigation.length === 0) {
      sendValidationError(response, 'Une priorité haute exige une mesure de mitigation.');
      return;
    }

    if (typeof body.title === 'string') task.title = body.title;
    if (typeof body.description === 'string') task.description = body.description;
    if (body.status !== undefined) task.status = body.status;
    if (body.priority !== undefined) task.priority = body.priority;
    if (typeof body.assigneeId === 'string') task.assigneeId = body.assigneeId;
    if (typeof body.dueDate === 'string') task.dueDate = body.dueDate;
    if (body.tags !== undefined) task.tags = nextTags;
    if (body.checklist !== undefined) task.checklist = nextChecklist;
    if (body.riskMitigation !== undefined) task.riskMitigation = nextRiskMitigation;

    response.json(task);
  });

  app.delete('/api/tasks/:taskId', (request, response) => {
    const taskIndex = tasks.findIndex((candidate) => candidate.id === request.params['taskId']);
    if (taskIndex === -1) {
      response.status(404).json({ message: 'Tâche introuvable.' });
      return;
    }

    tasks.splice(taskIndex, 1);
    response.status(204).send();
  });

  app.use('/api', (request, response) => {
    response.status(404).json({ message: `Route inconnue : ${request.method} ${request.path}` });
  });

  return app;
}

function readTaskRequest(request: Request): Partial<CreateTaskRequest> | null {
  const body: unknown = request.body;
  return typeof body === 'object' && body !== null && !Array.isArray(body)
    ? (body as Partial<CreateTaskRequest>)
    : null;
}

function sendValidationError(response: Response, message: string): void {
  response.status(400).json({ message });
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === 'todo' || value === 'in-progress' || value === 'done';
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return value === 'low' || value === 'medium' || value === 'high';
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`));
}

function normalizeTags(value: unknown): string[] | null {
  if (!Array.isArray(value) || !value.every((tag) => typeof tag === 'string')) {
    return null;
  }

  return [
    ...new Set(
      value.map((tag) => tag.trim().toLocaleLowerCase('fr')).filter((tag) => tag.length > 0),
    ),
  ];
}

function normalizeRiskMitigation(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeChecklist(value: unknown): Task['checklist'] | null {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value) || !value.every(isChecklistInput)) {
    return null;
  }

  return value.flatMap((item) => [{ ...item, id: randomUUID() }]);
}

function isChecklistInput(value: unknown): value is ChecklistItemInput {
  return (
    typeof value === 'object' &&
    value !== null &&
    'label' in value &&
    typeof value.label === 'string' &&
    value.label.trim().length >= 2 &&
    'done' in value &&
    typeof value.done === 'boolean'
  );
}

if (require.main === module) {
  const port = Number(process.env['PORT'] ?? 3000);
  createApiApp().listen(port, () => {
    console.log(`API Angular Lab disponible sur http://localhost:${port}/api`);
  });
}
