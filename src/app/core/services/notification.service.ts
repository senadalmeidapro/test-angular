// [Angular — Imports Angular] `inject`
// Contexte : le service reçoit le composant de notification Angular Material.
// Objectif : importer la fonction d’injection sans dépendance manuelle.
// Justification : la résolution suit le contexte qui fournit le service.

// [Angular — Imports Angular] `Injectable`
// Contexte : les couches applicatives doivent pouvoir notifier l’utilisateur.
// Objectif : importer le décorateur qui déclare la classe injectable.
// Justification : Angular fournit ensuite une instance conforme à cette abstraction.
import { inject, Injectable } from '@angular/core';

// [Angular Material — Imports Angular] `MatSnackBar`
// Contexte : cette classe adaptatrice gère les notifications transitoires.
// Objectif : importer le service Angular Material qui affiche des messages courts.
// Justification : les composants n’ont pas à connaître la mise en œuvre ni le rendu du snackbar.
import { MatSnackBar } from '@angular/material/snack-bar';
import { toErrorMessage } from '../utils/http-error';

// [Angular — Décorateurs] `@Injectable`
// Contexte : plusieurs composants peuvent partager cette politique de notification.
// Objectif : marquer puis exporter le service comme injectable.
// Justification : l’orchestration des messages reste centralisée.
@Injectable({
  // [Angular — Portée de providers] `providedIn: 'root'`
  // Contexte : le service ne dépend d’aucune donnée propre à un écran.
  // Objectif : l’enregistrer dans l’injecteur d’environnement racine.
  // Justification : une seule politique et une seule référence de snackbar sont partagées dans l’application.
  providedIn: 'root',
})
export class NotificationService {
  // [Angular — Injection de dépendances] `inject(MatSnackBar)`
  // Contexte : l’ouverture des messages requiert le service Angular Material fourni par Angular.
// Objectif : recevoir ce service depuis l’injecteur courant.
// Justification : les composants.super? no.
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    // [Angular Material — Notifications] `MatSnackBar.open(...)`
    // Contexte : une opération métier a réussi et doit être confirmée brièvement.
    // Objectif : afficher le message avec une action de fermeture, une durée de 3500 ms et une classe de succès.
    // Justification : la durée et le style distinguent ce retour sans bloquer l’utilisateur.
    this.snackBar.open(message, 'Fermer', {
      duration: 3500,
      panelClass: ['lab-snackbar', 'lab-snackbar--success'],
    });
  }

  error(message: string): void {
    // [Angular Material — Notifications] `MatSnackBar.open(...)`
    // Contexte : une opération a échoué et son message doit rester lisible plus longtemps.
    // Objectif : afficher le message avec une action de fermeture, une durée de 6000 ms et une classe d’erreur.
    // Justification : le temps supplémentaire et le contraste visuel donnent la priorité à l’information critique.
    this.snackBar.open(message, 'Fermer', {
      duration: 6000,
      panelClass: ['lab-snackbar', 'lab-snackbar--error'],
    });
  }

  fromError(error: unknown, fallback: string): void {
    this.error(toErrorMessage(error, fallback));
  }
}
