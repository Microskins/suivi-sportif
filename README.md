# Suivi Sportif

Application web de suivi sportif avec API Fastify, base PostgreSQL via Prisma et client React/Vite.

Le projet est en cours de construction. La priorité actuelle est l'API: authentification, exercices, séances, persistance des séries et couverture de tests.

## Objectif d'architecture

La cible de production est une architecture séparée:

- serveur web frontend: build React/Vite servi en statique, par exemple via Nginx;
- serveur API: Fastify/TypeScript organisé en MVC;
- serveur base de données: PostgreSQL dédié, accessible uniquement par l'API.

Le navigateur ne parle jamais directement à PostgreSQL. React appelle l'API, et l'API est la seule couche autorisée à lire ou modifier la base.

## Stack

### Backend

- Fastify 4
- TypeScript
- Prisma 5
- PostgreSQL
- Zod
- JWT
- bcrypt
- Vitest

### Frontend

- React 18
- Vite 5
- TypeScript
- Zustand
- Recharts

## Etat actuel

### Disponible

- Health check: `GET /health`
- Auth publique: `POST /api/users/register`, `POST /api/users/login`
- Routes protégées par JWT:
  - `GET /api/users`
  - `GET /api/exercises`
  - `POST /api/exercises`
  - `GET /api/workouts`
  - `POST /api/workouts`
- Création de séances avec exercices et séries.
- Tests API avec `fastify.inject()`.

### Encore à faire

- Interface React réelle: login/register, exercices, séances.
- Tests API plus complets: erreurs, update/delete, ownership multi-utilisateurs.
- Documentation OpenAPI/Swagger exploitable.
- Seed de données de développement.
- Nettoyage progressif des anciennes docs de setup.

## Installation

Prérequis:

- Node.js 18+
- npm
- PostgreSQL

```bash
git clone git@github.com:Microskins/suivi-sportif.git
cd suivi-sportif
npm install
```

Créez un fichier `.env` à la racine:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/suivi_sportif_v2"
JWT_SECRET="change-me"
NODE_ENV="development"
```

Générez le client Prisma:

```bash
npm run db:generate -w server
```

Appliquez le schéma en développement:

```bash
npm run db:push -w server
```

Optionnel: ajouter les exercices de base pour le développement:

```bash
npm run db:seed -w server
```

## Développement

Backend:

```bash
npm run dev -w server
```

Client:

```bash
npm run dev -w client
```

URLs:

- API: http://localhost:3001
- Health: http://localhost:3001/health
- Client: http://localhost:5173

## Vérification

Serveur:

```bash
npm run typecheck -w server
npm run test -w server -- --run
npm run build -w server
```

Client:

```bash
npm run typecheck -w client
npm run build -w client
```

Build complet:

```bash
npm run build
```

## Docker deployment

The project now ships with production Docker assets:

- `docker-compose.yml`
- `server/Dockerfile`
- `client/Dockerfile`
- `deploy/nginx/suivi-sportif.fr.conf`

Full runbook:

- [Docker deployment](./docs/DOCKER_DEPLOYMENT.md)

## Documentation

Commencez ici:

- [Index documentation](./docs/INDEX.md)
- [Démarrage rapide](./docs/QUICK_START.md)
- [API](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Déploiement cible](./docs/DEPLOYMENT_TARGET.md)
- [Structure du projet](./docs/PROJECT_STRUCTURE.md)

Les documents de phase/setup plus anciens sont conservés comme historique, mais peuvent ne plus refléter l'état réel du code.
