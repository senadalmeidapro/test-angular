import { TestBed } from '@angular/core/testing';
import { StatCard } from './stat-card';

describe('StatCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatCard] }).compileComponents();
  });

  it('formate une valeur numérique en français', () => {
    const fixture = TestBed.createComponent(StatCard);
    fixture.componentRef.setInput('label', 'Projets');
    fixture.componentRef.setInput('value', 1234);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('1 234');
    expect(element.textContent).toContain('Projets');
  });

  it('conserve une valeur textuelle et applique sa tonalité', () => {
    const fixture = TestBed.createComponent(StatCard);
    fixture.componentRef.setInput('label', 'État');
    fixture.componentRef.setInput('value', 'Zoneless');
    fixture.componentRef.setInput('tone', 'warning');
    fixture.detectChanges();

    const card = (fixture.nativeElement as HTMLElement).querySelector('mat-card');
    expect(card?.textContent).toContain('Zoneless');
    expect(card?.getAttribute('data-tone')).toBe('warning');
  });
});
