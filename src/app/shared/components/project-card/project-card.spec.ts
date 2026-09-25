import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { TestBed } from '@angular/core/testing';
import { ProjectCard } from './project-card';
import { makeProject, USERS } from '../../../testing/test-data';

registerLocaleData(localeFr);

describe('ProjectCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProjectCard] }).compileComponents();
  });

  it('affiche le statut, le propriétaire et la date française', () => {
    const fixture = TestBed.createComponent(ProjectCard);
    fixture.componentRef.setInput('project', makeProject());
    fixture.componentRef.setInput('users', USERS);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Actif');
    expect(element.textContent).toContain('Ada Nguyen');
    const dueDate = element.querySelector('.project-card__date')?.textContent ?? '';
    expect(dueDate).toContain('15');
    expect(dueDate).toContain('10');
  });

  it('retombe sur un propriétaire inconnu', () => {
    const fixture = TestBed.createComponent(ProjectCard);
    fixture.componentRef.setInput('project', makeProject({ ownerId: 'missing' }));
    fixture.componentRef.setInput('users', USERS);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Non assigné');
  });

  it('émet le projet sélectionné', () => {
    const fixture = TestBed.createComponent(ProjectCard);
    const project = makeProject();
    fixture.componentRef.setInput('project', project);
    fixture.componentRef.setInput('users', USERS);
    const selected: unknown[] = [];
    fixture.componentInstance.projectSelected.subscribe((value) => selected.push(value));
    fixture.detectChanges();

    const button = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
      (candidate) => candidate.textContent?.includes('Ouvrir'),
    );
    button?.click();

    expect(selected).toEqual([project]);
  });
});
