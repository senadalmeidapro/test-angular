import { TestBed } from '@angular/core/testing';
import { ChangeDetectionLab } from './change-detection-lab';

describe('ChangeDetectionLab', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ChangeDetectionLab] }).compileComponents();
  });

  it('révèle la différence Eager/OnPush lors d’une mutation sur place', () => {
    const fixture = TestBed.createComponent(ChangeDetectionLab);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    const mutateButton = findButton(element, 'Mutation sur place');
    mutateButton.click();
    fixture.detectChanges();

    const eager = element.querySelector('[data-strategy="eager"] code')?.textContent;
    const onPush = element.querySelector('[data-strategy="onpush"] code')?.textContent;
    expect(eager).toContain('muté');
    expect(onPush).toBe('Objet A');

    const onPushProbe = element.querySelector('[data-strategy="onpush"]') as HTMLElement;
    findButton(onPushProbe, '+ Champ local').click();
    fixture.detectChanges();
    expect(element.querySelector('[data-strategy="onpush"] code')?.textContent).toContain('muté');
  });

  it('propage une nouvelle référence aux deux stratégies', () => {
    const fixture = TestBed.createComponent(ChangeDetectionLab);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    findButton(element, 'Nouvelle référence').click();
    fixture.detectChanges();

    expect(element.querySelector('[data-strategy="eager"] code')?.textContent).toContain('Objet B');
    expect(element.querySelector('[data-strategy="onpush"] code')?.textContent).toContain(
      'Objet B',
    );
  });
});

function findButton(root: HTMLElement, text: string): HTMLButtonElement {
  const button = [...root.querySelectorAll('button')].find((candidate) =>
    candidate.textContent?.includes(text),
  );
  if (!button) {
    throw new Error(`Bouton « ${text} » introuvable.`);
  }
  return button;
}
