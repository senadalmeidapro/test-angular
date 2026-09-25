import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserStore } from './user-store';
import { LAB_API_URL } from '../api/lab-api.tokens';
import { USERS } from '../../testing/test-data';

describe('UserStore', () => {
  let http: HttpTestingController;

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

  afterEach(() => http.verify());

  it('expose un état loading puis success après conversion en Signal', () => {
    const store = TestBed.inject(UserStore);
    expect(store.loadState()).toBe('loading');

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
