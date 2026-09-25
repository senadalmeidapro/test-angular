// [Angular — Imports Angular] `HttpErrorResponse`
// Contexte : cette fonction transforme les rejets des clients HTTP en messages affichables.
// Objectif : importer la classe Angular qui représente une réponse HTTP en erreur.
// Justification : elle permet de distinguer une erreur HTTP d’une exception inconnue avant d’en lire les détails.
import { HttpErrorResponse } from '@angular/common/http';

export function toErrorMessage(error: unknown, fallback: string): string {
  // [Angular — HTTP — gestion des erreurs] `error instanceof HttpErrorResponse`, `error.status`, `error.error`, `error.message`
  // Contexte : un appel peut rejeter avec une valeur inconnue, mais `HttpClient` produit normalement cette classe d’erreur.
  // Objectif : vérifier le type, puis consulter `status`, le corps `error` et le message selon le cas.
  // Justification : ce test de type protège les accès aux propriétés et permet un message cohérent sans exposer de détail technique brutal.
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return "L'API locale est indisponible. Démarrez-la avec « npm run start:api ».";
  }

  if (typeof error.error === 'object' && error.error !== null && 'message' in error.error) {
    const apiMessage: unknown = error.error.message;
    if (typeof apiMessage === 'string' && apiMessage.trim()) {
      return apiMessage;
    }
  }

  if (error.status === 404) {
    return "La ressource demandée n'existe pas.";
  }

  if (error.status >= 500) {
    return 'Le serveur a rencontré une erreur. Réessayez dans quelques instants.';
  }

  return error.status > 0 ? error.message : fallback;
}
