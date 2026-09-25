import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
// [Angular Test — `TestBed`] `TestBed.configureTestingModule`
// Contexte : isoler le shell applicatif et ses dépendances de routage.
// Objectif : construire un injecteur dédié au scénario.
// Justification : éviter l’état global et rendre le test déterministe.

// [Angular Test — `TestBed`] `compileComponents`
// Contexte : préparer la compilation des composants déclarés dans le module de test.
// Objectif : rendre le template disponible avant la création de la fixture.
// Justification : éviter une initialisation incomplète des directives et pipes Angular.

// [Angular Router — Routage] `provideRouter`
// Contexte : fournir un routeur sans navigation réelle au shell testé.
// Objectif : satisfaire l’injection du routeur tout en gardant le scénario local.
// Justification : ne pas dépendre de l’URL ou de l’historique du navigateur.

  beforeEach(async () => {
    localStorage.removeItem('angular-lab.workspace-density');
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('crée le shell applicatif', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).querySelector('.brand')?.textContent).toContain(
      'Angular Lab',
    );
  });

  it('affiche la navigation, le outlet et les métadonnées pédagogiques', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('nav')?.textContent).toContain('Dashboard');
    expect(element.querySelector('router-outlet')).toBeTruthy();
    expect(element.querySelector('footer')?.textContent).toContain('Signals');
  });

  it('bascule la densité globale depuis le toolbar', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[aria-label="Passer en affichage compact"]',
    );

    button?.click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('main')?.classList).toContain(
      'app-content--compact',
    );
    expect(
      (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
        'button[aria-label="Passer en affichage confortable"]',
      ),
    ).toBeTruthy();
  });
});
