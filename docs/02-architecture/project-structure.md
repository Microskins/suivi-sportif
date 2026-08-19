# Structure du projet

Vue courte des dossiers suivis.

```text
suivi-sportif/
|-- .agents/
|   `-- skills/                  # Skills projet pour Codex
|-- .github/                     # GitHub Actions
|-- client/                      # Frontend multi-sites React/Vite
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
|-- e2e/
|   `-- price-comparison.visual.spec.ts
|-- index.html
|-- package.json
|-- playwright.config.ts
|-- public/
|   `-- sites/
|       |-- portfolio/
|       |   `-- favicon.svg
|       |-- prix-aliments/
|       |   `-- favicon.svg
|       |-- suivi-sportif/
|       |   |-- body-measurements/
|       |   |-- exercises/
|       |   |-- favicon.svg
|       |   `-- site.webmanifest
|       |-- trekking/
|       |   `-- favicon.svg
|       `-- voyage/
|           `-- favicon.svg
|-- vite.config.ts
`-- src/
    |-- app/
    |   |-- site-identities.ts
    |   `-- site-router.tsx
    |-- main.tsx
    `-- sites/
        |-- portfolio/
        |   |-- portfolio-brand.tsx
        |   `-- portfolio-site.tsx
        |-- prix-aliments/
        |   |-- price-comparison-site.tsx
        |   |-- price-comparison-store.ts
        |   |-- price-data.ts
        |   |-- price-search-params.ts
        |   |-- price-ticket-actions.tsx
        |   |-- price-ticket-qr.tsx
        |   |-- product-comparison-card.tsx
        |   |-- store-location-panel.tsx
        |   `-- store-locations.ts
        |-- trekking/
        |   |-- trekking-brand.tsx
        |   |-- trekking-home-site.tsx
        |   |-- trekking-store.ts
        |   `-- vosges-wild-site.tsx
        |-- voyage/
        |   |-- boarding-ticket.tsx
        |   |-- islande-route-map.tsx
        |   |-- islande-trip-site.tsx
        |   |-- voyage-brand.tsx
        |   `-- voyage-home-site.tsx
        `-- suivi-sportif/
            |-- api/
            |-- components/
            |   |-- auth/
            |   |-- dashboard/
            |   `-- privacy/
            |-- consent/
            |-- data/
            |-- stores/
            `-- suivi-sportif-site.tsx
```

Fichiers importants:

- `client/src/app/site-router.tsx`: choisit le site a partir de l'URL.
- `client/src/app/site-identities.ts`: applique les metadonnees et le favicon
  propres au site courant.
- `client/src/sites/portfolio/`: page d'accueil et catalogue de projets.
- `client/src/sites/prix-aliments/`: recherche locale et comparaison des offres
  alimentaires de demonstration, filtres partageables, partage natif et ticket
  imprime avec QR code local.
- `client/e2e/`: controles Playwright des rendus desktop, mobile et print.
- `client/src/sites/trekking/`: catalogue, carnets de trek et etat local.
- `client/src/sites/voyage/`: billets, itineraires et reservations publiques.
- `client/src/sites/*/*-brand.tsx`: signature visuelle locale a chaque site.
- `client/src/sites/suivi-sportif/api/client.ts`: client HTTP de Suivi Sportif.
- `client/src/sites/suivi-sportif/stores/`: etat metier de Suivi Sportif.
- `client/src/sites/suivi-sportif/data/`: donnees mockees du mode bypass.

Les sites ne s'importent pas entre eux. Un futur dossier `client/src/shared`
sera cree uniquement lorsqu'un module sera effectivement utilise par au moins
deux sites. Le sens autorise est `client/src/app` vers `sites/*`, jamais d'un
site vers un autre. Le controle se lance avec:

```bash
npm run check:site-boundaries
```

Tous les fichiers maintenus dans `client/src` doivent rester a 500 lignes ou
moins. Le controle se lance avec:

```bash
npm run check:file-size
```

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
