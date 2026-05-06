# Structure du projet

Vue courte des dossiers suivis.

```text
suivi-sportif/
|-- .agents/
|   `-- skills/                  # Skills projet pour Codex
|-- .github/                     # GitHub Actions
|-- client/                      # Frontend React/Vite
|-- config/                      # Configuration locale/outillage
|-- deploy/
|   `-- nginx/                   # Configuration Nginx production
|-- docs/                        # Documentation projet
|-- mcp/                         # Serveur MCP de debug
|-- scripts/                     # Scripts API, backup, operations
|-- server/                      # API Fastify/Prisma
|-- docker-compose.yml
|-- package.json
|-- package-lock.json
`-- README.md
```

## Workspaces npm

```text
server
client
mcp
```

Les commandes peuvent cibler un workspace:

```bash
npm run dev -w server
npm run build -w client
npm run test -w mcp
```

## Backend

```text
server/
|-- ecosystem.config.cjs
|-- package.json
|-- prisma/
|   |-- migrations/
|   |-- prod-seed.mjs
|   |-- schema.prisma
|   `-- seed.ts
`-- src/
    |-- app.ts
    |-- server.ts
    |-- db/
    |   |-- index.ts
    |   `-- queries/
    |-- plugins/
    |-- routes/
    `-- schemas/
```

Fichiers importants:

- `server/src/app.ts`: construction de l'app Fastify.
- `server/src/server.ts`: demarrage reseau.
- `server/src/routes/api.test.ts`: tests API principaux.
- `server/src/db/queries/*`: acces Prisma.
- `server/prisma/schema.prisma`: schema PostgreSQL/Prisma.
- `server/prisma/seed.ts`: catalogue de developpement.
- `server/prisma/prod-seed.mjs`: seed du compte initial et catalogues de production.

## Frontend

```text
client/
|-- index.html
|-- package.json
|-- vite.config.ts
`-- src/
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

Fichiers importants:

- `client/src/api/client.ts`: client HTTP.
- `client/src/stores/authStore.ts`: auth et session.
- `client/src/stores/bypassMockData.ts`: donnees mockees du mode bypass.
- `client/src/stores/exercisesStore.ts`: etat exercices.
- `client/src/stores/workoutsStore.ts`: etat seances.

## MCP

```text
mcp/
|-- package.json
`-- src/
    |-- config.ts
    |-- mcp-server.ts
    |-- server.ts
    |-- prompts/
    |-- resources/
    |-- tools/
    |-- utils/
    `-- __tests__/
```

Le MCP sert au debug et a l'automatisation controlee. Il ne remplace pas l'API
comme couche metier.

## Documentation

```text
docs/
|-- INDEX.md
|-- 01-getting-started/
|-- 02-architecture/
|-- 03-api/
|-- 04-deployment/
|-- 05-mcp/
|-- 90-plans/
`-- 99-archive/
```

Les fichiers historiques de phase 0 sont conserves mais ne sont plus une
reference active. Voir [INDEX.md](../INDEX.md).
