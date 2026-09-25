import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProjectStore } from './project-store';
import { LAB_API_URL } from '../api/lab-api.tokens';
import { PROJECTS } from '../../testing/test-data';

describe('ProjectStore', () => {
  let store: ProjectStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LAB_API_URL, useValue: '/api' },
      ],
    });
    store = TestBed.inject(ProjectStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('passe de loading à success et dérive les compteurs', () => {
    store.loadProjects();
    expect(store.loadState()).toBe('loading');

    http.expectOne('/api/projects').flush(PROJECTS);

    expect(store.loadState()).toBe('success');
    expect(store.projects()).toEqual(PROJECTS);
    expect(store.totalProjectCount()).toBe(3);
    expect(store.activeProjectCount()).toBe(1);
    expect(store.completedProjectCount()).toBe(1);
  });

  it('distingue une collection vide', () => {
    store.loadProjects();
    http.expectOne('/api/projects').flush([]);

    expect(store.loadState()).toBe('empty');
    expect(store.totalProjectCount()).toBe(0);
  });

  it('expose une erreur HTTP et conserve un état récupérable', () => {
    store.loadProjects();
    http
      .expectOne('/api/projects')
      .flush(
        { message: 'Service indisponible.' },
        { status: 503, statusText: 'Service Unavailable' },
      );

    expect(store.loadState()).toBe('error');
    expect(store.errorMessage()).toBe('Service indisponible.');

    store.loadProjects();
    expect(store.loadState()).toBe('loading');
    http.expectOne('/api/projects').flush(PROJECTS);
    expect(store.loadState()).toBe('success');
  });

  it('ignore un second chargement pendant une requête active', () => {
    store.loadProjects();
    store.loadProjects();

    const requests = http.match('/api/projects');
    expect(requests).toHaveLength(1);
    requests[0].flush(PROJECTS);
  });

  it('sélectionne un projet déjà chargé', () => {
    store.loadProjects();
    http.expectOne('/api/projects').flush(PROJECTS);
    store.selectProject('project-docs');

    expect(store.selectedProjectId()).toBe('project-docs');
    expect(store.selectedProject()?.name).toBe('Documentation API');

    store.selectProject(null);
    expect(store.selectedProject()).toBeNull();
  });
});
