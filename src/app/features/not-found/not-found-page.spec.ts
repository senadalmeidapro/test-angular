import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
// [Angular Test — `TestBed`] `TestBed.configureTestingModule`
// Contexte : déclarer la page et ses dépendances de template.
// Objectif : construire un injecteur isolé pour ce scénario de rendu.
// Justification : éviter l’état global et garantir un DOM reproductible.

// [Angular Router — Routage] `provideRouter`
// Contexte : fournir un routeur vide pour que le lien de retour puisse être rendu.
// Objectif : satisfaire Angular Router sans déclencher de navigation réelle.
// Justification : isoler le test de l’URL courante du navigateur.

// [Angular Test — `TestBed`] `compileComponents`
// Contexte : compiler le composant et ses directives avant de créer la fixture.
// Objectif : rendre le template prêt pour la première détection de changements.
// Justification : éviter une fixture incomplète et stabiliser le rendu.

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('explique l’erreur et propose le retour au dashboard', () => {
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Erreur 404');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/dashboard');
  });
});
