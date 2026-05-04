# Architecture

## Vue d'ensemble

Le projet est un monorepo npm avec deux workspaces:

- `server`: API Fastify en TypeScript.
- `client`: application React/Vite en TypeScript.

La source de vérité métier est actuellement côté API.

## Backend

### Entrées

- `server/src/app.ts`: construit l'instance Fastify. Ce fichier est importé par les tests.
- `server/src/server.ts`: démarre l'API sur le port `3001`.

### Organisation

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

### Règles

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

La config PM2 côté serveur est:

```text
server/ecosystem.config.cjs
```

Elle pointe vers:

```text
server/dist/server.js
```

Le serveur doit donc être buildé avant démarrage production.
