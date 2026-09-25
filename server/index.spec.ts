import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { tasks } from './data.js';
import { createApiApp } from './index.js';

let server: Server;
let baseUrl: string;
const originalTasks = structuredClone(tasks);

before(async () => {
  server = createApiApp({ latencyMs: 0 }).listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}/api`;
});

afterEach(() => {
  tasks.splice(0, tasks.length, ...structuredClone(originalTasks));
});

after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

describe('API Angular Lab', () => {
  test('expose sa santé, ses projets et ses utilisateurs', async () => {
    const [health, projects, users] = await Promise.all([
      fetchJson('/health'),
      fetchJson('/projects'),
      fetchJson('/users'),
    ]);

    assert.deepEqual(health, { status: 'ok' });
    assert.ok(Array.isArray(projects) && projects.length > 0);
    assert.ok(Array.isArray(users) && users.length > 0);
  });

  test('rejette une entité avec une priorité haute sans mitigation', async () => {
    const response = await fetch(`${baseUrl}/projects/project-portal/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...validTaskPayload(), priority: 'high', riskMitigation: '  ' }),
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      message: 'Une priorité haute exige une mesure de mitigation.',
    });
  });

  test('exécute le cycle de vie complet et accepte le payload réel du formulaire', async () => {
    const createResponse = await fetch(`${baseUrl}/projects/project-portal/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validTaskPayload()),
    });
    assert.equal(createResponse.status, 201);
    const created = (await createResponse.json()) as { id: string; tags: string[] };
    assert.match(created.id, /^[0-9a-f-]{36}$/);
    assert.deepEqual(created.tags, ['angular']);

    const updateResponse = await fetch(`${baseUrl}/tasks/${created.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...validTaskPayload(), status: 'done' }),
    });
    assert.equal(updateResponse.status, 200);
    const updated = (await updateResponse.json()) as { status: string; riskMitigation: string };
    assert.equal(updated.status, 'done');
    assert.equal(updated.riskMitigation, '');

    const deleteResponse = await fetch(`${baseUrl}/tasks/${created.id}`, { method: 'DELETE' });
    assert.equal(deleteResponse.status, 204);
  });

  test('valide strictement les types et les dates calendaires', async () => {
    const invalidAssignee = await createTask({ ...validTaskPayload(), assigneeId: 42 });
    assert.equal(invalidAssignee.status, 400);
    assert.deepEqual(await invalidAssignee.json(), { message: 'Le responsable est obligatoire.' });

    const invalidDescription = await createTask({ ...validTaskPayload(), description: 42 });
    assert.equal(invalidDescription.status, 400);
    assert.deepEqual(await invalidDescription.json(), {
      message: 'La description doit être une chaîne de caractères.',
    });

    const invalidDate = await createTask({ ...validTaskPayload(), dueDate: '2026-02-30' });
    assert.equal(invalidDate.status, 400);
    assert.deepEqual(await invalidDate.json(), {
      message: 'L’échéance doit être une date ISO valide.',
    });
  });

  test('normalise la checklist sans accepter de propriétés arbitraires', async () => {
    const originalTask = tasks.find((task) => task.id === 'task-1');
    assert.ok(originalTask);
    const originalChecklistId = originalTask.checklist[0]?.id;
    assert.ok(originalChecklistId);

    const response = await fetch(`${baseUrl}/tasks/task-1`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        checklist: [{ label: '  Valider la correction  ', done: false, injected: 'not allowed' }],
      }),
    });

    assert.equal(response.status, 200);
    const updated = (await response.json()) as {
      checklist: Array<{ id: string; label: string; done: boolean }>;
    };
    assert.deepEqual(Object.keys(updated.checklist[0] ?? {}).sort(), ['done', 'id', 'label']);
    assert.equal(updated.checklist[0]?.id, originalChecklistId);
    assert.equal(updated.checklist[0]?.label, 'Valider la correction');
  });

  test('normalise les erreurs du parseur JSON et de la taille du corps', async () => {
    const malformedJson = await fetch(`${baseUrl}/projects/project-portal/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not-json',
    });
    assert.equal(malformedJson.status, 400);
    assert.deepEqual(await malformedJson.json(), {
      message: 'Le corps de la requête contient un JSON invalide.',
    });

    const oversizedBody = await fetch(`${baseUrl}/projects/project-portal/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ value: 'x'.repeat(101 * 1024) }),
    });
    assert.equal(oversizedBody.status, 413);
    assert.deepEqual(await oversizedBody.json(), {
      message: 'La charge utile ne peut pas dépasser 100 kB.',
    });
  });

  test('expose les erreurs de panne simulée et de ressource absente', async () => {
    const simulatedFailure = await fetchJson('/projects?simulateError=true', 503);
    assert.deepEqual(simulatedFailure, { message: 'Panne simulée de l’API.' });

    const missingProject = await fetchJson('/projects/missing', 404);
    assert.deepEqual(missingProject, { message: 'Projet introuvable.' });

    const unknownRoute = await fetchJson('/unknown', 404);
    assert.deepEqual(unknownRoute, { message: 'Route inconnue : GET /unknown' });
  });
});

function validTaskPayload(): Record<string, unknown> {
  return {
    title: '  Tâche de test  ',
    description: 'Description de test.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'user-ada',
    dueDate: '2026-10-01',
    tags: [' Angular ', 'angular'],
    checklist: [{ label: 'Valider', done: false }],
    riskMitigation: '',
  };
}

function createTask(payload: Record<string, unknown>): Promise<Response> {
  return fetch(`${baseUrl}/projects/project-portal/tasks`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

async function fetchJson(path: string, expectedStatus = 200): Promise<unknown> {
  const response = await fetch(`${baseUrl}${path}`);
  assert.equal(response.status, expectedStatus);
  return response.json();
}
