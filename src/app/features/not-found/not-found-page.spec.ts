import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
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
