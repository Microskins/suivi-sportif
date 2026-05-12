# Plan - Calendrier suivi et statut seances

## Objectif

- Ajouter une vue Calendrier (mois/semaine) dans le Dashboard.
- Afficher les seances par jour avec statut (prevue, realisee, annulee).
- Permettre planification rapide et association d'une seance existante a un jour.

## Decisions

- Ajout d'un statut en base: `PLANNED | COMPLETED | CANCELED` sur `Workout`.
- Creation workout: statut automatique selon la date si non fourni (futur=PLANNED, passe/maintenant=COMPLETED).
- Le poids journalier est explicitement reporte au v2.
- Le deplacement v1 passe par modification explicite de date (pas de drag-and-drop).

## Todo

- [x] Creer ce plan.
- [x] Ajouter migration + schema Prisma du statut workout.
- [x] Mettre a jour schemas, queries, routes et tests backend.
- [x] Mettre a jour types/stores frontend pour supporter le statut.
- [x] Ajouter la vue calendrier dans le Dashboard (mois/semaine + interactions v1).
- [x] Ajouter tests frontend du calendrier.
- [x] Mettre a jour docs (idee + plan) et noter verifications.

## Notes de verification

- Commandes prevues:
  - `npm run typecheck -w server`
  - `npm run test -w server -- --run src/db/queries/workouts.test.ts src/routes/api.test.ts`
  - `npm run typecheck -w client`
  - `npm run test -w client -- --run src/components/WorkoutsCalendar.test.tsx`
- Resultat: non executees dans cet environnement local car `npm` est indisponible dans le shell courant (`CommandNotFoundException`).
- Verification manuelle de coherence: le statut workout est propage de Prisma jusqu'au frontend, la vue calendrier propose mois/semaine, planification rapide, association de seance existante, et edition via modal existante.
