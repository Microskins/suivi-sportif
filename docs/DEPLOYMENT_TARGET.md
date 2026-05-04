# Déploiement cible

Le but du projet est un déploiement en trois zones séparées.

```text
Utilisateur
   │ HTTPS
   ▼
Serveur frontend
Nginx ou équivalent sert le build React/Vite
   │ HTTPS / API_URL
   ▼
Serveur API
Fastify + TypeScript + JWT + Prisma
   │ réseau privé
   ▼
Serveur PostgreSQL
Base de données dédiée
```

## Serveur frontend

Rôle:

- servir les fichiers statiques générés par `npm run build -w client`;
- exposer l'application React au navigateur;
- configurer l'URL publique de l'API via `VITE_API_URL`.

Ce serveur ne doit pas avoir accès à `DATABASE_URL`.

Variables attendues au build:

```env
VITE_API_URL="https://api.example.com"
```

## Serveur API

Rôle:

- héberger Fastify;
- valider les entrées avec Zod;
- vérifier les JWT;
- appliquer les règles métier;
- parler à PostgreSQL via Prisma.

Fichiers concernés:

- `server/src/app.ts`
- `server/src/server.ts`
- `server/src/routes/*`
- `server/src/db/queries/*`
- `server/prisma/schema.prisma`
- `server/ecosystem.config.cjs`

Variables attendues:

```env
DATABASE_URL="postgresql://USER:PASSWORD@DB_HOST:5432/suivi_sportif_v2"
JWT_SECRET="secret-long-et-unique"
NODE_ENV="production"
```

Commandes principales:

```bash
npm install
npm run db:generate -w server
npm run build -w server
npm run start -w server
```

Avec PM2:

```bash
pm2 start server/ecosystem.config.cjs --env production
```

## Serveur PostgreSQL

Rôle:

- héberger la base `suivi_sportif_v2`;
- accepter les connexions uniquement depuis le serveur API;
- refuser tout accès direct depuis le navigateur ou le serveur frontend.

Bonnes pratiques:

- utilisateur DB dédié à l'application;
- mot de passe fort;
- port PostgreSQL fermé publiquement;
- sauvegardes régulières;
- migrations Prisma versionnées quand le schéma devient stable.

## Flux de sécurité

1. Le navigateur charge React depuis le serveur frontend.
2. React appelle l'API avec `Authorization: Bearer <TOKEN>`.
3. Fastify vérifie le JWT.
4. Fastify lit ou écrit via Prisma.
5. PostgreSQL ne répond qu'au serveur API.

## MVC côté API

La cible est un MVC pragmatique pour Fastify:

- `routes/`: transport HTTP;
- `schemas/`: validation;
- `controllers/` ou `services/`: logique métier quand un flux dépasse la simple orchestration;
- `db/queries/`: accès base via Prisma.

Le projet n'a pas encore besoin de controllers séparés partout, mais c'est la direction à suivre dès que les routes grossissent.
