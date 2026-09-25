import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserStore } from './user-store';
import { LAB_API_URL } from '../api/lab-api.tokens';
import { USERS } from '../../testing/test-data';

describe('UserStore', () => {
  let http: HttpTestingController;

// [Angular Test — `TestBed`] `TestBed.configureTestingModule`
// Contexte : déclarer le client HTTP et son adaptateur de test pour le store utilisateur.
// Objectif : construire un injecteur isolé avec une URL d’API contrôlée.
// Justification : contrôler les requêtes sans appeler le réseau ni l’injecteur global.

// [Angular HTTP — Injection] `provideHttpClient`
// Contexte : installer le client HTTP réel comme dépendance du store.
// Objectif : laisser la production du service utiliser l’API Angular habituelle.
// Justification : tester la façade du store tout en interceptant ses requêtes.

// [Angular HTTP — Test] `provideHttpClientTesting`
// Contexte : brancher le backend de test après le client HTTP.
// Objectif : pouvoir inspecter et compléter les requêtes émises par le store.
// Justification : rendre les réponses et erreurs déterministes.

// [Angular Test — `TestBed.inject`] `inject`
// Contexte : récupérer le contrôleur HTTP depuis l’injecteur configuré.
// Objectif : synchroniser les requêtes du store avec le scénario.
// Justification : éviter un accès direct à une implémentation globale.

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LAB_API_URL, useValue: '/api' },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

// [Angular HTTP — Vérification] `HttpTestingController.verify`
// Contexte : clôturer le scénario après les assertions sur les requêtes.
// Objectif : détecter toute requête attendue mais non consommée ou restante.
// Justification : garantir qu’aucune dépendance HTTP ne fuit hors du test.

  afterEach(() => http.verify());

  it('expose un état loading puis success après conversion en Signal', () => {
    const store = TestBed.inject(UserStore);
    expect(store.loadState()).toBe('loading');

    // [Angular HTTP — Attente] `HttpTestingController.expectOne`
    // Contexte : sélectionner la requête produite par le store utilisateur.
    // Objectif : contrôler précisément l’URL et le moment de la requête.
    // Justification : rendre le contrat HTTP observable et reproductible.

    // [Angular HTTP — Simulation] `HttpTestingController.flush`
    // Contexte : fournir une réponse contrôlée à la requête sélectionnée.
    // Objectif : faire évoluer les Signals du store sans toucher au réseau.
    // Justification : contrôler le résultat du chemin testé.

    http.expectOne('/api/users').flush(USERS);

    expect(store.loadState()).toBe('success');
    expect(store.users()).toEqual(USERS);
    expect(store.errorMessage()).toBeNull();
  });

  it('distingue une réponse vide', () => {
    const store = TestBed.inject(UserStore);
    http.expectOne('/api/users').flush([]);

    expect(store.loadState()).toBe('empty');
    expect(store.users()).toEqual([]);
  });

  it('convertit une erreur en état stable', () => {
    const store = TestBed.inject(UserStore);
    http
      .expectOne('/api/users')
      .flush(
        { message: 'Annuaire indisponible.' },
        { status: 503, statusText: 'Service Unavailable' },
      );

    expect(store.loadState()).toBe('error');
    expect(store.errorMessage()).toBe('Annuaire indisponible.');
    expect(store.users()).toEqual([]);
  });
});
