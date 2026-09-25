import { TestBed } from '@angular/core/testing';
import { WorkspacePreferencesStore } from './workspace-preferences.store';

const storageKey = 'angular-lab.workspace-density';

describe('WorkspacePreferencesStore', () => {
  beforeEach(() => localStorage.removeItem(storageKey));

  it('utilise la densité confortable par défaut', () => {
    const store = TestBed.inject(WorkspacePreferencesStore);

    expect(store.density()).toBe('comfortable');
    expect(store.isCompact()).toBe(false);
  });

  it('restaure une préférence compacte valide', () => {
    localStorage.setItem(storageKey, 'compact');

    const store = TestBed.inject(WorkspacePreferencesStore);

    expect(store.density()).toBe('compact');
    expect(store.isCompact()).toBe(true);
  });

  it('ignore une valeur locale inconnue', () => {
    localStorage.setItem(storageKey, 'invalid');

    expect(TestBed.inject(WorkspacePreferencesStore).density()).toBe('comfortable');
  });

  it('bascule la densité et la persiste dans un effet', () => {
    const store = TestBed.inject(WorkspacePreferencesStore);
    store.toggleDensity();
    TestBed.flushEffects();

    expect(store.density()).toBe('compact');
    expect(localStorage.getItem(storageKey)).toBe('compact');

    store.toggleDensity();
    TestBed.flushEffects();
    expect(store.density()).toBe('comfortable');
  });

  it('ne propage pas une exception du stockage local', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => {
      const store = TestBed.inject(WorkspacePreferencesStore);
      store.toggleDensity();
      TestBed.flushEffects();
    }).not.toThrow();

    setItem.mockRestore();
  });
});
