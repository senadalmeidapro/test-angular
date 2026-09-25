import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  const snackBar = { open: vi.fn() };
  let service: NotificationService;

// [Angular Test — `TestBed`] `TestBed.configureTestingModule`
// Contexte : préparer le service de notification dans un injecteur isolé.
// Objectif : fournir un double Material de test et une instance dédiée.
// Justification : éviter les notifications globales et rendre les assertions prévisibles.

// [Angular Material — Remplacement] `MatSnackBar`
// Contexte : remplacer le composant Material par un double qui expose `open`.
// Objectif : observer les messages produits par le service sans animation ni portail Material.
// Justification : tester le contrat de notification sans dépendre du DOM global.

  beforeEach(() => {
    snackBar.open.mockReset();
    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: snackBar }],
    });
    service = TestBed.inject(NotificationService);
  });

  it('configure un message de succès', () => {
    service.success('Opération réussie.');

    expect(snackBar.open).toHaveBeenCalledWith('Opération réussie.', 'Fermer', {
      duration: 3500,
      panelClass: ['lab-snackbar', 'lab-snackbar--success'],
    });
  });

  it('configure une erreur plus persistante', () => {
    service.error('Opération impossible.');

    expect(snackBar.open).toHaveBeenCalledWith('Opération impossible.', 'Fermer', {
      duration: 6000,
      panelClass: ['lab-snackbar', 'lab-snackbar--error'],
    });
  });

  it('normalise une erreur avant de l’afficher', () => {
    service.fromError(new Error('raw'), 'Action impossible.');

    expect(snackBar.open).toHaveBeenCalledWith('Action impossible.', 'Fermer', expect.any(Object));
  });
});
