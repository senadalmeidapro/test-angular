// [Angular — Imports Angular] `DOCUMENT`
// Contexte : la persistance est facultative et ne doit pas supposer un DOM navigateur global.
// Objectif : importer le jeton Angular qui fournit le document de la plateforme courante.
// Justification : l’injecteur peut choisir une implémentation adaptée au rendu serveur ou aux tests.
import { DOCUMENT } from '@angular/common';

// [Angular — Imports Angular] `computed`
// Contexte : le mode compact est une valeur booléenne dérivée de la densité.
// Objectif : importer l’API de calcul réactif Angular.
// Justification : le résultat est synchronisé automatiquement avec la densité source.

// [Angular — Imports Angular] `effect`
// Contexte : le service doit répercuter un changement d’état dans le stockage local.
// Objectif : importer l’API d’effet qui suit les lectures de signaux.
// Justification : l’écriture impérative peut être exécutée et détruite avec le contexte d’injection.

// [Angular — Imports Angular] `inject`
// Contexte : le document est une dépendance de plateforme, pas une variable globale.
// Objectif : importer la fonction d’injection utilisée dans l’initialiseur de champ.
// Justification : elle permet de substituer le document pendant les tests.

// [Angular — Imports Angular] `Injectable`
// Contexte : les préférences d’espace de travail sont partagées par les écrans.
// Objectif : importer le décorateur qui déclare la classe injectable.
// Justification : les composants reçoivent la même politique de densité.

// [Angular — Imports Angular] `signal`
// Contexte : la densité est l’état source de la préférence et de sa persistance.
// Objectif : importer l’API de création d’état réactif.
// Justification : ses changements peuvent déclencher les vues et l’effet de sauvegarde.
import { computed, effect, inject, Injectable, signal } from '@angular/core';

export type WorkspaceDensity = 'comfortable' | 'compact';

const STORAGE_KEY = 'angular-lab.workspace-density';

// [Angular — Décorateurs] `@Injectable`
// Contexte : la préférence concerne tout le workspace, pas une page isolée.
// Objectif : marquer puis exporter le store comme injectable.
// Justification : son état et son effet sont gérés une seule fois.
@Injectable({
  // [Angular — Portée de providers] `providedIn: 'root'`
  // Contexte : tous les composants doivent observer la même densité.
  // Objectif : enregistrer la classe dans l’injecteur d’environnement racine.
  // Justification : la préférence reste cohérente dans toute l’application et jusqu’à sa destruction.
  providedIn: 'root',
})
export class WorkspacePreferencesStore {
  // [Angular — Injection de dépendances] `inject(DOCUMENT)`
  // Contexte : `localStorage` doit être accédé via le document fourni par la plateforme.
// Objectif : injecter le document Angular au lieu d’utiliser `window` directement.
// Justification : le code peut fonctionner sous SSR, où le document peut ne pas exposer de fenêtre.
  private readonly document = inject(DOCUMENT);

  // [Angular — Signals — création] `signal` (`densityState`)
  // Contexte : la préférence commence confortablement avant la lecture de la valeur persistée.
  // Objectif : créer un signal privé typé qui détiendra la densité courante.
// Justification : ce signal privé est la source unique des vues, de l’effet et du bouton de bascule.
  private readonly densityState = signal<WorkspaceDensity>('comfortable');

  // [Angular — Signals — état readonly] `asReadonly` (`density`)
  // Contexte : les composants doivent consulter la préférence sans la réécrire.
// Objectif : exposer le signal source sous une forme sans `set` ni `update`.
// Justification : la modification reste centralisée dans la méthode dédiée du store.
  readonly density = this.densityState.asReadonly();

  // [Angular — Signals — état dérivé] `computed`, `densityState()`
  // Contexte : de nombreuses vues ont besoin de savoir si la densité est compacte.
// Objectif : comparer la densité lue à `'compact'` et produire un booléen mémoïsé.
// Justification : la valeur ne peut pas diverger de la préférence dont elle est dérivée.
  readonly isCompact = computed(() => this.densityState() === 'compact');

  constructor() {
    const storedDensity = this.readStoredDensity();
    if (storedDensity) {
      // [Angular — Signals — écriture] `.set` (`densityState`)
      // Contexte : une préférence valide a été retrouvée dans le stockage.
      // Objectif : remplacer la valeur initiale par la densité persistée.
      // Justification : le signal et ses projections utilisent immédiatement la préférence de l’utilisateur.
      this.densityState.set(storedDensity);
    }

    // [Angular — Signals — effets] `effect`, `densityState()`
    // Contexte : `localStorage` est une API impérative du navigateur : c’est un effet, pas un état dérivé.
    // Objectif : suivre la lecture de `densityState()` et réécrire le stockage à chaque changement.
    // Justification : l’effet est créé dans le contexte d’injection du constructeur, donc il est associé au `DestroyRef` du store et nettoyé avec lui.
    effect(() => this.writeStoredDensity(this.densityState()));
  }

  // [Angular — Signals — écriture] `.update` (`densityState`)
  // Contexte : l’utilisateur demande le basculement entre les deux densités.
  // Objectif : calculer la nouvelle valeur à partir de la précédente puis l’écrire atomiquement.
  // Justification : les vues, le mode compact et l’effet de persistance restent synchronisés.
  toggleDensity(): void {
    this.densityState.update((density) => (density === 'comfortable' ? 'compact' : 'comfortable'));
  }

  private readStoredDensity(): WorkspaceDensity | null {
    try {
      const value = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return value === 'compact' || value === 'comfortable' ? value : null;
    } catch {
      return null;
    }
  }

  private writeStoredDensity(density: WorkspaceDensity): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, density);
    } catch {
      return;
    }
  }
}
