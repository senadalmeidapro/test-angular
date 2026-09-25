import { HttpErrorResponse } from '@angular/common/http';

export function toErrorMessage(error: unknown, fallback: string): string {
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
