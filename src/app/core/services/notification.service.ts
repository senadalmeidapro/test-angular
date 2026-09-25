import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { toErrorMessage } from '../utils/http-error';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3500,
      panelClass: ['lab-snackbar', 'lab-snackbar--success'],
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 6000,
      panelClass: ['lab-snackbar', 'lab-snackbar--error'],
    });
  }

  fromError(error: unknown, fallback: string): void {
    this.error(toErrorMessage(error, fallback));
  }
}
