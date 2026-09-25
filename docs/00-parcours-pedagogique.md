# Parcours pédagogique

## Objectif

Progresser depuis les fondamentaux Angular jusqu’aux décisions d’architecture observables dans une application complète. Chaque concept doit être retrouvé dans le code, manipulé et vérifié par un test.

## Progression

### Phase 1 — Observer le runtime

- partir d’un projet Angular 22 zoneless ;
- identifier le bootstrap, la configuration et les providers globaux ;
- comprendre la différence entre module et application standalone ;
- exécuter le premier build et le premier test.

### Phase 2 — Découper l’application

- placer les modèles et services singletons dans `core` ;
- placer les pages dans `features` ;
- placer les éléments transverses dans `shared` ;
- isoler les accès HTTP par ressource ;
- définir la portée DI de `TaskStore` au niveau de la route projet.

### Phase 3 — Composer les données

- consommer un Observable HTTP une fois dans un store ;
- convertir cet Observable en Signal avec `toSignal` ;
- représenter les états utilisateur avec `signal` ;
- produire des valeurs dérivées avec `computed` ;
- persister une préférence imperative avec `effect` ;
- versionsner les requêtes pour rejeter les réponses obsolètes.

### Phase 4 — Construire l’interface

- utiliser les components standalone ;
- employer `@if`, `@for` et `@empty` ;
- composer les vues avec les control flow Angular modernes ;
- valider les templates en mode strict ;
- utiliser les inputs Signal, les outputs et les modèles bidirectionnels ;
  -(accessibilité) conserver labels, aria et actions clavier.

### Phase 5 — Implémenter le CRUD

- filtrer les tâches sans muter la source ;
- débouncer une recherche issue d’un Signal ;
- construire un formulaire Reactif typé ;
- imbriquer des `FormArray` ;
- appliquer une validation transversale ;
- ouvrir des dialogues Material ;
- propager création, mise à jour et suppression jusqu’à l’API.

### Phase 6 — Observer la performance

- comparer `ChangeDetectionStrategy.Eager` et `OnPush` ;
- comprendre l’identité des inputs ;
- distinguer mise à jour d’un Signal et mutation d’un objet ;
- conserver `OnPush` sur les composants de présentation ;
- éviter les abonnements qui survivent au composant.

### Phase 7 — Vérifier

- tester les fonctions pures ;
- tester les contrats HttpClient avec `HttpTestingController` ;
- tester les stores et leurs transitions d’état ;
- tester les interactions des components ;
- tester l’API Express sur un port éphémère ;
- compiler le frontend et le serveur séparément.

## Règles de lecture du code

1. Commencer par `src/app/app.routes.ts` pour découvrir les features.
2. Suivre une page vers son store, puis son API.
3. Lire les modèles avant les stores.
4. Observer les branches de template avec `@if` pour trouver les états UI.
5. Lire les specs voisines pour comprendre les contrats attendus.
6. Utiliser la [matrice des concepts](MATRICE-CONCEPTS.md) comme checklist.

## Exercices d’extension

- remplacer l’API en mémoire par une API persistante ;
- ajouter une stratégie de retry avec `retry` et backoff ;
- internationaliser les chaînes avec les translations Angular ;
- ajouter un test Playwright pour le parcours création ;
- introduire un intercepteur HTTP de corrélation ;
- persister les tâches avec un cache local ;
- mesurer le rendu avec le Performance Profile du navigateur.

## Critères de réussite

- les commandes de vérification terminent avec le code zéro ;
- aucune donnée métier n’est dupliquée entre template et API ;
- les composants de présentation ne déclenchent pas directement HTTP ;
- les états `empty` et `error` sont visuellement distincts ;
- les actions indisponibles pendant une mutation sont explicites ;
- chaque concept annoncé dans la documentation possesses une implémentation ou une explication claire.
