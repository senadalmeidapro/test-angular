# Flux de données

## Bootstrap et injection

```mermaid
sequenceDiagram
  actor Browser as Navigateur
  participant Main as main.ts
  participant Bootstrap as bootstrapApplication
  participant Config as appConfig
  participant Router as Router
  participant Http as HttpClient

  Browser->>Main: charge index.html
  Main->>Main: registerLocaleData(fr)
  Main->>Bootstrap: bootstrapApplication(App, appConfig)
  Bootstrap->>Config: lit les providers
  Config->>Router: configure les routes
  Config->>Http: installe HttpClient
  Config->>Config: fournit LAB_API_URL = /api
  Bootstrap-->>Browser: rend le shell
```

## Chargement d’une page projet

```mermaid
sequenceDiagram
  actor User as Utilisateur
  participant Page as ProjectPage
  participant Route as ActivatedRoute
  participant PS as ProjectStore
  participant TS as TaskStore
  participant API as HttpClient
  participant Server as Express

  User->>Page: ouvre /projects/project-portal
  Page->>Route: lit projectId
  Page->>PS: selectProject(projectId)
  Page->>PS: loadProjects() si idle
  Page->>TS: loadTasks(projectId)
  par Projet
    PS->>API: GET /api/projects
    API->>Server: requête proxifiée
    Server-->>PS: Project[]
    PS->>PS: state = success
  and Tâches
    TS->>API: GET /api/projects/:id/tasks
    API->>Server: requête proxifiée
    Server-->>TS: Task[]
    TS->>TS: state = success ou empty
  end
  Page->>Page: computed KPI et tâches filtrées
```

Les requêtes sont parallèles. `ProjectPage` attend un projet connu et un état terminal des tâches avant de présenter le contenu.

## États de chargement

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> loading: loadProjects/loadTasks
  loading --> success: réponse non vide ou ressource
  loading --> empty: tableau vide
  loading --> error: erreur HTTP/réseau
  error --> loading: retry
  success --> loading: refresh
  empty --> loading: refresh
```

`success` ne signifie pas « une requête est terminée » mais « une donnée exploitable est disponible ». `empty` est une réponse valide qui ne produit aucun element.

## Recherche

```mermaid
flowchart LR
  Input[Input searchTerm] --> Model[model Signal]
  Model --> Observable[toObservable]
  Observable --> Debounce[debounceTime 250]
  Debounce --> Distinct[distinctUntilChanged]
  Distinct --> Debounced[Signal debouncedSearch]
  Debounced --> Computed[computed filteredTasks]
  Status[statusFilter] --> Computed
  Store[Tâches du TaskStore] --> Computed
  Computed --> Table[TaskTable]
  Computed --> Count[Nombre de résultats]
```

Le Signal de recherche est mis à jour à chaque frappe, mais le filtre coûteux n’est recalculé qu’après 250 ms sans nouvelle valeur.

## Création d’une tâche

```mermaid
sequenceDiagram
  actor User as Utilisateur
  participant Page as ProjectPage
  participant Dialog as TaskEditorDialog
  participant Store as TaskStore
  participant API as TaskApi
  participant Server as Express

  User->>Page: Nouvelle tâche
  Page->>Dialog: open(data)
  User->>Dialog: saisit le formulaire
  Dialog->>Dialog: valide les contrôles et le FormGroup
  User->>Dialog: submit
  Dialog-->>Page: TaskEditorValue
  Page->>Page: mappe le formulaire vers CreateTaskRequest
  Page->>Store: createTask(projectId, request)
  Store->>Store: pendingTaskIds += create:projectId
  Store->>API: POST /api/projects/:id/tasks
  API->>Server: JSON validé
  Server-->>API: Task créée
  API-->>Store: Task
  Store->>Store: ajoute si le projet est toujours actif
  Store-->>Page: finalize
  Page->>User: SnackBar de succès
```

Une réponse de création arrivée après navigation vers un autre projet est ignorée par `TaskStore`. Cela évite d’insérer la tâche dans la vue du nouveau projet.

## Mise à jour et suppression

```mermaid
sequenceDiagram
  actor User as Utilisateur
  participant Table as TaskTable
  participant Page as ProjectPage
  participant Store as TaskStore
  participant API as TaskApi

  alt Changement de statut ou checkbox
    User->>Table: sélectionne un statut
    Table-->>Page: TaskStatusChange
  else Édition
    User->>Page: demande une modification
    Page->>Page: ouvre TaskEditorDialog
  end
  Page->>Store: updateTask(taskId, patch)
  Store->>Store: compte pending pour taskId
  Store->>API: PATCH /api/tasks/:taskId
  API-->>Store: Task mise à jour
  Store->>Store: remplace l’objet dans tasks
  Store-->>Page: pending libéré
  Page-->>User: notification

  opt Suppression
    User->>Page: demande une suppression
    Page->>Page: ouvre ConfirmDialog
    Page->>Store: deleteTask(taskId)
    Store->>API: DELETE /api/tasks/:taskId
    API-->>Store: 204
    Store->>Store: retire la tâche
  end
```

Les mutations concurrentes sur une même tâche sont comptées. La première réponse ne retire pas prematurely le marqueur pending de la seconde.

## Normalisation d’erreur

```mermaid
flowchart TD
  Error[Erreur inconnue] --> IsHttp{HttpErrorResponse ?}
  IsHttp -- Non --> Fallback[Fallback du caller]
  IsHttp -- Oui --> Status0{Status 0 ?}
  Status0 -- Oui --> ApiDown[Message « API indisponible »]
  Status0 -- Non --> Body{JSON message non vide ?}
  Body -- Oui --> ApiMessage[Message métier]
  Body -- Non --> Status404{Status 404 ?}
  Status404 -- Oui --> Missing[Ressource absente]
  Status404 -- Non --> ServerError{Status >= 500 ?}
  ServerError -- Oui --> GenericServer[Message serveur générique]
  ServerError -- Non --> HttpMessage[Message HttpClient]
```

## Conversion Observable vers Signal

```mermaid
flowchart LR
  UserApi[UserApi.getUsers] --> Observable[Observable utilisateur]
  Observable --> Map[map vers LoadStateSnapshot]
  Map --> Catch[catchError vers état error]
  Catch --> Start[startWith loading]
  Start --> ToSignal[toSignal]
  ToSignal --> Computed[users/loadState/errorMessage]
  Computed --> Template[Dashboard et ProjectPage]
```

## Préférences persistées

```mermaid
sequenceDiagram
  participant Store as WorkspacePreferencesStore
  participant Effect as Angular effect
  participant LS as localStorage

  Store->>LS: readStoredDensity()
  LS-->>Store: comfortable ou compact
  Store->>Effect: créé à l’injection
  User->>Store: toggleDensity()
  Store->>Store: met à jour le Signal
  Effect->>LS: setItem(density)
```
