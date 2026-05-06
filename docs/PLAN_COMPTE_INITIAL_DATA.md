# Plan - Compte initial et donnees de base

## Objectif

Creer un point de depart utilisable en production:

- un compte initial `admin@suivi-sportif.fr`;
- un catalogue minimal d'exercices;
- un catalogue minimal d'aliments globaux;
- une base prete pour la suite: API helpers, interface, puis MCP.

## Decisions

- Le compte `admin@suivi-sportif.fr` reste un utilisateur normal pour l'instant.
- Aucun role admin n'est ajoute dans ce chantier.
- Le mot de passe n'est pas stocke dans le repo.
- Le seed production doit etre executable sans `tsx` dans le container Docker.

## Todo

- [x] Verifier l'existant: schema Prisma, routes auth, seed actuel.
- [x] Definir le comportement du seed production.
- [x] Ajouter `server/prisma/prod-seed.mjs`.
- [x] Ajouter le script npm `db:seed:prod`.
- [x] Documenter la procedure dans `docs/DOCKER_DEPLOYMENT.md`.
- [x] Deployer le seed sur le serveur de production.
- [x] Lancer le seed production.
- [x] Verifier le login du compte initial.
- [x] Verifier les compteurs PostgreSQL.
- [x] Relancer le smoke test production.

## Notes de suite

Ordre prevu apres ce point de depart:

1. API helpers pour creer les donnees plus vite.
2. Interface frontend complete pour creer les donnees dans l'app.
3. Outils MCP pour assister la creation de donnees.
