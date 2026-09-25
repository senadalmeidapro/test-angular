import { HttpErrorResponse } from '@angular/common/http';
import { toErrorMessage } from './http-error';

describe('toErrorMessage', () => {
  const fallback = 'Erreur de secours.';

  it('utilise le fallback pour une erreur non HTTP', () => {
    expect(toErrorMessage(new Error('Panne'), fallback)).toBe(fallback);
  });

  it('donne une consigne dédiée lorsque le statut est zéro', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(toErrorMessage(error, fallback)).toContain('start:api');
  });

  it('privilégie le message métier de l’API', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: { message: 'La charge utile est invalide.' },
      statusText: 'Unprocessable Entity',
    });

    expect(toErrorMessage(error, fallback)).toBe('La charge utile est invalide.');
  });

  it('ignore un message API vide', () => {
    const error = new HttpErrorResponse({
      status: 404,
      error: { message: '   ' },
      statusText: 'Not Found',
    });

    expect(toErrorMessage(error, fallback)).toBe("La ressource demandée n'existe pas.");
  });

  it('traduit les erreurs serveur', () => {
    const error = new HttpErrorResponse({ status: 503, statusText: 'Service Unavailable' });

    expect(toErrorMessage(error, fallback)).toBe(
      'Le serveur a rencontré une erreur. Réessayez dans quelques instants.',
    );
  });

  it('retombe sur le message HttpClient pour les autres erreurs', () => {
    const error = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });

    expect(toErrorMessage(error, fallback)).toContain('400 Bad Request');
  });
});
