# Plan - Suivi cardio dans les seances

## Objectif

- Ajouter des metriques cardio utiles sur les series de seances: duree, km/h moyen, inclinaison.
- Adapter API + frontend pour que les exercices cardio ne forcent plus des champs musculation inutiles.

## Decisions

- Les champs cardio sont portes par `WorkoutSet` (pas de structure parallele).
- Les champs ajoutes sont:
  - `durationMinutes` (minutes decimales),
  - `avgKmh`,
  - `inclinePercent` (nullable).
- Pour les exercices `CARDIO`, `durationMinutes` et `avgKmh` sont requis.
- Pour les exercices non `CARDIO`, la logique actuelle `reps/weight/rest` reste requise.
- `reps` et `weight` restent en base pour compatibilite historique.

## Todo

- [x] Creer ce plan.
- [x] Ajouter migration Prisma + schema `WorkoutSet` cardio.
- [x] Mettre a jour validation backend (schemas + controle conditionnel cardio/non-cardio).
- [x] Mettre a jour queries workouts (lecture/ecriture des champs cardio).
- [x] Mettre a jour routes workouts (OpenAPI request/response).
- [x] Mettre a jour types client API.
- [x] Mettre a jour le formulaire de seance (UI cardio dediee).
- [x] Mettre a jour les tests backend cibles.
- [x] Mettre a jour la doc API.
- [x] Lancer les verifications et noter les resultats.

## Notes de verification

- Commande lancee:
  - `npm run test -w server -- --run src/db/queries/workouts.test.ts src/routes/api.test.ts`
- Resultat:
  - echec d'environnement: `npm` introuvable dans le shell (`CommandNotFoundException`).
