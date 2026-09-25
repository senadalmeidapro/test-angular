import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
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
