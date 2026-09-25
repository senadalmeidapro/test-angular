// [Angular — Imports Angular] `HttpClient`
// Contexte : cette classe centralise les requêtes HTTP liées aux projets.
// Objectif : importer le client HTTP Angular qui exécutera les requêtes.
// Justification : il fournit les verbes HTTP avec leur réponse typée sans imposer de couche réseau supplémentaire.
import { HttpClient } from '@angular/common/http';

// [Angular — Imports Angular] `inject`
// Contexte : les dépendances sont résolues directement dans le contexte d’instanciation.
// Objectif : importer la fonction Angular d’injection sans constructeur explicite.
// Justification : elle conserve l’initialisation des propriétés concise et liée à l’injecteur.

// [Angular — Imports Angular] `Injectable`
// Contexte : Angular doit pouvoir fournir `ProjectApi` aux stores et composants.
// Objectif : importer le décorateur qui déclare la classe comme injectable.
// Justification : cette métadonnée autorise l’injecteur à construire le client de façon cohérente.
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';
import { LAB_API_URL } from './lab-api.tokens';

// [Angular — Décorateurs] `@Injectable`
// Contexte : les appelants obtiennent le client API par injection de dépendances.
// Objectif : marquer la classe Angular comme instanciable par l’injecteur.
// Justification : cette stratégie évite la création manuelle du client dans chaque orchestrateur.
@Injectable({
  // [Angular — Portée de providers] `providedIn: 'root'`
  // Contexte : le client n’a pas d’état propre et doit être partagé dans l’application.
  // Objectif : enregistrer automatiquement la classe dans l’injecteur d’environnement racine.
  // Justification : une seule instance est réutilisée dans tout son arbre, sans.provider supplémentaire.
  providedIn: 'root',
})
export class ProjectApi {
  // [Angular — Injection de dépendances] `inject(HttpClient)`
  // Contexte : cette classe delegue les transports et les erreurs HTTP à Angular.
  // Objectif : recevoir le client HTTP typé depuis l’injecteur courant.
  // Justification : les URLs et les observables restent isolés dans la couche API.
  private readonly http = inject(HttpClient);

  // [Angular — Injection de dépendances] `inject(LAB_API_URL)`
  // Contexte : l’adresse du laboratoire doit rester configurable.
  // Objectif : résoudre la valeur de type `string` associée au token Angular.
  // Justification : le client ne dépend pas d’une URL concrète et reste facile à tester ou reconfigurer.
  private readonly apiUrl = inject(LAB_API_URL);

  // [Angular — HTTP] `this.http.get<readonly Project[]>(...)`
  // Contexte : le store demande la collection complète des projets.
  // Objectif : envoyer une requête GET et typer le résultat comme un tableau immuable de projets.
  // Justification : le type générique protège l’orchestrateur contre une réponse HTTP mal modélisée.
  getProjects(): Observable<readonly Project[]> {
    return this.http.get<readonly Project[]>(`${this.apiUrl}/projects`);
  }

  // [Angular — HTTP] `this.http.get<Project>(...)`
  // Contexte : un appelant cible un projet précis avec son identifiant.
  // Objectif : envoyer une autre requête GET dont la réponse est typée comme `Project`.
// Justification : la même infrastructure HTTP sert la collection et la ressource individuelle.
  getProject(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/projects/${projectId}`);
  }
}
