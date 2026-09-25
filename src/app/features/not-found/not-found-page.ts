import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  template: `
    <section class="page-shell">
      <mat-card class="not-found">
        <mat-icon>explore_off</mat-icon>
        <p class="eyebrow">Erreur 404</p>
        <h1>Cette page n’existe pas</h1>
        <p>Le routeur ne trouve aucune feature associée à cette URL.</p>
        <a matButton="filled" routerLink="/dashboard">Retour au dashboard</a>
      </mat-card>
    </section>
  `,
  styles: `
    .not-found {
      display: grid;
      min-height: 28rem;
      place-items: center;
      align-content: center;
      gap: 0.75rem;
      padding: 2rem;
      text-align: center;
    }

    mat-icon {
      width: 4rem;
      height: 4rem;
      font-size: 4rem;
      color: var(--mat-sys-primary);
    }

    h1,
    p {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
