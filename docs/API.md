# API REST

## Adresse

En développement :

```text
http://localhost:3000/api
```

Dans le navigateur, utiliser le chemin relatif `/api`. Le proxy Angular transfère la requête au serveur local.

## Format

Les requêtes et réponses utilisent JSON. Les dates sont des chaînes ISO. Les erreurs suivent la forme :

```json
{
  "message": "Message lisible par l’utilisateur"
}
```

## Health

```http
GET /api/health
```

Réponse :

```json
{ "status": "ok" }
```

## Users

```http
GET /api/users
```

## Projects

### Liste

```http
GET /api/projects
```

Pour simuler une panne :

```http
GET /api/projects?simulateError=true
```

Réponse `503` :

```json
{ "message": "Panne simulée de l’API." }
```

### Détail

```http
GET /api/projects/:projectId
```

`404` si le projet est absent.

## Tasks

### Liste par projet

```http
GET /api/projects/:projectId/tasks
```

### Création

```http
POST /api/projects/:projectId/tasks
Content-Type: application/json
```

Charge utile :

```json
{
  "title": "Préparer la revue",
  "description": "Vérifier les critères d’acceptation.",
  "status": "todo",
  "priority": "high",
  "assigneeId": "user-ada",
  "dueDate": "2026-10-20",
  "tags": ["review", "angular"],
  "checklist": [{ "label": "Relire les tests", "done": false }],
  "riskMitigation": "Prévoir une revue de rollback."
}
```

Réponse `201` avec un `id` et un `createdAt` générés par le serveur.

### Mise à jour partielle

```http
PATCH /api/tasks/:taskId
Content-Type: application/json
```

Exemple :

```json
{ "status": "done" }
```

Le serveur ne modifie que les champs présents. Une priorité haute doit conserver ou recevoir une mitigation non vide.

### Suppression

```http
DELETE /api/tasks/:taskId
```

Réponse `204` sans body.

## Erreurs de validation

| Code  | Situation                                                                                             |
| ----- | ----------------------------------------------------------------------------------------------------- |
| `400` | JSON invalide, titre, description, statut, priorité, responsable, date, tags, checklist ou mitigation |
| `404` | projet ou tâche absent                                                                                |
| `404` | route `/api` inconnue                                                                                 |
| `503` | panne simulée de la liste des projets                                                                 |
| `500` | erreur serveur inattendue                                                                             |

## Règles de validation

- titre trimé de 3 à 100 caractères ;
- description trimée de 500 caractères maximum ;
- statut dans `todo`, `in-progress`, `done` ;
- priorité dans `low`, `medium`, `high` ;
- responsable existant ;
- date `YYYY-MM-DD` valide ;
- tags uniquement des strings, trimés, minuscules et sans doublon ;
- checklist avec des objets `{ label, done }` ;
- mitigation non vide si priorité haute.

## Structure du code

- `server/index.ts` définit l’application Express et la validation ;
- `server/data.ts` contient les données initiales ;
- `server/types.ts` définit les contrats serveur ;
- `server/index.spec.ts` démarre un port éphémère et teste le contrat.

Le serveur utilise un stockage en mémoire. Il ne faut pas l’exposer tel quel comme API de production.
