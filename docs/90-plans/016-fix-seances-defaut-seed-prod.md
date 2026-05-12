# Plan - Correction seed prod modeles seances

## Objectif

- Rendre disponibles les modeles de seances par defaut dans les environnements qui utilisent `db:seed:prod`.
- Corriger le seed de production pour qu'il soit compatible avec le schema Prisma actuel.

## Decisions

- Reutiliser le catalogue d'exercices et de modeles deja valide dans `server/prisma/seed.ts`.
- Garder le seed de compte admin et des aliments globaux existant.
- Upsert des modeles par `name`, puis recreation des exercices de modele pour garantir la coherence.

## Todo

- [x] Creer ce plan.
- [x] Mettre a jour `server/prisma/prod-seed.mjs`.
- [x] Indexer ce chantier dans `docs/90-plans/README.md`.
- [x] Verifier la syntaxe et noter le resultat.

## Notes de verification

- Commande: `node --check server/prisma/prod-seed.mjs`.
- Resultat: non lancee dans cet environnement car `node` n'est pas disponible dans le shell courant (`CommandNotFoundException`).
- Verification de coherence via diff: le seed prod inclut maintenant les 5 modeles de seances et les champs Prisma `difficulty`/`exerciseType` compatibles schema.
