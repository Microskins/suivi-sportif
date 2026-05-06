# Architecture

## Vue d'ensemble

Le projet est un monorepo npm avec trois workspaces:

- `server`: API Fastify en TypeScript.
- `client`: application React/Vite en TypeScript.
- `mcp`: serveur MCP de debug et d'automatisation.

La source de verite metier est cote API. Le frontend appelle l'API et ne parle
jamais directement a PostgreSQL.

## Architecture cible

```text
Navigateur
  |
  v
Serveur frontend
React/Vite build statique, servi par Nginx ou equivalent
  |
  v
Serveur API
Fastify + TypeScript + JWT + Prisma
  |
  v
Serveur PostgreSQL
Base dediee, non exposee au navigateur
```

Regles:

- Le frontend ne possede pas `DATABASE_URL`.
- L'API est la seule couche autorisee a lire ou modifier la base.
- PostgreSQL n'accepte que les connexions depuis l'API.
- Le MCP passe par l'API pour les operations metier.

## Backend

Entrees:

- `server/src/app.ts`: construit l'instance Fastify et sert aux tests.
- `server/src/server.ts`: demarre l'API sur le port `3001`.

Organisation:

```text
server/src/
|-- app.ts
|-- server.ts
|-- db/
|   |-- index.ts
|   `-- queries/
|       |-- exercises.ts
|       |-- foods.ts
|       |-- meals.ts
|       |-- nutrition-goals.ts
|       |-- users.ts
|       `-- workouts.ts
|-- plugins/
|   `-- auth.ts
|-- routes/
|   |-- api.test.ts
|   |-- exercises.ts
|   |-- foods.ts
|   |-- meals.ts
|   |-- nutrition-goals.ts
|   |-- users.ts
|   `-- workouts.ts
`-- schemas/
    `-- index.ts
```

### MVC pragmatique

- `routes/`: transport HTTP, validation, codes de reponse.
- `schemas/`: schemas Zod et types d'entree/sortie.
- `db/queries/`: acces Prisma et persistance.
- `controllers/` ou `services/`: a ajouter quand un flux grossit.

Aujourd'hui, les routes et `db/queries` portent encore l'essentiel de la logique
car les flux restent simples. Des services seront ajoutes quand une route
commencera a orchestrer plusieurs decisions metier.

### Reponses API

- Liste: `{ data, meta: { total, page, limit } }`
- Detail: `{ data }`
- Erreur: `{ error, code }`
- Suppression: `204`

### Authentification

Routes publiques:

- `POST /api/users/register`
- `POST /api/users/login`

Routes protegees:

- `GET /api/users/me`
- `PUT /api/users/me`
- CRUD exercices
- CRUD seances
- CRUD aliments
- CRUD repas
- CRUD objectifs nutritionnels

Les mots de passe sont hashes avec `bcrypt`. Les ressources utilisateur utilisent
`request.user.id`, issu du token JWT.

### Donnees

Prisma utilise PostgreSQL via `DATABASE_URL`.

Modeles principaux:

- `User`
- `Exercise`
- `Workout`
- `WorkoutExercise`
- `WorkoutSet`
- `Food`
- `Meal`
- `MealItem`
- `NutritionGoal`

Les repas stockent des snapshots nutritionnels par item pour conserver
l'historique meme si un aliment est modifie ensuite. Un objectif nutritionnel
actif desactive les autres objectifs actifs du meme utilisateur.

### Tests

Les tests API utilisent Vitest et `fastify.inject()`:

```bash
npm run test -w server -- --run
```

Tests importants:

- `server/src/routes/api.test.ts`
- `server/src/db/queries/workouts.test.ts`

## Frontend

Organisation actuelle:

```text
client/src/
|-- App.tsx
|-- main.tsx
|-- api/
|   `-- client.ts
`-- stores/
    |-- authStore.ts
    |-- bypassMockData.ts
    |-- exercisesStore.ts
    `-- workoutsStore.ts
```

`client/src/api/client.ts` centralise les appels HTTP et lit les reponses
standardisees `{ data: ... }`.

Les stores Zustand portent l'etat d'auth, d'exercices et de seances. Le mode
`VITE_BYPASS_AUTH=true` permet de travailler sur l'interface sans API locale.

## MCP

Le workspace `mcp/` expose un serveur de debug sur `127.0.0.1:3033`. Il fournit
des outils de diagnostic, de checks, de lecture de donnees et quelques actions
metier controlees. Voir [debug-server.md](../05-mcp/debug-server.md).

## Deploiement

Le deploiement courant cible Docker Compose derriere Nginx:

- API: `127.0.0.1:3001`
- Frontend: `127.0.0.1:5173`
- MCP: `127.0.0.1:3033`

Voir [docker.md](../04-deployment/docker.md) pour le runbook et
[target.md](../04-deployment/target.md) pour la cible long terme.
