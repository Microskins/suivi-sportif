# Plan - Objectifs sport et corps

## Objectif

- Ajouter un suivi d'objectifs distinct pour le sport et le corps.
- Permettre plusieurs types d'objectifs corporels, notamment poids, IMC et masse grasse.
- Afficher ces objectifs dans des onglets dedies du dashboard, sans melanger avec les objectifs nutrition existants.

## Decisions

- Creer une ressource `userGoals` generique rattachee a l'utilisateur.
- Distinguer les objectifs par domaine (`SPORT`, `BODY`) et par metrique.
- Garder une cible numerique simple avec une direction (`AT_MOST`, `AT_LEAST`, `EXACT`) pour couvrir poids, IMC, masse grasse et objectifs sportifs simples.
- Pour les objectifs de performance, rattacher l'objectif a un exercice et reutiliser `targetValue` comme cible en kg ou repetitions selon la metrique.
- Calculer l'avancement cote frontend a partir des dernieres mensurations ou des donnees sport disponibles.

## Todo

- [x] Creer ce plan.
- [x] Ajouter les idees IA liees au chantier.
- [x] Ajouter modele Prisma, migration, schemas, queries et routes API.
- [x] Ajouter client API, store Zustand et donnees bypass.
- [x] Ajouter les onglets objectifs dans Sport et Corps.
- [x] Ajouter les objectifs de performance par exercice.
- [x] Documenter les validations et blocages locaux.

## Notes de verification

- 2026-06-01: chantier ouvert pour ajouter des objectifs sport et corps persistants.
- 2026-06-01: idee IA ajoutee dans `docs/06-idees/90-ia-idees.md` pour alertes et projections d'objectifs.
- 2026-06-01: ressource `UserGoal` ajoutee avec enums domaine/metrique/direction, migration SQL, schemas Zod, queries Prisma et routes `/api/user-goals`.
- 2026-06-01: frontend ajoute avec store Zustand, client API, donnees bypass et onglets `Objectifs` sous Sport et Corps.
- 2026-06-01: `npm run db:generate -w server`, `npm run typecheck -w client` et `npm run typecheck -w server` bloques localement: `npm`/`node` absents du PATH PowerShell.
- 2026-06-01: `git diff --check` : OK, uniquement avertissements CRLF/LF existants sur fichiers modifies.
- 2026-06-01: extension demandee pour les objectifs de performance sur exercice: 1RM estime, 10RM et max reps.
- 2026-06-01: objectifs sport etendus avec `exerciseId` optionnel et metriques `SPORT_EXERCISE_ONE_REP_MAX_KG`, `SPORT_EXERCISE_TEN_REP_MAX_KG`, `SPORT_EXERCISE_MAX_REPS`.
- 2026-06-01: `git diff --check` apres extension performance : OK, uniquement avertissements CRLF/LF existants sur fichiers modifies.
