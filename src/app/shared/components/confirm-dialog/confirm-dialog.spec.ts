import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

describe('ConfirmDialog', () => {
// [Angular Test — `ComponentFixture`] `ComponentFixture`
// Contexte : typer la fixture qui encapsule le composant, son instance et son DOM.
// Objectif : conserver un accès sûr au rendu du dialogue dans chaque scénario.
// Justification : expliciter le contrat de la fixture Angular et éviter un état de test implicite.

// [Angular Test — `TestBed`] `TestBed.configureTestingModule`
// Contexte : déclarer le dialogue et ses providers Material de test.
// Objectif : construire un injecteur isolé avec des données et une fermeture contrôlées.
// Justification : vérifier le contrat du dialogue sans portail ni animation Material.

// [Angular Test — `TestBed`] `compileComponents`
// Contexte : préparer le template du composant avant son instanciation.
// Objectif : rendre la fixture prête à être inspectée.
// Justification : éviter une initialisation partielle des directives Material.

// [Angular Material — Remplacement] `MAT_DIALOG_DATA`
// Contexte : injecter les données de dialogue sous forme de valeur fixe.
// Objectif : contrôler les libellés affichés par le template.
// Justification : ne pas dépendre d’un `MatDialog` réellement ouvert.

// [Angular Material — Remplacement] `MatDialogRef`
// Contexte : remplacer la référence de fermeture par un double observant `close`.
// Objectif : vérifier les résultats d’annulation et de confirmation.
// Justification : tester le contrat de sortie du dialogue sans UI superposée.

  let fixture: ComponentFixture<ConfirmDialog>;
  const close = vi.fn();
  const data: ConfirmDialogData = {
    title: 'Confirmer la suppression',
    message: 'Cette action est définitive.',
    confirmLabel: 'Supprimer',
  };

  beforeEach(async () => {
    close.mockReset();
    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialog);
    fixture.detectChanges();
  });

  it('affiche les données injectées', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(data.title);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(data.message);
  });

  it('ferme avec annulation puis confirmation', () => {
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
      'button',
    );
    buttons[0].click();
    buttons[1].click();

    expect(close).toHaveBeenNthCalledWith(1, false);
    expect(close).toHaveBeenNthCalledWith(2, true);
  });
});
