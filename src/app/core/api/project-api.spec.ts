import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProjectApi } from './project-api';
import { LAB_API_URL } from './lab-api.tokens';
import { PROJECTS } from '../../testing/test-data';

describe('ProjectApi', () => {
  let api: ProjectApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LAB_API_URL, useValue: '/api' },
      ],
    });
    api = TestBed.inject(ProjectApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('charge la collection des projets', () => {
    const projects = api.getProjects();
    const received: unknown[] = [];
    projects.subscribe((value) => received.push(value));

    const request = http.expectOne('/api/projects');
    expect(request.request.method).toBe('GET');
    request.flush(PROJECTS);
    expect(received).toEqual([PROJECTS]);
  });

  it('charge un projet par identifiant', () => {
    api.getProject('project-portal').subscribe();

    const request = http.expectOne('/api/projects/project-portal');
    expect(request.request.method).toBe('GET');
    request.flush(PROJECTS[0]);
  });
});
