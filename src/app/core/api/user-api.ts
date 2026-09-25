// [Angular — Imports Angular] `HttpClient`
// Contexte : cette API encapsule l’accès HTTP à la collection des utilisateurs.
// Objectif : importer le client HTTP Angular qui exécutera la requête.
// Justification : il fournit la réponse typée et le traitement HTTP standard.
import { HttpClient } from '@angular/common/http';

// [Angular — Imports Angular] `inject`
// Contexte : le client reçoit ses dépendances dans le contexte Angular qui l’instancie.
// Objectif : importer la fonction d’injection utilisable sans constructeur.
// Justification : elle simplifie l’initialisation tout en conservant une portée explicite.

// [Angular — Imports Angular] `Injectable`
// Contexte : `UserStore` doit obtenir cette couche API par l’injecteur.
// Objectif : importer le décorateur qui déclare la classe injectable.
// Justification : Angular peut ainsi construire et partager le client selon la portée choisie.
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { LAB_API_URL } from './lab-api.tokens';

// [Angular — Décorateurs] `@Injectable`
// Contexte : aucun appelant ne doit instancier directement le client HTTP.
// Objectif : marquer puis exporter la classe comme injectable.
// Justification : cette classe devient un contrat d’accès indépendant du store.
@Injectable({
  // [Angular — Portée de providers] `providedIn: 'root'`
  // Contexte : la lecture des utilisateurs est commune à l’application et sans état mutable local.
// Objectif : enregistrer la classe dans l’injecteur d’environnement racine.
// Justification : une instance unique peut être réutilisée sans fournir le service à chaque composant.
  providedIn: 'root',
})
export class UserApi {
  // [Angular — Injection de dépendances] `inject(HttpClient)`
  // Contexte : cette classe organise les données plutôt que la mécanique HTTP.
// Objectif : recevoir le client HTTP Angular depuis l’injecteur courant.
// Justification : les détails de transport restent confinés à la couche API.
  private readonly http = inject(HttpClient);

  // [Angular — Injection de dépendances] `inject(LAB_API_URL)`
  // Contexte : la route des utilisateurs doit venir de la configuration du laboratoire.
// Objectif : injecter la valeur de type `string` associée à `LAB_API_URL`.
// Justification : le point d’accès peut changer sans modifier cette classe.
  private readonly apiUrl = inject(LAB_API_URL);

  // [Angular — HTTP] `this.http.get<readonly User[]>(...)`
  // Contexte : le store attend tous les utilisateurs au démarrage.
// Objectif : exécuter GET avec une réponse immuable de `User` fortement typée.
// Justification : Angular désérialise la réponse et le générique garantit le contrat attendu par le store.
  getUsers(): Observable<readonly User[]> {
    return this.http.get<readonly User[]>(`${this.apiUrl}/users`);
  }
}
