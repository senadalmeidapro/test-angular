# Concepts Angular 22

## Application standalone

`bootstrapApplication(App, appConfig)` démarre directement le component racine. Il n’existe ni `NgModule` applicatif ni module de feature. Chaque component déclare ses directives et pipes dans `imports`.

```ts
@Component({
  selector: 'app-stat-card',
  imports: [MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {}
```

Conséquences :

- dépendance visible au même endroit que le component ;
- tree-shaking plus précis ;
- tests plus simples avec `TestBed` ;
- pas de module de declare/export à maintenir.

## Control flow natif

Les templates utilisent `@if`, `@else if`, `@else`, `@for` et `@empty`.

```html
@for (project of projectStore.projects(); track project.id) {
<app-project-card [project]="project" />
} @empty {
<p>Aucun projet</p>
}
```

`track project.id` stabilise l’identité de chaque ligne. Une clé métier reste préférable à l’index lorsque l’item possède un identifiant.

## Signals

### État mutable

```ts
private readonly projectsState = signal<readonly Project[]>([]);
readonly projects = this.projectsState.asReadonly();
```

La façade en lecture seule empêche les composants de modifier l’état sans passer par l’opération métier du store.

### Valeur dérivée

```ts
readonly activeProjectCount = computed(
  () => this.projectsState().filter((project) => project.status === 'active').length,
);
```

`computed` est paresseux et mémoïsé tant que ses dépendances ne changent pas. Il ne remplace pas un simple appel lorsque ce coût est négligeable.

### Effet

`WorkspacePreferencesStore` utilise `effect` pour lire un Signal et écrire dans `localStorage`. Cette API impérative externe est un effet légitime ; un état dérivé ne doit pas être stocké ainsi.

### Conversion d’Observable

`UserStore` déclenche une requête une fois et convertit le résultat :

```ts
private readonly state = toSignal(
  this.api.getUsers().pipe(
    map((users) => ({ state: users.length ? 'success' : 'empty', data: users })),
    startWith(initialState),
  ),
  { initialValue: initialState },
);
```

## Input, output et model

- `input.required<T>()` représente une donnée obligatoire.
- `output<T>()` produit un événement vers le parent.
- `model<T>()` produit un modèle bidirectionnel.
- Les parents peuvent aussi faire `[(searchTerm)]="searchTerm"`.

```ts
readonly searchTerm = model('');
readonly filtersCleared = output<void>();
```

## Computed depuis une page

`ProjectPage` compose recherche, statut et tâches :

```ts
readonly filteredTasks = computed(() =>
  filterTasks(this.taskStore.tasks(), {
    query: this.debouncedSearch(),
    status: this.statusFilter(),
  }),
);
```

Le template ne connaît pas l’algorithme de filtrage. Il demande simplement la valeur courante.

## RxJS et Signals

Les deux modèles sont complémentaires :

- RxJS orchestre les flux, les erreurs, l’annulation et la combinaison ;
- Signals représentent l’état lu par les templates ;
- `toObservable` transforme un Signal en source pour `debounceTime` ;
- `toSignal` transforme un Observable en état lisible par un template.

```ts
private readonly searchChanges = toObservable(this.searchTerm);

constructor() {
  this.searchChanges
    .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed())
    .subscribe((query) => this.debouncedSearch.set(query));
}
```

`toObservable` doit être appelé dans un contexte d’injection, par exemple lors de l’initialisation d’un champ ou dans le constructeur.

## HTTP

Chaque API est spécialisée par ressource :

```ts
updateTask(taskId: string, request: UpdateTaskRequest): Observable<Task> {
  return this.http.patch<Task>(`${this.apiUrl}/tasks/${taskId}`, request);
}
```

Les stores convergent vers :

1. état `loading` ;
2. requête observable ;
3. mise à jour des Signals ;
4. état `success`, `empty` ou `error` ;
5. normalisation des erreurs.

## Erreurs

`toErrorMessage` couvre :

- API indisponible (`status === 0`) ;
- message métier JSON ;
- ressource absente ;
- erreur serveur ;
- valeur de repli du client HTTP ou de l’appelant.

Le message utilisateur ne révèle ni pile d’exécution ni détail interne sensible.

## Routage

Les routes sont chargées à la demande :

```ts
{
  path: 'projects/:projectId',
  providers: [TaskStore],
  loadComponent: () => import('./features/projects/project-page'),
}
```

`TaskStore` est recréé lorsque la route entre dans son contexte. Le paramètre `projectId` pilote le chargement.

## Zoneless

Le projet ne dépend pas de Zone.js. Le runtime planifie la vérification lorsque ses APIs core le notifient, notamment :

- un Signal lu dans un template change de valeur ;
- un listener lié à une vue est exécuté ;
- `ComponentRef.setInput` modifie une entrée ;
- une vue précédemment marquée comme devant être vérifiée est attachée à l’arbre de rendu.

Le test doit utiliser `fixture.detectChanges()` ou attendre `fixture.whenStable()` après une mutation externe.

## OnPush

Tous les composants applicatifs déclarent `OnPush`, y compris les composants purement statiques. Les entrées sont des Signals ou des valeurs stables, ce qui permet à Angular de ne vérifier une vue que lorsqu’elle est réellement invalidée.

Le composant `EagerProbe` est l’exception pédagogique qui permet de comparer la stratégie `Eager`, anciennement nommée `Default`, à `OnPush`.

## TypeScript strict

- `strict: true` ;
- `strictTemplates: true` ;
- unions fermées pour les statuts et priorités ;
- modèles de formulaires typés ;
- aucun casting laxiste du corps HTTP vers un type métier sans validation à l’exécution côté serveur.

## Angular Material

Material fournit les interactions et l’accessibilité de Button, Dialog, Form Field, Select, Table, Chips et SnackBar. Le thème utilise l’API Sass `mat.theme`, les palettes Azure/Violet et les variables `mat-sys-*`.
