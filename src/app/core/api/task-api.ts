// [Angular — Imports Angular] `HttpClient`
// Contexte : cette classe centralise les requêtes HTTP liées aux tâches.
// Objectif : importer le client HTTP Angular chargé d’exécuter les verbes HTTP.
// Justification : il offre des réponses typées sans introduire une abstraction réseau supplémentaire.
import { HttpClient } from '@angular/common/http';

// [Angular — Imports Angular] `inject`
// Contexte : le client est construit par l’injecteur Angular.
// Objectif : importer la fonction d’injection moderne utilisable dans un initialiseur de champ.
// Justification : elle évite de recopier les dépendances dans un constructeur.

// [Angular — Imports Angular] `Injectable`
// Contexte : les stores consomment `TaskApi` sans l’instancier eux-mêmes.
// Objectif : importer le décorateur qui rend la classe éligible à l’injection.
// Justification : Angular peut ainsi appliquer la portée et le cycle de vie configurés.
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTaskRequest, Task, UpdateTaskRequest } from '../models/task.model';
import { LAB_API_URL } from './lab-api.tokens';

// [Angular — Décorateurs] `@Injectable`
// Contexte : toutes les opérations HTTP de cette classe sont orchestrées par Angular.
// Objectif : marquer puis exporter le client comme injectable.
// Justification : les appelants reçoivent la même abstraction sans connaître son implémentation.
@Injectable({
  // [Angular — Portée de providers] `providedIn: 'root'`
  // Contexte : cette couche API ne dépend d’aucun composant particulier.
  // Objectif : fournir automatiquement le service depuis l’injecteur d’environnement racine.
  // Justification : le client est partagé dans tout l’arbre sans configuration manuelle répétée.
  providedIn: 'root',
})
export class TaskApi {
  // [Angular — Injection de dépendances] `inject(HttpClient)`
  // Contexte : les méthodes publiques doivent seulement décrire les ressources concernées.
  // Objectif : injecter le client HTTP Angular au moment de la construction du service.
  // Justification : le transport, la désérialisation et les erreurs HTTP restent centralisés.
  private readonly http = inject(HttpClient);

  // [Angular — Injection de dépendances] `inject(LAB_API_URL)`
  // Contexte : les routes de tâches reposent toutes sur la même URL configurable.
// Objectif : obtenir la valeur strongly typée fournie pour le token `LAB_API_URL`.
// Justification : aucune adresse d’API n’est figée dans cette classe.
  private readonly apiUrl = inject(LAB_API_URL);

  // [Angular — HTTP] `this.http.get<readonly Task[]>(...)`
  // Contexte : le store charge les tâches d’un projet sélectionné.
  // Objectif : envoyer une requête GET et produire un tableau immuable de tâches typé.
  // Justification : le générique rend la collection exploitable sans conversion manuelle.
  getTasks(projectId: string): Observable<readonly Task[]> {
    return this.http.get<readonly Task[]>(`${this.apiUrl}/projects/${projectId}/tasks`);
  }

  // [Angular — HTTP] `this.http.post<Task>(...)`
  // Contexte : une tâche doit être créée dans le projet courant.
  // Objectif : envoyer la charge utile avec POST et typer la ressource créée.
// Justification : la distinction HTTP crée la ressource et expose le modèle persisté à l’orchestrateur.
  createTask(projectId: string, request: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/projects/${projectId}/tasks`, request);
  }

  // [Angular — HTTP] `this.http.patch<Task>(...)`
  // Contexte : une modification partielle ne doit pas remplacer toute la tâche.
// Objectif : envoyer uniquement les champs modifiés avec PATCH et typer la tâche retournée.
// Justification : la sémantique HTTP préserve les propriétés absentes de la requête.
  updateTask(taskId: string, request: UpdateTaskRequest): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${taskId}`, request);
  }

  // [Angular — HTTP] `this.http.delete<void>(...)`
  // Contexte : une tâche est supprimée sans corps utile à exploiter.
// Objectif : envoyer une requête DELETE et attendre une réponse typée `void`.
// Justification : `void` indique qu’aucune ressource de résultat n’est nécessaire après la suppression.
  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${taskId}`);
  }
}
