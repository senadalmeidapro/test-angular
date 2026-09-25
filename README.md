# Angular Lab — Project Management Dashboard

Laboratoire Angular 22 centré sur une application réelle de gestion de projets et de tâches. Le frontendzoneless combine Signals, components standalone, `OnPush`, formulaires typés, Angular Material, routage lazy et HttpClient. Une API Express TypeScript en mémoire fournit les données.

## Versions validées

- Node.js `24.16.0`
- npm `11.13.0`
- Angular `22.2.0`
- TypeScript `6.0.2`
- RxJS `7.8`
- Vitest `5`

## Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrir ensuite `http://localhost:4200`. Le script `dev` lance :

- l’API sur `http://localhost:3000/api` ;
- Angular sur `http://localhost:4200` ;
- le proxy de `/api` vers l’API locale.

Les données sont conservées en mémoire jusqu’à l’arrêt du serveur API.

## Scripts

| Commande               | Rôle                                                   |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | Démarre l’API et le frontend avec rechargement à chaud |
| `npm start`            | Démarre uniquement Angular avec le proxy               |
| `npm run start:api`    | Démarre uniquement Express avec `tsx watch`            |
| `npm run build`        | Produit le bundle optimisé dans `dist/angular-lab`     |
| `npm run typecheck`    | Compile l’application Angular en mode développement    |
| `npm run api:check`    | Vérifie les types TypeScript du serveur                |
| `npm test`             | Lance Vitest en mode watch                             |
| `npm run test:ci`      | Lance tous les tests Angular une fois                  |
| `npm run api:test`     | Lance les tests de contrat HTTP Express                |
| `npm run format`       | Applique Prettier                                      |
| `npm run format:check` | Vérifie le formatage sans modifier les fichiers        |

## Parcours de démonstration

1. Ouvrir `/dashboard` et observer les états `loading`, `success`, `empty` et `error`.
2. Utiliser le laboratoire **Change Detection** pour comparer `Eager` et `OnPush`.
3. Ouvrir un projet depuis une carte.
4. Filtrer les tâches par recherche et par statut.
5. Créer puis modifier une tâche haute priorité avec mitigation, tags et checklist.
6. Changer son statut, puis la supprimer après confirmation.
7. Modifier la densité de l’interface depuis le toolbar.
8. Ouvrir `/inconnu` pour observer la route 404.

## Arborescence

```text
src/app/
├── core/          # API, modèles, stores, utilitaires et effets
├── features/      # pages routées et logique de feature
├── shared/        # composants transverses et laboratoire pédagogique
├── testing/       # factories partagées par les specs
├── app.config.ts
├── app.routes.ts
└── app.ts

server/            # API Express TypeScript en mémoire
docs/              # parcours pédagogique, architecture et audit
```

## Documentation

1. [Parcours pédagogique](docs/00-parcours-pedagogique.md)
2. [Architecture](docs/01-architecture.md)
3. [Concepts Angular 22](docs/02-concepts-angular.md)
4. [Guide de démarrage](docs/03-guide-demarrage.md)
5. [Flux de données](docs/04-flux-donnees.md)
6. [Change Detection](docs/05-change-detection.md)
7. [Formulaires](docs/06-formulaires.md)
8. [Composants](docs/07-composants.md)
9. [Tests](docs/08-tests.md)
10. [Matrice des concepts](docs/MATRICE-CONCEPTS.md)
11. [API REST](docs/API.md)
12. [Audit final](docs/09-audit-concepts.md)

## Portée

Ce laboratoire couvre les tests unitaires, d’intégration Angular et de contrat API. Il ne contient pas de scénario Playwright de bout en bout ni de pipeline CI distant.
