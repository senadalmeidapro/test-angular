import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserApi } from './user-api';
import { LAB_API_URL } from './lab-api.tokens';
import { USERS } from '../../testing/test-data';

describe('UserApi', () => {
  let http: HttpTestingController;

// [Angular Test — `TestBed`] `TestBed.configureTestingModule`
// Contexte : déclarer le client HTTP de l’API utilisateur et son adaptateur de test.
// Objectif : construire un injecteur isolé avec une URL contrôlée.
// Justification : vérifier le contrat HTTP sans accès au réseau réel.

// [Angular HTTP — Injection] `provideHttpClient`
// Contexte : fournir le client HTTP consommé par `UserApi`.
// Objectif : tester le chemin d’injection et de sérialisation utilisé par l’API.
// Justification : conserver le vrai contrat Angular avant son interception.

// [Angular HTTP — Test] `provideHttpClientTesting`
// Contexte : installer le backend permettant d’observer les requêtes.
// Objectif : déclencher et compléter les réponses de l’API de façon déterministe.
// Justification : isoler chaque test des erreurs réseau.

// [Angular Test — `TestBed.inject`] `inject`
// Contexte : récupérer le contrôleur HTTP pour piloter les requêtes du scénario.
// Objectif : associer chaque assertion au transport réellement utilisé.
// Justification : éviter une dépendance à un singleton global.

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
// Contexte : clôturer le scénario après l’appel de l’API utilisateur.
// Objectif : vérifier qu’aucune requête ne reste en attente.
// Justification : rendre l’absence de fuite réseau partie intégrante du test.

  afterEach(() => http.verify());

  it('charge les utilisateurs', () => {
    const users: unknown[] = [];
    TestBed.inject(UserApi)
      .getUsers()
      .subscribe((value) => users.push(value));

    // [Angular HTTP — Attente] `HttpTestingController.expectOne`
    // Contexte : sélectionner la requête émise par `UserApi`.
    // Objectif : vérifier l’URL et le moment de l’appel.
    // Justification : rendre le contrat du client explicite.

    // [Angular HTTP — Simulation] `HttpTestingController.flush`
    // Contexte : fournir les utilisateurs au test comme réponse Angular.
    // Objectif : laisser l’observable résoudre sa valeur attendue.
    // Justification : contrôler le résultat sans serveur externe.

    const request = http.expectOne('/api/users');
    expect(request.request.method).toBe('GET');
    request.flush(USERS);
    expect(users).toEqual([USERS]);
  });
});
