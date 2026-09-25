import { filterTasks } from './task-filter';
import { makeTask, TASKS } from '../../testing/test-data';

// [Vitest — TypeScript pur] `filterTasks`
// Contexte : cette spec vérifie uniquement une fonction utilitaire, sans TestBed ni API Angular.
// Objectif : contrôler le filtrage, la recherche et la préservation de la collection source.
// Justification : isoler la logique TypeScript des effets de bord et garder Vitest comme runner.

describe('filterTasks', () => {
  it('retourne tous les éléments pour une recherche vide et le statut all', () => {
    expect(filterTasks(TASKS, { query: '   ', status: 'all' })).toEqual(TASKS);
  });

  it('filtre par statut', () => {
    const result = filterTasks(TASKS, { query: '', status: 'done' });

    expect(result.map((task) => task.id)).toEqual(['task-3']);
  });

  it('recherche dans le titre, la description et les tags sans tenir compte de la casse', () => {
    expect(filterTasks(TASKS, { query: 'ERREUR', status: 'all' }).map((task) => task.id)).toEqual([
      'task-2',
    ]);
    expect(filterTasks(TASKS, { query: 'démo', status: 'all' }).map((task) => task.id)).toEqual([
      'task-test',
    ]);
  });

  it('combine recherche et statut avec une logique AND', () => {
    const tasks = [
      makeTask({ id: 'match', title: 'Publier la version', status: 'done' }),
      makeTask({ id: 'no-status', title: 'Publier la roadmap', status: 'todo' }),
    ];

    expect(filterTasks(tasks, { query: 'publier', status: 'done' }).map((task) => task.id)).toEqual(
      ['match'],
    );
  });

  it('préserve l’ordre et ne mute pas la collection source', () => {
    const tasks = [
      makeTask({ id: 'first', title: 'Alpha' }),
      makeTask({ id: 'second', title: 'Bêta' }),
    ];
    const snapshot = structuredClone(tasks);

    expect(filterTasks(tasks, { query: '', status: 'all' }).map((task) => task.id)).toEqual([
      'first',
      'second',
    ]);
    expect(tasks).toEqual(snapshot);
  });
});
