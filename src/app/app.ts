import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { WorkspacePreferencesStore } from './core/services/workspace-preferences.store';

// [Angular — Composants] `@Component`
// Contexte : cette classe définit le shell racine de l’application.
// Objectif : déclarer un composant Angular et son template.
// Justification : le décorateur relie la classe au DOM, à la détection de changement et au rendu Angular.
@Component({
  selector: 'app-root',

  // [Angular — Composants] `imports`
  // Contexte : le shell rend des composants Material et des directives de routage.
  // Objectif : déclarer les dépendances du template dans un composant standalone.
  // Justification : ces directives doivent être connues du compilateur pour être utilisées dans `app.html`.
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],

  // [Angular — Composants] `templateUrl`
  // Contexte : la structure du shell est volumineuse et possède son propre fichier.
  // Objectif : externaliser le template HTML déclaré par `@Component`.
  // Justification : la séparation favorise la lisibilité et permet de garder la classe centrée sur son état.
  templateUrl: './app.html',

  // [Angular — Composants] `styleUrl`
  // Contexte : les styles du shell sont maintenus dans un fichier dédié.
  // Objectif : associer une feuille de style encapsulée au composant.
  // Justification : Angular isole ces styles avec le même cycle de vie que le template.
  styleUrl: './app.scss',

  // [Angular — Changement de détection] `ChangeDetectionStrategy.OnPush`
  // Contexte : le shell lit surtout des Signals etdelegue le contenu au routeur.
  // Objectif : limiter les vérifications aux entrées qui changent effectivement.
  // Justification : cette stratégie évite de parcourir inutilement tout le shell lors des mises à jour ponctuelles.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // [Angular — Injection] `inject`
  // Contexte : les préférences de densité sont un service partagé par le shell.
  // Objectif : résoudre `WorkspacePreferencesStore` dans le contexte de la classe.
  // Justification : l’injection par token évite de créer une dépendance manuelle ou un constructeur superflu.
  protected readonly preferences = inject(WorkspacePreferencesStore);
}
