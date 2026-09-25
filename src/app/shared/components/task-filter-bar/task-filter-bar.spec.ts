import { TestBed } from '@angular/core/testing';
import { TaskFilterBar } from './task-filter-bar';

describe('TaskFilterBar', () => {
// [Angular Test — `TestBed`] `TestBed.configureTestingModule`
// Contexte : déclarer la barre de filtres et ses composants Material.
// Objectif : construire un injecteur isolé pour les interactions du template.
// Justification : tester le composant sans état global ni rendu partagé.

// [Angular Test — `TestBed`] `compileComponents`
// Contexte : préparer les templates des composants Material importés.
// Objectif : rendre le DOM interactif avant la création de la fixture.
// Justification : éviter une initialisation incomplète des directives.

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TaskFilterBar] }).compileComponents();
  });

  it('met à jour le modèle de recherche depuis le DOM', () => {
    const fixture = TestBed.createComponent(TaskFilterBar);
    fixture.componentRef.setInput('resultCount', 1);
    const searchValues: string[] = [];
    fixture.componentInstance.searchTerm.subscribe((value) => searchValues.push(value));
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input[type="search"]',
    );
    if (!input) {
      throw new Error('Champ de recherche introuvable.');
    }
    input.value = ' réseau ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(searchValues.at(-1)).toBe(' réseau ');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('1 résultat(s)');
  });

  it('réinitialise les deux modèles et émet un événement', () => {
    const fixture = TestBed.createComponent(TaskFilterBar);
    fixture.componentRef.setInput('resultCount', 4);
    fixture.componentInstance.searchTerm.set('Angular');
    fixture.componentInstance.statusFilter.set('done');
    const cleared = vi.fn();
    fixture.componentInstance.filtersCleared.subscribe(cleared);
    fixture.detectChanges();

    const button = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
      (candidate) => candidate.textContent?.includes('Réinitialiser'),
    );
    button?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.searchTerm()).toBe('');
    expect(fixture.componentInstance.statusFilter()).toBe('all');
    expect(cleared).toHaveBeenCalledOnce();
  });
});
