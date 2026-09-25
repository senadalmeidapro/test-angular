# Tests

## Vue d’ensemble

Le projet combine trois niveaux :

1. tests Angular Vitest pour les fonctions, clients, stores et components ;
2. tests Angular pour le routing et l’orchestration des pages ;
3. tests Node sur l’API Express réelle.

## Commandes

```bash
npm run test:ci
npm run api:test
```

Le premier script utilise `@angular/build:unit-test` avec Vitest 5. Le second utilise le runner de tests intégré à Node avec `tsx`.

## Répartition actuelle

Au moment de la livraison :

- 22 fichiers de specs Angular ;
- 77 tests Angular ;
- 1 fichier de tests serveur ;
- 4 tests de contrat Express.

## Stratégie

### Fonctions pures

`http-error.spec.ts` et `task-filter.spec.ts` ne créent pas de TestBed. Ils vérifient les branches, les messages, la normalisation et l’absence de mutation.

### Clients HTTP

Les specs `*-api.spec.ts` utilisent :

```ts
provideHttpClient();
provideHttpClientTesting();
```

Une requête est déclarée explicitement :

```ts
const request = http.expectOne('/api/projects/project-portal/tasks');
expect(request.request.method).toBe('GET');
request.flush(TASKS);
```

Cela teste method, URL et body sans autoriser une requête non prévue.

### Stores

Les specs contrôlent :

- loading ;
- success ;
- empty ;
- error ;
- sélection ;
- valeurs dérivées ;
- réponses obsolètes ;
- mutations concurrentes ;
- changement de projet pendant une création.

### Components

Les specs utilisent les signals inputs et outputs :

```ts
fixture.componentRef.setInput('project', project);
fixture.componentInstance.projectSelected.subscribe((value) => selected.push(value));
```

Le dialog est testé avec des providers `MAT_DIALOG_DATA` et `MatDialogRef`. Les méthodes protégées sont appelées via un petit harness de test typé afin de tester la logique sans dépendre de l’implémentation interne des boutons Material.

### Pages

`dashboard-page.spec.ts` et `project-page.spec.ts` simulent les réponses HTTP. Ils vérifient les textes d’état, le chargement parallèle, la navigation et les requêtes CRUD.

### Routage

`app.routes.spec.ts` vérifie la redirection racine, les titles, les loaders lazy et la présence de `TaskStore` dans les providers de route.

### API Express

`createApiApp({ latencyMs: 0 })` démarre un serveur sur le port 0. Les tests utilisent `fetch` et un vrai socket sans_FIXME :

- health, projets, utilisateurs ;
- création, mise à jour, suppression ;
- mitigation obligatoire ;
- dédoublonnage des tags ;
- statut et responsable invalides ;
- projet absent.

Le tableau de tâches est restauré après chaque test.

## Matrice de couverture

| Couche         | Fichiers                                                              | Objectif               |
| -------------- | --------------------------------------------------------------------- | ---------------------- |
| Utilitaires    | `http-error.spec.ts`, `task-filter.spec.ts`                           | logique pure           |
| HTTP           | `project-api.spec.ts`, `task-api.spec.ts`, `user-api.spec.ts`         | contrats requests      |
| Stores         | `project-store.spec.ts`, `user-store.spec.ts`, `task-store.spec.ts`   | état et concurrence    |
| Infrastructure | `notification.service.spec.ts`, `workspace-preferences.store.spec.ts` | effets et services     |
| Partage        | specs StatCard, ProjectCard, FilterBar, Table, Dialog, Lab            | rendu et événements    |
| Pages          | Dashboard et Project                                                  | orchestration et états |
| Routes         | `app.routes.spec.ts`                                                  | configuration          |
| Serveur        | `server/index.spec.ts`                                                | contrat HTTP réel      |

## Zoneless et tests

Éviter `fakeAsync` et `tick`, qui sont moins adaptés à ce runtime. Pour une attente de microtask :

```ts
await fixture.whenStable();
fixture.detectChanges();
```

Pour une interaction DOM :

```ts
input.dispatchEvent(new Event('input'));
fixture.detectChanges();
```

Pour un debounce, utiliser `vi.useFakeTimers()` uniquement dans le test qui manipule le temps.

## HttpTestingController

Always plan `afterEach(() => http.verify())`. Cette assertion détecte :

- une requête forgotten ;
- une URL incorrecte ;
- un HTTP call qui ne correspond pas au contrat.

## Tests API et latence

Le serveur de production simule 300 ms de latence. `createApiApp` permet de passer `latencyMs: 0` dans les tests. Les tests frontend utilisent le backend de test Angular, donc ils n’attendent pas de socket.

## Ce qui n’est pas couvert

- test navigateur Playwright ;
- accessibilité automatisée axe ;
- performance runtime ;
- responsive visuel ;
- régression de layout ;
- persistence après redémarrage.

## Ajouter un test

1. Placer le spec à côté de la source.
2. Réutiliser `test-data.ts` si le type le permet.
3. Tester d’abord le résultat métier, pas une implémentation interne.
4. Vérifier les requêtes avec `HttpTestingController`.
5. Ajouter le scénario à la matrice si une nouvelle couche apparaît.
