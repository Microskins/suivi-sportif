# Plan 012 — Fix 500 API apres changements Prisma (exercises)

## Objectif

- Corriger les erreurs 500 sur `/api/exercises` et `/api/workouts` dues a un
  decalage entre le schema Prisma et la base.
- Ajouter une migration Prisma manquante pour aligner la table `exercises` et
  introduire les tables normalisees (muscles/equipment/categories/media/...).

## Decisions

- On ajoute une migration de schema (pas de backfill des relations en SQL).
- On conserve temporairement les colonnes legacy `muscle_group` / `equipment`
  si elles existent: Prisma ignore les colonnes supplementaires.

## Todo

- [x] Creer ce plan.
- [x] Ajouter `server/prisma/migrations/migration_lock.toml`.
- [x] Ajouter une migration Prisma pour `exercise_type` + enums + tables liees.
- [ ] Deployer et lancer `prisma migrate deploy` sur l'environnement qui plante.
- [ ] Verifier que `/api/exercises` et `/api/workouts` repondent (401 si non logge, 200 si logge).

## Notes de verification

- Migration ajoutee: `20260511170754_exercise_relations_refactor`.
- La migration ne drop pas les colonnes legacy et ne requiert pas d'extension Postgres.
- 2026-05-11: migration presente dans `server/prisma/migrations/20260511170754_exercise_relations_refactor/`.
- 2026-05-11: deploiement + `prisma migrate deploy` pas encore valides sur l'environnement qui plantait (a faire cote infra/prod).
