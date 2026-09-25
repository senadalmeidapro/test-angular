import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { tasks } from './data.js';
import { createApiApp } from './index.js';

let server: Server;
let baseUrl: string;
let originalTasks = structuredClone(tasks);

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

  test('exécute le cycle de vie complet d’une tâche', async () => {
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
      body: JSON.stringify({ status: 'done' }),
    });
    assert.equal(updateResponse.status, 200);
    assert.equal(((await updateResponse.json()) as { status: string }).status, 'done');

    const deleteResponse = await fetch(`${baseUrl}/tasks/${created.id}`, { method: 'DELETE' });
    assert.equal(deleteResponse.status, 204);
  });

  test('valide les énumérations et les ressources liées', async () => {
    const invalidStatus = await fetch(`${baseUrl}/projects/project-portal/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...validTaskPayload(), status: 'unknown' }),
    });
    assert.equal(invalidStatus.status, 400);

    const invalidUser = await fetch(`${baseUrl}/projects/project-portal/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...validTaskPayload(), assigneeId: 'missing' }),
    });
    assert.equal(invalidUser.status, 400);

    const missingProject = await fetch(`${baseUrl}/projects/missing/tasks`);
    assert.equal(missingProject.status, 404);
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

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(`${baseUrl}${path}`);
  assert.equal(response.status, 200);
  return response.json();
}
