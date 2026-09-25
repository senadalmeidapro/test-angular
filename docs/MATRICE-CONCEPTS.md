# Matrice des concepts Angular

| Concept               | Attendu                          | Implémentation                            | Preuve                                        |
| --------------------- | -------------------------------- | ----------------------------------------- | --------------------------------------------- |
| Standalone bootstrap  | Démarrage sans NgModule          | `bootstrapApplication` dans `src/main.ts` | `typecheck`, `build`                          |
| Standalone components | Dépendances déclarées localement | `imports` de chaque `@Component`          | specs de components                           |
| Control flow          | Conditions et boucles natives    | `@if`, `@for`, `@empty`                   | templates et specs de pages                   |
| Signals               | État réactif explicite           | stores dans `core/services`               | specs des stores                              |
| Computed              | Valeurs dérivées et mémoïsées    | compteurs, KPI, filtres                   | specs dashboard/projet                        |
| Effect                | Synchronisation imperative       | persistance `localStorage`                | `workspace-preferences.store.spec.ts`         |
| `toSignal`            | HTTP exposé au template          | `UserStore`                               | `user-store.spec.ts`                          |
| `toObservable`        | Signal piloté par RxJS           | debounce recherche projet                 | `project-page.spec.ts`, `task-filter.spec.ts` |
| Input Signal          | Entrée requise et réactive       | `input.required` dans les cards/table     | specs components                              |
| Output                | Évements sans couplage           | `output` dans cards/table/filter          | specs components                              |
| Model                 | Two-way binding local            | `TaskFilterBar.searchTerm/statusFilter`   | `task-filter-bar.spec.ts`                     |
| OnPush                | Vérification à la demande        | tous les components applicatifs           | laboratoire CD                                |
| Eager vs OnPush       | Compréhension de l’identité      | `ChangeDetectionLab`                      | `change-detection-lab.spec.ts`                |
| DI racine             | Service partagé                  | Projects, Users, Notifications            | specs de services                             |
| DI de route           | État tâche isolé                 | provider sur `projects/:projectId`        | `app.routes.spec.ts`                          |
| Injection token       | URL découplée                    | `LAB_API_URL`                             | specs des API                                 |
| HttpClient            | Requêtes testables               | clients par ressource                     | specs `*-api.spec.ts`                         |
| État d’erreur         | UI non ambiguë                   | `LoadState`                               | specs stores/pages                            |
| Formulaire typé       | Contrôle des shapes              | `FormGroup<TaskEditorControls>`           | spec du dialogue                              |
| FormArray             | Tags et checklist dynamiques     | deux `FormArray`                          | spec du dialogue                              |
| Validation croisée    | Priorité haute sécurisée         | validateur du `FormGroup`                 | spec du dialogue                              |
| Validation serveur    | Défense en profondeur            | Express valide le PATCH/POST              | `server/index.spec.ts`                        |
| Routage lazy          | Découpage réseau                 | `loadComponent`                           | spec des routes                               |
| Accessibilité         | Actions nommées                  | labels, aria, tooltips                    | templates et specs                            |
| Zoneless              | Aucun Zone.js                    | bootstrap et runtime Angular 22           | build sans polyfill zone                      |
| Tests HTTP            | Contrat sans réseau réel         | `HttpTestingController`                   | specs API                                     |
| Tests serveur         | Contrat réel Express             | `createApiApp` sur port éphémère          | `api:test`                                    |
| Typage template       | Erreurs Angular strictes         | `strictTemplates`                         | `typecheck`                                   |

## Concepts documentés mais non implémentés

| Concept                     | Raison                                | Moment d’introduction recommandé                |
| --------------------------- | ------------------------------------- | ----------------------------------------------- |
| NgModule                    | Architecture standalone complète      | comparer avec une application entrée historique |
| Effects asynchrones avancés | Aucun besoin métier actuel            | lors d’un cache ou d’une synchronisation réseau |
| Interceptors                | pas d’auth, tracing ou retry          | après ajout de ces exigences                    |
| Route guards                | données publiques                     | après introduction de l’authentification        |
| i18n                        | interface pédagogique en français     | lors d’un produit multilingue                   |
| SSR                         | API en mémoire et latency locale      | après sécurisation des accès serveur            |
| PWA                         | hors périmètre du laboratoire         | après stabilisation du build                    |
| E2E                         | Vitest couvre les couches disponibles | ajouter Playwright pour le navigateur complet   |
