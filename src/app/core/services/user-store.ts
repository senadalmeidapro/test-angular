// [Angular — Imports Angular] `computed`
// Contexte : plusieurs vues sont projetées depuis un même état de chargement utilisateur.
// Objectif : importer l’API Angular de calcul réactif.
// Justification : chaque vue peut être consommée comme un signal indépendant et mémoïsé.

// [Angular — Imports Angular] `inject`
// Contexte : le store doit recevoir la couche API depuis Angular.
// Objectif : importer la fonction d’injection utilisée dans un initialiseur de champ.
// Justification : elle évite une dépendance construite manuellement.

// [Angular — Imports Angular] `Injectable`
// Contexte : l’application fournit un store d’utilisateurs partagé.
// Objectif : importer le décorateur qui déclare la classe injectable.
// Justification : cette métadonnée permet à l’injecteur de créer le store.
import { computed, inject, Injectable } from '@angular/core';

// [Angular — Imports Angular] `toSignal`
// Contexte : la réponse d’utilisateurs est un Observable, mais l’interface du store est synchrone et réactive.
// Objectif : importer l’utilitaire Angular d’interopérabilité entre RxJS et Signals.
// Justification : il relie la durée de vie de l’abonnement au contexte d’injection.
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { UserApi } from '../api/user-api';
import { LoadStateSnapshot } from '../models/load-state.model';
import { User } from '../models/user.model';
import { toErrorMessage } from '../utils/http-error';

const initialState: LoadStateSnapshot<readonly User[]> = {
  state: 'loading',
  data: [],
  errorMessage: null,
};

// [Angular — Décorateurs] `@Injectable`
// Contexte : ce store orchestre l’unique chargement des utilisateurs de l’application.
// Objectif : marquer puis exporter la classe comme injectable.
// Justification : ses consommateurs n’ont pas à connaître la construction de son Observable interne.
@Injectable({
  // [Angular — Portée de providers] `providedIn: 'root'`
  // Contexte : les utilisateurs constituent un état transversal.
// Objectif : fournir automatiquement la classe dans l’injecteur d’environnement racine.
// Justification : tous les services et composants de cet environnement partagent le même abonnement et le même signal.
  providedIn: 'root',
})
export class UserStore {
  // [Angular — Injection de dépendances] `inject(UserApi)`
  // Contexte : le store transforme une réponse API en état de vue, sans construire le client lui-même.
  // Objectif : recevoir le client typé fourni par Angular.
// Justification : l’orchestration reste découplée du transport HTTP.
  private readonly api = inject(UserApi);

  // [Angular — Interopérabilité RxJS et Signals] `toSignal(...)`
  // Contexte : la chaîne RxJS produit success, empty ou error puis termine.
// Objectif : convertir sa dernière émission en signal privé consommable dans les vues.
// Justification : Angular synchronise l’abonnement avec le `DestroyRef` du store et évite un abonnement manuel oublié.
  private readonly state = toSignal(
    this.api.getUsers().pipe(
      map((users): LoadStateSnapshot<readonly User[]> => ({
        state: users.length === 0 ? 'empty' : 'success',
        data: users,
        errorMessage: null,
      })),
      catchError((error: unknown) =>
        of<LoadStateSnapshot<readonly User[]>>({
          state: 'error',
          data: [],
          errorMessage: toErrorMessage(error, 'Impossible de charger les utilisateurs.'),
        }),
      ),
      startWith(initialState),
    ),
    // [Angular — Interopérabilité RxJS et Signals — options] `{ initialValue: initialState }`
    // Contexte : une lecture peut avoir lieu avant la première émission de la source.
    // Objectif : fournir une valeur initiale déjà dans l’état `loading`.
    // Justification : le type du signal reste non nullable et aucune vue ne reçoit `undefined` pendant le chargement.
    { initialValue: initialState },
  );

  // [Angular — Signals — état dérivé] `computed`, `state()`
  // Contexte : les données utilisateur sont une projection de l’état composite.
  // Objectif : lire `state()` et retourner uniquement son champ `data`.
// Justification : le tableau exposé se recalcule seulement lorsque l’état HTTP change.
  readonly users = computed(() => this.state().data);

  // [Angular — Signals — état dérivé] `computed`, `state()`
  // Contexte : l’interface affiche un statut de chargement distinct des données.
// Objectif : dériver le champ `state` du même signal privé.
// Justification : le statut ne peut pas diverger de l’instantané qu’il décrit.
  readonly loadState = computed(() => this.state().state);

  // [Angular — Signals — état dérivé] `computed`, `state()`
  // Contexte : le message d’erreur eststocké dans l’instantané composite.
// Objectif : exposer uniquement son champ `errorMessage` comme signal calculé.
// Justification : la vue dépend d’une source unique et ne reçoit pas l’ensemble des détails internes.
  readonly errorMessage = computed(() => this.state().errorMessage);
}
