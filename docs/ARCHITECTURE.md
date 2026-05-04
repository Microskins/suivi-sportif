# Architecture

## Vue d'ensemble

Le projet est un monorepo npm avec deux workspaces:

- `server`: API Fastify en TypeScript.
- `client`: application React/Vite en TypeScript.

La source de vérité métier est côté API. Le frontend ne contient pas de logique d'accès aux données directe: il appelle l'API.

## Architecture cible

En production, les responsabilités sont séparées:

```text
Navigateur
   │
   ▼
Serveur frontend
React/Vite build statique, Nginx ou équivalent
   │
   ▼
Serveur API
Fastify + TypeScript + JWT + Prisma
   │
   ▼
Serveur PostgreSQL
Base dédiée, non exposée au navigateur
```

Objectif:

- React est déployé sur un serveur web séparé.
- Fastify est déployé sur un serveur API séparé.
- PostgreSQL est déployé sur un serveur base de données séparé.
- Seule l'API possède `DATABASE_URL`.
- Le frontend configure seulement l'URL publique de l'API.

## Backend

### Entrées

- `server/src/app.ts`: construit l'instance Fastify. Ce fichier est importé par les tests.
- `server/src/server.ts`: démarre l'API sur le port `3001`.

### Organisation actuelle

```text
server/src/
├── app.ts
├── server.ts
├── db/
│   ├── index.ts
│   └── queries/
│       ├── exercises.ts
│       ├── users.ts
│       └── workouts.ts
├── plugins/
│   └── auth.ts
├── routes/
│   ├── api.test.ts
│   ├── exercises.ts
│   ├── users.ts
│   └── workouts.ts
└── schemas/
    └── index.ts
```

### Règles MVC

Le backend suit une organisation MVC adaptée à Fastify:

- routes: réception HTTP, validation des entrées, codes de réponse;
- controllers/services: logique métier quand elle devient plus riche;
- queries/models: accès Prisma et persistance;
- schemas: validation Zod et types d'entrées/sorties.

Aujourd'hui, la logique métier est encore légère: elle est donc principalement portée par les routes et `db/queries`. Dès qu'un flux grossit, on ajoute une couche `controllers/` ou `services/` pour éviter d'alourdir les routes.

Règles actuelles:

- Les routes reçoivent les requêtes HTTP, valident les entrées et choisissent les codes HTTP.
- Les fichiers `db/queries/*` parlent à Prisma.
- Les schémas Zod vivent dans `schemas/`.
- Les routes protégées utilisent JWT.
- Les réponses API suivent:
  - liste: `{ data, meta: { total, page, limit } }`
  - détail: `{ data }`
  - erreur: `{ error, code }`

### Authentification

- Routes publiques:
  - `POST /api/users/register`
  - `POST /api/users/login`
- Routes protégées:
  - `GET /api/users`
  - `GET/POST/PUT/DELETE /api/exercises`
  - `GET/POST/PUT/DELETE /api/workouts`

Les mots de passe sont hashés avec `bcrypt`. Les workouts utilisent `request.user.id`, issu du token JWT.

### Données

Prisma utilise PostgreSQL via `DATABASE_URL`.

Modèles principaux:

- `User`
- `Exercise`
- `Workout`
- `WorkoutExercise`
- `WorkoutSet`

Les séances peuvent contenir plusieurs exercices, et chaque exercice peut contenir plusieurs séries.

### Tests

Les tests API utilisent Vitest et `fastify.inject()`:

```bash
npm run test -w server -- --run
```

Le fichier de départ est `server/src/routes/api.test.ts`.

## Frontend

Le frontend existe mais reste minimal.

```text
client/src/
├── App.tsx
├── main.tsx
├── vite-env.d.ts
└── api/
    └── client.ts
```

`client/src/api/client.ts` sait appeler l'API et lire les réponses `{ data: ... }`.

Les prochains écrans attendus:

- register/login
- liste d'exercices
- création de séance
- historique des séances

## Déploiement

Voir aussi [Déploiement cible](./DEPLOYMENT_TARGET.md).

La config PM2 côté API est:

```text
server/ecosystem.config.cjs
```

Elle pointe vers:

```text
server/dist/server.js
```

Le serveur doit donc être buildé avant démarrage production.
