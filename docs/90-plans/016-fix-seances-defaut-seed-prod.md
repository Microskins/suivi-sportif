# Plan - Correction seed prod modeles seances

## Objectif

- Rendre disponibles les modeles de seances par defaut dans les environnements qui utilisent `db:seed:prod`.
- Corriger le seed de production pour qu'il soit compatible avec le schema Prisma actuel.

## Decisions

- Reutiliser le catalogue d'exercices et de modeles deja valide dans `server/prisma/seed.ts`.
- Garder le seed de compte admin et des aliments globaux existant.
- Upsert des modeles par `name`, puis recreation des exercices de modele pour garantir la coherence.
- Ajouter une migration SQL de compatibilite pour retirer `NOT NULL` des colonnes legacy `muscle_group` et `equipment`.

## Todo

- [x] Creer ce plan.
- [x] Mettre a jour `server/prisma/prod-seed.mjs`.
- [x] Indexer ce chantier dans `docs/90-plans/README.md`.
- [x] Verifier la syntaxe et noter le resultat.
- [x] Ajouter une migration de compatibilite legacy pour la production.

## Notes de verification

- Commande: `node --check server/prisma/prod-seed.mjs`.
- Resultat: non lancee dans cet environnement car `node` n'est pas disponible dans le shell courant (`CommandNotFoundException`).
- Verification de coherence via diff: le seed prod inclut maintenant les 5 modeles de seances et les champs Prisma `difficulty`/`exerciseType` compatibles schema.
- Incident prod observe: `P2011 Null constraint violation` sur `exercises.muscle_group` lors de `db:seed:prod`.
- Correctif ajoute: migration `server/prisma/migrations/20260512123000_relax_legacy_exercise_columns/migration.sql`.
