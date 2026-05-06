# Deploiement cible

Le but long terme est un deploiement en trois zones separees.

```text
Utilisateur
  |
  | HTTPS
  v
Serveur frontend
Nginx ou equivalent, sert le build React/Vite
  |
  | HTTPS vers l'API
  v
Serveur API
Fastify + TypeScript + JWT + Prisma
  |
  | reseau prive
  v
Serveur PostgreSQL
Base dediee
```

## Serveur frontend

Role:

- servir les fichiers statiques generes par `npm run build -w client`;
- exposer l'application React au navigateur;
- configurer l'URL publique de l'API via `VITE_API_URL`.

Ce serveur ne doit pas avoir acces a `DATABASE_URL`.

Variable attendue au build:

```env
VITE_API_URL="https://api.example.com"
```

## Serveur API

Role:

- heberger Fastify;
- valider les entrees avec Zod;
- verifier les JWT;
- appliquer les regles metier;
- parler a PostgreSQL via Prisma.

Fichiers concernes:

- `server/src/app.ts`
- `server/src/server.ts`
- `server/src/routes/*`
- `server/src/db/queries/*`
- `server/prisma/schema.prisma`

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

## Serveur PostgreSQL

Role:

- heberger la base `suivi_sportif_v2`;
- accepter les connexions uniquement depuis le serveur API;
- refuser tout acces direct depuis le navigateur ou le serveur frontend.

Bonnes pratiques:

- utilisateur DB dedie a l'application;
- mot de passe fort;
- port PostgreSQL ferme publiquement;
- sauvegardes regulieres;
- migrations Prisma versionnees.

## Flux de securite

1. Le navigateur charge React depuis le serveur frontend.
2. React appelle l'API avec `Authorization: Bearer <TOKEN>`.
3. Fastify verifie le JWT.
4. Fastify lit ou ecrit via Prisma.
5. PostgreSQL ne repond qu'au serveur API.

## MVC cote API

La cible est un MVC pragmatique pour Fastify:

- `routes/`: transport HTTP;
- `schemas/`: validation;
- `controllers/` ou `services/`: logique metier quand un flux grossit;
- `db/queries/`: acces base via Prisma.

Le projet n'a pas besoin de controllers separes partout aujourd'hui, mais c'est
la direction a suivre quand les routes deviennent plus riches.
