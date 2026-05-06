# Suivi Sportif

Application web de suivi sportif avec API Fastify, base PostgreSQL via Prisma,
client React/Vite et serveur MCP de debug.

Le projet est en construction active. La source de verite metier reste l'API:
authentification, exercices, seances, nutrition, persistance PostgreSQL et tests.

## Stack

- Backend: Fastify 4, TypeScript, Prisma 5, PostgreSQL, Zod, JWT, bcrypt, Vitest.
- Frontend: React 18, Vite 5, TypeScript, Zustand, Recharts.
- Debug/outillage: workspace `mcp/`, Docker Compose, Nginx.

## Etat actuel

Disponible:

- Health check: `GET /health`
- Auth publique: `POST /api/users/register`, `POST /api/users/login`
- Compte courant: `GET /api/users/me`, `PUT /api/users/me`
- Exercices: CRUD + filtre par groupe musculaire
- Seances: CRUD + recherche par plage de dates
- Nutrition: aliments, repas, objectifs nutritionnels
- Frontend React avec auth, dashboard et stores Zustand
- Tests API avec `fastify.inject()`
- Assets Docker de production et runbook Nginx
- Serveur MCP de debug

A faire:

- Completer les ecrans frontend de creation/edition.
- Elargir les tests API: erreurs, ownership multi-utilisateurs, update/delete.
- Ajouter une documentation OpenAPI/Swagger exploitable.
- Stabiliser les migrations Prisma au fil des prochaines features.

## Installation locale

Prerequis:

- Node.js 18+
- npm
- PostgreSQL

```bash
git clone git@github.com:Microskins/suivi-sportif.git
cd suivi-sportif
npm install
```

Creer un fichier `.env` a la racine:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/suivi_sportif_v2"
JWT_SECRET="change-me"
NODE_ENV="development"
```

Preparer Prisma:

```bash
npm run db:generate -w server
npm run db:push -w server
npm run db:seed -w server
```

Mode frontend local sans auth/API:

```env
VITE_BYPASS_AUTH="true"
```

Cette variable se place dans `client/.env` et charge des donnees mockees.

## Developpement

Backend:

```bash
npm run dev -w server
```

Client:

```bash
npm run dev -w client
```

MCP:

```bash
npm run mcp:dev
```

URLs locales:

- API: http://localhost:3001
- Health: http://localhost:3001/health
- Client: http://localhost:5173
- MCP: http://127.0.0.1:3033/mcp

## Verification

```bash
npm run typecheck -w server
npm run test -w server -- --run
npm run build -w server
```

```bash
npm run typecheck -w client
npm run build -w client
```

```bash
npm run mcp:typecheck
npm run test -w mcp
```

Build complet:

```bash
npm run build
```

## Documentation

Commencer par [docs/INDEX.md](./docs/INDEX.md).

Docs principales:

- [Demarrage rapide](./docs/01-getting-started/quick-start.md)
- [Architecture](./docs/02-architecture/overview.md)
- [API](./docs/03-api/reference.md)
- [Structure du projet](./docs/02-architecture/project-structure.md)
- [Deploiement Docker](./docs/04-deployment/docker.md)
- [Serveur MCP](./docs/05-mcp/debug-server.md)
- [Plans](./docs/90-plans/README.md)

Les anciennes docs de setup sont conservees comme historique uniquement. Elles
ne sont plus la source de verite.
