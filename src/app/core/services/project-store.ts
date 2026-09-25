// [Angular — Imports Angular] `computed`
// Contexte : plusieurs vues de la liste de projets sont dérivées de son état.
// Objectif : importer l’API Angular de calcul d’état réactif.
// Justification : les résultats peuvent être mémoïsés et invalidés selon leurs signaux lus.

// [Angular — Imports Angular] `DestroyRef`
// Contexte : les abonnements HTTP doivent suivre la durée de vie du store.
// Objectif : importer la poignée de destruction fournie par Angular.
// Justification : elle permet de relier explicitement l’abonnement au contexte propriétaire.

// [Angular — Imports Angular] `inject`
// Contexte : le store reçoit ses dépendances depuis l’injecteur.
// Objectif : importer la fonction d’injection utilisée dans ses initialiseurs de champ.
// Justification : elle évite un constructeur manuel tout en conservant le contexte d’injection.

// [Angular — Imports Angular] `Injectable`
// Contexte : l’application doit fournir un point unique d’orchestration des projets.
// Objectif : importer le décorateur qui déclare cette classe injectable.
// Justification : Angular peut alors créer le store avec toutes ses dépendances.

// [Angular — Imports Angular] `signal`
// Contexte : les données, l’état de chargement, l’erreur et la sélection évoluent ensemble.
// Objectif : importer l’API de création d’état réactif Angular.
// Justification : chaque état peut être invalidé et observé indépendamment.
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';

// [Angular — Interopérabilité RxJS] `takeUntilDestroyed`
// Contexte : une réponse HTTP pourrait notifier le store après sa destruction.
// Objectif : importer l’opérateur Angular qui lie un Observable à un `DestroyRef`.
// Justification : il transforme le cycle de vie Angular en désabonnement de la source.
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectApi } from '../api/project-api';
import { LoadState } from '../models/load-state.model';
import { Project } from '../models/project.model';
import { toErrorMessage } from '../utils/http-error';

// [Angular — Décorateurs] `@Injectable`
// Contexte : le store orchestre les données sans être créé manuellement par ses vues.
// Objectif : marquer puis exporter la classe comme injectable.
// Justification : les composants et tests accèdent à l’orchestrateur via Angular.
@Injectable({
  // [Angular — Portée de providers] `providedIn: 'root'`
  // Contexte : cet orchestrateur coordonne l’état des projets pour l’application entière.
  // Objectif : fournir automatiquement la classe depuis l’injecteur d’environnement racine.
  // Justification : les vues et services imbriqués partagent une source d’état unique et cohérente.
  providedIn: 'root',
})
export class ProjectStore {
  // [Angular — Injection de dépendances] `inject(ProjectApi)`
  // Contexte : le store doit charger des projets sans construire lui-même le client HTTP.
  // Objectif : recevoir le client typé depuis l’injecteur.
// Justification : l’orchestration est découplée des URLs et des observables HTTP.
  private readonly api = inject(ProjectApi);

  // [Angular — Cycle de vie et injection] `inject(DestroyRef)`
  // Contexte : le store racine possède le chargement HTTP à travers toute la vie de l’application.
// Objectif : injecter le handle de destruction du contexte qui fournit réellement le store.
// Justification : cette portée explicite relie les annulations à l’injecteur racine, pas à un composant appelant.
  private readonly destroyRef = inject(DestroyRef);

  // [Angular — Signals — création] `signal` (`projectsState`, `loadStateState`, `errorMessageState`, `selectedProjectIdState`)
  // Contexte : quatre facets distincts décrivent la collection, son chargement, son erreur et sa sélection.
  // Objectif : initialiser consecutively ces quatre signaux avec des valeurs de départ privées et typées.
  // Justification : des signaux séparés permettent des mises à jour ciblées tout en conservant la réactivité Angular.
  private readonly projectsState = signal<readonly Project[]>([]);
  private readonly loadStateState = signal<LoadState>('idle');
  private readonly errorMessageState = signal<string | null>(null);
  private readonly selectedProjectIdState = signal<string | null>(null);
  private requestVersion = 0;

  // [Angular — Signals — état readonly] `asReadonly` (`projects`, `loadState`, `errorMessage`, `selectedProjectId`)
  // Contexte : les vues doivent lire l’état public sans pouvoir le réinitialiser ou le modifier arbitrairement.
  // Objectif : exposer consecutively les quatre signaux sous une forme dépourvue de méthodes d’écriture.
// Justification : seules les méthodes du store peuvent faire évoluer l’état et préserver ses invariants.
  readonly projects = this.projectsState.asReadonly();
  readonly loadState = this.loadStateState.asReadonly();
  readonly errorMessage = this.errorMessageState.asReadonly();
  readonly selectedProjectId = this.selectedProjectIdState.asReadonly();

  // [Angular — Signals — état dérivé] `computed`, `projectsState()`, `selectedProjectIdState()`
  // Contexte : la sélection change avec la liste ou l’identifiant choisi.
  // Objectif : calculer la projet sélectionnée, ou `null`, à partir des deux signaux privés lus.
// Justification : Angular ne recalcule ce résultat que lorsque l’une de ces dépendances change.
  readonly selectedProject = computed(
    () =>
      this.projectsState().find((project) => project.id === this.selectedProjectIdState()) ?? null,
  );

  // [Angular — Signals — état dérivé] `computed`, `projectsState()`
  // Contexte : le tableau dUNICATEUR? no.
  // Objectif : compter uniquement les projets actifs à partir de la collection courante.
  // Justification : la valeur reste automatiquement synchronisée sans champ mutable supplémentaire.
  readonly activeProjectCount = computed(
    () => this.projectsState().filter((project) => project.status === 'active').length,
  );

  // [Angular — Signals — état dérivé] `computed`, `projectsState()`
  // Contexte : le nombre de projets terminés dépend de la même collection que le compteur actif.
  // Objectif : produire ce second indicateur avec un calcul mémoïsé indépendant.
  // Justification : sa dépendance explicite permet à Angular de l’invalider seulement lorsque la liste change.
  readonly completedProjectCount = computed(
    () => this.projectsState().filter((project) => project.status === 'completed').length,
  );

  // [Angular — Signals — état dérivé] `computed`, `projectsState()`
  // Contexte : le total est une autre projection de la liste des projets.
  // Objectif : dériver la longueur de la collection en lisant le signal source.
// Justification : il ne peut pas diverger du tableau exposé et ne nécessite aucune synchronisation manuelle.
  readonly totalProjectCount = computed(() => this.projectsState().length);

  loadProjects(): void {
    // [Angular — Signals — lecture] `this.loadStateState()`
    // Contexte : un chargement est déjà en cours.
    // Objectif : lire l’état courant par invocation du signal avant d’accepter une nouvelle requête.
    // Justification : ce garde évite les chargements concurrents et les réponses qui se concurrencent.
    if (this.loadStateState() === 'loading') {
      return;
    }

    // La version identifie la requête courante afin qu’une réponse tardive ne puisse pas écraser un état plus récent.
    const requestVersion = ++this.requestVersion;

    // [Angular — Signals — écriture] `.set` (`loadStateState`, `errorMessageState`)
    // Contexte : un nouveau chargement commence et l’ancienne erreur n’est plus valide.
    // Objectif : affecter consécutivement l’état `loading` et effacer le message précédent.
    // Justification : les vues observent immédiatement un état cohérent pour cette nouvelle tentative.
    this.loadStateState.set('loading');
    this.errorMessageState.set(null);

    this.api
      .getProjects()
      // [Angular — Interopérabilité RxJS et cycle de vie] `takeUntilDestroyed(this.destroyRef)`
      // Contexte : la réponse HTTP appartient au store racine et ne doit pas notifier après sa destruction.
      // Objectif : terminaison l’abonnement lors de la destruction du `DestroyRef` injecté.
      // Justification : les rappels HTTP ne peuvent plus écrire dans un store détruit.
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (projects) => {
          // Concurrence : seules les réponses correspondant à la version la plus récente modifient l’état.
          if (requestVersion !== this.requestVersion) {
            return;
          }

          // [Angular — Signals — écriture] `.set` (`projectsState`, `loadStateState`)
          // Contexte : la requête courante a réussi et peut être vide ou remission des données.
          // Objectif : écrire consécutivement la collection et l’état `empty` ou `success` correspondant.
          // Justification : données et état d’avancement deviennent visibles dans la même réaction Angular.
          this.projectsState.set(projects);
          this.loadStateState.set(projects.length === 0 ? 'empty' : 'success');
        },
        error: (error: unknown) => {
          // Concurrence : la même règle de version protège aussi la sortie d’erreur contre une réponse tardive.
          if (requestVersion !== this.requestVersion) {
            return;
          }

          // [Angular — Signals — écriture] `.set` (`errorMessageState`, `loadStateState`)
          // Contexte : la requête courante a échoué et l’erreur HTTP doit être normalisée.
          // Objectif : affecter consécutivement le message et l’état `error`.
          // Justification : la vue reçoit une cause affichable sans laisser croire au succès.
          this.errorMessageState.set(toErrorMessage(error, 'Impossible de charger les projets.'));
          this.loadStateState.set('error');
        },
      });
  }

  // [Angular — Signals — écriture] `.set` (`selectedProjectIdState`)
  // Contexte : l’utilisateur sélectionne un projet ou efface sa sélection.
  // Objectif : écrire l’identifiant, éventuellement `null`, dans le signal privé.
  // Justification : `selectedProject` et `selectedProjectId` en reflètent immédiatement la nouvelle valeur.
  selectProject(projectId: string | null): void {
    this.selectedProjectIdState.set(projectId);
  }
}
