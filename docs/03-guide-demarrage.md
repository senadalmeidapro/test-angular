# Guide de démarrage

## Prérequis

- Node.js 22.12+ ou 24.x recommandé ;
- npm 11 ;
- un navigateur récent avec DevTools ;
- un terminal PowerShell, Bash ou compatible.

La validation du projet a été réalisée avec Node `24.16.0` et npm `11.13.0`.

## Installation

```bash
npm install
```

Le proxy de développement est configuré dans `proxy.conf.json` :

```text
http://localhost:4200/api/* → http://localhost:3000/api/*
```

## Lancer le projet

```bash
npm run dev
```

`concurrently` démarre les deux processus avec les noms `API` et `WEB`. Arrêter le script arrête les deux serveurs.

Pour les lancer séparément :

```bash
npm run start:api
npm start
```

Ouvrir `http://localhost:4200`.

## Utiliser l’API

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/projects
curl http://localhost:3000/api/projects/project-portal/tasks
```

Créer une tâche :

```bash
curl -X POST http://localhost:3000/api/projects/project-portal/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Valider la démo\",\"description\":\"Vérifier le parcours\",\"status\":\"todo\",\"priority\":\"high\",\"assigneeId\":\"user-ada\",\"dueDate\":\"2026-10-20\",\"tags\":[\"demo\"],\"checklist\":[{\"label\":\"Relire\",\"done\":false}],\"riskMitigation\":\"Prévoir un fallback.\"}"
```

La simulation d’erreur du dashboard est disponible avec :

```text
/api/projects?simulateError=true
```

L’API ajoute 300 ms de latence à chaque route `/api` afin de rendre les états `loading` observables.

## Commandes de vérification

```bash
npm run typecheck
npm run api:check
npm run test:ci
npm run api:test
npm run format:check
npm run build
```

Résultat attendu à la livraison :

- le build Angular se termine sans erreur ;
- le typecheck serveur se termine sans erreur ;
- 77 tests Angular passent ;
- 4 tests Express passent ;
- aucune divergence Prettier.

## Formatage

```bash
npm run format
```

Puis vérifier sans écrire :

```bash
npm run format:check
```

## Arborescence de lecture

1. `src/app/app.routes.ts` : routes et providers.
2. `src/app/app.config.ts` : router, HttpClient, token API.
3. `src/app/features/dashboard/dashboard-page.ts` : premier chargement.
4. `src/app/core/services/project-store.ts` : état du portefeuille.
5. `src/app/features/projects/project-page.ts` : orchestration du CRUD.
6. `src/app/core/services/task-store.ts` : état de la feature.
7. `src/app/shared/components/task-editor-dialog/` : formulaire complexe.
8. `server/index.ts` : validation et routes Express.

## Problèmes fréquents

### L’API ne répond pas

- vérifier que `npm run start:api` est actif ;
- vérifier que le port 3000 n’est pas occupé ;
- consulter `/api/health` ;
- ne pas ouvrir directement `http://localhost:3000` : la racine HTTP n’est pas une page web.

### Les requêtes browser vers `/api` retournent 404

Le proxy n’est actif que dans le processus lancé par :

```bash
npm start
```

Utiliser ce script plutôt qu’une commande qui omet `--proxy-config`.

### Une date lève `NG0701`

La locale française doit être enregistrée avant le bootstrap. `src/main.ts` appelle `registerLocaleData(localeFr)` avant `bootstrapApplication`.

### Le port 4200 est occupé

```bash
ng serve --port 4300 --proxy-config proxy.conf.json
```

Dans ce cas, ajuster temporairement l’origine CORS de l’API ou revenir au port standard.

### Les données disparaissent

C’est le comportement normal : `server/data.ts` fournit un tableau en mémoire. Chaque redémarrage de l’API restaure les données initiales.

## Exercices guidés

1. Ajouter un nouveau statut sans utiliser de `any`.
2. Ajouter un filtre de priorité et covered le store.
3. Ajouter un bouton d’archive pour une tâche.
4. Créer un interceptor qui ajoute un identifiant de corrélation.
5. Écrire un test Playwright du parcours création.
