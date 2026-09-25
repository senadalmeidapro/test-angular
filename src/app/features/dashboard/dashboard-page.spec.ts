import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DashboardPage } from './dashboard-page';
import { LAB_API_URL } from '../../core/api/lab-api.tokens';
import { Project } from '../../core/models/project.model';
import { PROJECTS, USERS } from '../../testing/test-data';

registerLocaleData(localeFr);

interface DashboardHarness {
  openProject(project: Project): void;
}

describe('DashboardPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: LAB_API_URL, useValue: '/api' },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('charge projets et utilisateurs puis affiche le dashboard', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Chargement des projets');
    http.expectOne('/api/users').flush(USERS);
    http.expectOne('/api/projects').flush(PROJECTS);
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Portail client');
    expect(element.textContent).toContain('Documentation API');
    expect(element.textContent).toContain('Laboratoire Change Detection');
    expect(element.textContent).toContain('Équipe');
  });

  it('affiche un état récupérable quand les projets échouent', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    http.expectOne('/api/users').flush(USERS);
    http
      .expectOne('/api/projects')
      .flush({ message: 'API indisponible.' }, { status: 503, statusText: 'Service Unavailable' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('L’API ne répond pas');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('API indisponible.');
  });

  it('navigue vers l’espace d’un projet', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    http.expectOne('/api/users').flush(USERS);
    http.expectOne('/api/projects').flush(PROJECTS);
    await fixture.whenStable();

    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    (fixture.componentInstance as unknown as DashboardHarness).openProject(PROJECTS[0]);

    expect(navigate).toHaveBeenCalledWith(['/projects', 'project-portal']);
  });
});
