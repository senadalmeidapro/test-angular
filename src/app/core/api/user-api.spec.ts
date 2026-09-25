import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserApi } from './user-api';
import { LAB_API_URL } from './lab-api.tokens';
import { USERS } from '../../testing/test-data';

describe('UserApi', () => {
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

  it('charge les utilisateurs', () => {
    const users: unknown[] = [];
    TestBed.inject(UserApi)
      .getUsers()
      .subscribe((value) => users.push(value));

    const request = http.expectOne('/api/users');
    expect(request.request.method).toBe('GET');
    request.flush(USERS);
    expect(users).toEqual([USERS]);
  });
});
