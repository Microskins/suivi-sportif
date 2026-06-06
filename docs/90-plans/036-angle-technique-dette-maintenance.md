# Plan - Angle technique: dette et maintenance

## Objectif

- Reperer et reduire les points de friction structurels qui ralentissent les evolutions.
- Diminuer la taille des zones trop monolithiques et du code a fort couplage.
- Remettre a niveau les scripts et la documentation de base quand un ecart est detecte.

## Decisions

- Commencer par les hotspots les plus couteux a lire et tester: `Dashboard`, `api.test.ts`, scripts racine, docs de demarrage.
- Privilegier des extractions progressives et verifiables plutot qu'une refonte globale.
- Ne pas changer le metier tant que la structure n'est pas plus lisible.
- S'appuyer sur les tests existants pour securiser chaque etape.
- Extraire par domaines UI deja visibles plutot que par types techniques generiques.
- Adopter une cible de 500 lignes maximum par fichier, sauf fichier genere, config volumineuse ou exception documentee dans ce plan.

## Cartographie des hotspots

| Zone | Taille / signal | Risque principal | Lecture |
| --- | ---: | --- | --- |
| `client/src/components/Dashboard.tsx` | 4410 lignes | Couplage UX, formulaires, helpers, listes et dashboard dans un seul fichier | Hotspot prioritaire |
| `server/src/routes/api.test.ts` | 2286 lignes | Tests API tres longs, difficiles a cibler rapidement | A decouper apres stabilisation frontend |
| `server/prisma/prod-seed.mjs` | 1226 lignes | Donnees de seed volumineuses dans un script executable | A isoler en donnees plus tard |
| `server/prisma/seed.ts` | 1085 lignes | Donnees de seed developpement volumineuses | A isoler en donnees plus tard |
| `client/src/api/client.ts` | 622 lignes | Contrat API centralise, acceptable mais a surveiller | Pas prioritaire |
| `client/src/stores/bypassMockData.ts` | 610 lignes | Donnees mockees volumineuses | A separer par domaine si besoin |
| `client/src/components/DashboardOverview.tsx` | composant dedie | Deja extrait | Bon modele local |
| `client/src/components/WorkoutsCalendar.tsx` | composant dedie | Deja extrait | Bon modele local |

## Extractions recommandees

Ordre conseille:

1. `dashboard/forms/`
   - `WorkoutForm`, `WorkoutTemplatePicker`, `MealForm`, `FoodForm`, `NutritionGoalForm`, `UserGoalForm`, `BodyMeasurementForm`, `ProfileForm`.
   - Gain: reduire la charge de lecture et isoler les validations de formulaire.

2. `dashboard/lists/`
   - `WorkoutsList`, `ExercisesList`, `FoodsList`, `MealsList`, `NutritionGoalsList`, `BodyMeasurementsList`.
   - Gain: rendre les etats vides, actions et filtres plus faciles a tester.

3. `dashboard/body/` et `dashboard/goals/`
   - Calculs mensurations, interpretation corporelle, progression sportive, objectifs.
   - Gain: separer les calculs derives des composants de navigation.

4. `dashboard/shared/`
   - `Field`, `ErrorBox`, `EmptyState`, actions, styles de boutons, helpers de format.
   - Gain: supprimer les duplications quand les domaines sont deja sortis.

5. `server/src/routes/api.test.ts`
   - Decouper par route ou domaine apres extraction frontend.
   - Gain: tests plus ciblables et plus faciles a maintenir.

## Regles d'extraction

- Une extraction par commit maximum.
- Aucun changement de comportement attendu dans une extraction pure.
- Garder les props explicites; ne pas introduire de store global supplementaire.
- Lancer au minimum `tsc`, lint client et tests client apres chaque extraction frontend.
- Pour les helpers metier derives, ajouter ou conserver un test si le calcul devient isolable.
- Viser 500 lignes maximum par fichier de code ou doc maintenue a la main.
- Exceptions temporaires autorisees: fichiers generes, seeds volumineux, donnees statiques, ou tests historiques; chaque exception doit etre notee ici avec un plan de sortie.

## Todo

- [x] Creer ce plan.
- [x] Cartographier les hotspots techniques du repo.
- [x] Identifier les extractions a plus fort retour sur effort.
- [ ] Decouper les zones trop monolithiques sans casser les APIs internes.
- [x] Regler les ecarts de scripts ou de documentation reveles par l'audit.
- [x] Repasser les verifications de base pertinentes.

## Notes de verification

- 2026-06-03: plan cree a partir du constat de dette de maintenance autour du frontend, des tests API et des scripts racine.
- 2026-06-03: aucune verification d'execution lancee a ce stade; chantier de cadrage uniquement.
- 2026-06-03: ecarts corriges: script `setup` manquant, script racine `dev` fragile, versions README Fastify/Vite/Node, mention Swagger, structure d'architecture, CORS production et `JWT_SECRET` production.
- 2026-06-03: validations lancees via binaires locaux: typecheck server/client/mcp, tests server/client, lint server/client.
- 2026-06-03: cartographie ajoutee: `Dashboard.tsx` est le hotspot prioritaire, suivi de `api.test.ts`; ordre d'extraction recommande par formulaires, listes, domaines calcules, shared UI puis tests API.
- 2026-06-03: premiere extraction lancee: `ProfileForm` sorti vers `client/src/components/dashboard/ProfileForm.tsx`, puis helpers UI sortis vers `client/src/components/dashboard/shared.tsx`; `Dashboard.tsx` passe de 4410 a 4247 lignes.
- 2026-06-03: regle projet adoptee: 500 lignes max par fichier, sauf exception documentee. Exceptions temporaires identifiees: seeds Prisma, `api.test.ts`, `client.ts`, `bypassMockData.ts`.
- 2026-06-03: validations apres extraction `ProfileForm` et `shared.tsx`: `tsc --noEmit -p client\tsconfig.json`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-03: deuxieme extraction: `FoodForm` sorti vers `client/src/components/dashboard/FoodForm.tsx`; `MacroInput` deplace dans `shared.tsx`; `Dashboard.tsx` passe de 4247 a 4168 lignes.
- 2026-06-03: validations apres extraction `FoodForm`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-03: troisieme extraction: `NutritionGoalForm` sorti vers `client/src/components/dashboard/NutritionGoalForm.tsx`; `Dashboard.tsx` passe de 4168 a 4110 lignes.
- 2026-06-03: validations apres extraction `NutritionGoalForm`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: quatrieme extraction: `BodyMeasurementForm` sorti vers `client/src/components/dashboard/BodyMeasurementForm.tsx`; constantes mensurations sorties vers `client/src/components/dashboard/bodyMeasurements.ts`; `Dashboard.tsx` passe de 4110 a 3971 lignes.
- 2026-06-06: validations apres extraction `BodyMeasurementForm`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: cinquieme extraction: `UserGoalForm` sorti vers `client/src/components/dashboard/UserGoalForm.tsx`; options objectifs sorties vers `client/src/components/dashboard/userGoals.ts`; `Dashboard.tsx` passe de 3971 a 3757 lignes.
- 2026-06-06: validations apres extraction `UserGoalForm`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: sixieme extraction: `FoodsList` sorti vers `client/src/components/dashboard/FoodsList.tsx`; `ItemActions` deplace dans `shared.tsx`; `Dashboard.tsx` passe de 3757 a 3697 lignes.
- 2026-06-06: validations apres extraction `FoodsList`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: septieme extraction: `NutritionGoalsList` sorti vers `client/src/components/dashboard/NutritionGoalsList.tsx`; `Dashboard.tsx` passe de 3697 a 3674 lignes.
- 2026-06-06: validations apres extraction `NutritionGoalsList`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: huitieme extraction: `MealsList` sorti vers `client/src/components/dashboard/MealsList.tsx`; `Dashboard.tsx` passe de 3674 a 3640 lignes.
- 2026-06-06: validations apres extraction `MealsList`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: neuvieme extraction: `WorkoutsList` sorti vers `client/src/components/dashboard/WorkoutsList.tsx`; `Dashboard.tsx` passe de 3640 a 3570 lignes.
- 2026-06-06: validations apres extraction `WorkoutsList`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: dixieme extraction: `ExercisesList` sorti vers `client/src/components/dashboard/ExercisesList.tsx`; `ExerciseImagePreview` deplace dans `shared.tsx`; `Dashboard.tsx` passe de 3570 a 3402 lignes.
- 2026-06-06: validations apres extraction `ExercisesList`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: onzieme extraction: `ResourceHeader` sorti vers `client/src/components/dashboard/ResourceHeader.tsx`; `Dashboard.tsx` passe de 3402 a 3335 lignes.
- 2026-06-06: validations apres extraction `ResourceHeader`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: douzieme extraction: `Modal` sorti vers `client/src/components/dashboard/Modal.tsx`; `Dashboard.tsx` passe de 3335 a 3309 lignes.
- 2026-06-06: validations apres extraction `Modal`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: treizieme extraction: `ModalState`, `openCreate` et `modalTitle` sortis vers `client/src/components/dashboard/modalState.ts`; `Dashboard.tsx` passe de 3309 a 3287 lignes.
- 2026-06-06: validations apres extraction helpers modale: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: quatorzieme extraction: `ExerciseForm` sorti vers `client/src/components/dashboard/ExerciseForm.tsx`; `Dashboard.tsx` passe de 3287 a 3186 lignes.
- 2026-06-06: validations apres extraction `ExerciseForm`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `git diff --check`.
- 2026-06-06: quinzieme extraction: `NutritionDayPanel` sorti vers `client/src/components/dashboard/NutritionDayPanel.tsx`; helpers nutrition partages sortis vers `client/src/components/dashboard/nutrition.ts`; `Dashboard.tsx` passe de 3186 a 3082 lignes.
- 2026-06-06: validations apres extraction `NutritionDayPanel`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: seizieme extraction: `MealForm` et `duplicateMealInput` sortis vers `client/src/components/dashboard/MealForm.tsx`; `Dashboard.tsx` passe de 3082 a 2774 lignes.
- 2026-06-06: validations apres extraction `MealForm`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: dix-septieme extraction: `UserGoalsPanel` et ses helpers d'affichage sortis vers `client/src/components/dashboard/UserGoalsPanel.tsx`; `Dashboard.tsx` passe de 2774 a 2482 lignes.
- 2026-06-06: validations apres extraction `UserGoalsPanel`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: dix-huitieme extraction: `SportProgressionPanel` et ses helpers sportifs sortis vers `client/src/components/dashboard/SportProgressionPanel.tsx`; `Dashboard.tsx` passe de 2482 a 2309 lignes.
- 2026-06-06: validations apres extraction `SportProgressionPanel`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: dix-neuvieme extraction: `BodyMeasurementDiagram` sorti vers `client/src/components/dashboard/BodyMeasurementDiagram.tsx`; `Dashboard.tsx` passe de 2309 a 2202 lignes.
- 2026-06-06: validations apres extraction `BodyMeasurementDiagram`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: vingtieme extraction: `BodyMeasurementTrends` sorti vers `client/src/components/dashboard/BodyMeasurementTrends.tsx`; calculs corporels partages sortis vers `client/src/components/dashboard/bodyMetrics.ts`; `Dashboard.tsx` passe de 2202 a 1983 lignes.
- 2026-06-06: validations apres extraction `BodyMeasurementTrends` et `bodyMetrics`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: vingt-et-unieme extraction: `BodyInterpretation` sorti vers `client/src/components/dashboard/BodyInterpretation.tsx`; `Dashboard.tsx` passe de 1983 a 1933 lignes.
- 2026-06-06: validations apres extraction `BodyInterpretation`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: vingt-deuxieme extraction: `BodyMeasurementsList` sorti vers `client/src/components/dashboard/BodyMeasurementsList.tsx`; `Dashboard.tsx` passe de 1933 a 1790 lignes.
- 2026-06-06: validations apres extraction `BodyMeasurementsList`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: vingt-troisieme extraction: options, types et helpers des formulaires workout sortis vers `client/src/components/dashboard/workoutFormUtils.ts`; helpers date inutilises retires; `Dashboard.tsx` passe de 1790 a 1709 lignes.
- 2026-06-06: validations apres extraction `workoutFormUtils`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: vingt-quatrieme extraction: `WorkoutExerciseFilters` sorti vers `client/src/components/dashboard/WorkoutExerciseFilters.tsx`; `Dashboard.tsx` passe de 1709 a 1649 lignes.
- 2026-06-06: validations apres extraction `WorkoutExerciseFilters`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: vingt-cinquieme extraction: `WorkoutExerciseRows` sorti vers `client/src/components/dashboard/WorkoutExerciseRows.tsx`; `Dashboard.tsx` passe de 1649 a 1448 lignes.
- 2026-06-06: validations apres extraction `WorkoutExerciseRows`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: vingt-sixieme extraction: `WorkoutForm` sorti vers `client/src/components/dashboard/WorkoutForm.tsx`; `Dashboard.tsx` passe de 1448 a 1222 lignes.
- 2026-06-06: validations apres extraction `WorkoutForm`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: vingt-septieme extraction: `WorkoutTemplateFilters` sorti vers `client/src/components/dashboard/WorkoutTemplateFilters.tsx`; `Dashboard.tsx` passe de 1222 a 1202 lignes.
- 2026-06-06: validations apres extraction `WorkoutTemplateFilters`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: vingt-huitieme extraction: `WorkoutTemplateRows` sorti vers `client/src/components/dashboard/WorkoutTemplateRows.tsx`; `Dashboard.tsx` passe de 1202 a 1106 lignes.
- 2026-06-06: validations apres extraction `WorkoutTemplateRows`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: vingt-neuvieme extraction: `WorkoutTemplatePicker` sorti vers `client/src/components/dashboard/WorkoutTemplatePicker.tsx`; `Dashboard.tsx` passe de 1106 a 760 lignes.
- 2026-06-06: validations apres extraction `WorkoutTemplatePicker`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: trentieme extraction: `DashboardNav` sorti vers `client/src/components/dashboard/DashboardNav.tsx`; `Dashboard.tsx` passe de 760 a 668 lignes.
- 2026-06-06: validations apres extraction `DashboardNav`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: trente-et-unieme extraction: `DashboardTopBar` sorti vers `client/src/components/dashboard/DashboardTopBar.tsx`; `Dashboard.tsx` passe de 668 a 660 lignes.
- 2026-06-06: validations apres extraction `DashboardTopBar`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: trente-deuxieme extraction: contenu des modales dashboard sorti vers `client/src/components/dashboard/DashboardModalContent.tsx`; `Dashboard.tsx` passe de 660 a 640 lignes.
- 2026-06-06: validations apres extraction `DashboardModalContent`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: trente-troisieme extraction: section seances sortie vers `client/src/components/dashboard/DashboardWorkoutsSection.tsx`; `Dashboard.tsx` passe de 640 a 634 lignes.
- 2026-06-06: validations apres extraction `DashboardWorkoutsSection`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: trente-quatrieme extraction: section repas sortie vers `client/src/components/dashboard/DashboardMealsSection.tsx`; `Dashboard.tsx` passe de 634 a 606 lignes.
- 2026-06-06: validations apres extraction `DashboardMealsSection`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: trente-cinquieme extraction: section mensurations sortie vers `client/src/components/dashboard/DashboardMeasurementsSection.tsx`; `Dashboard.tsx` passe de 606 a 594 lignes.
- 2026-06-06: validations apres extraction `DashboardMeasurementsSection`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: trente-sixieme extraction: section exercices sortie vers `client/src/components/dashboard/DashboardExercisesSection.tsx`; `Dashboard.tsx` passe de 594 a 582 lignes.
- 2026-06-06: validations apres extraction `DashboardExercisesSection`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
- 2026-06-06: trente-septieme extraction: section objectifs sport/corps sortie vers `client/src/components/dashboard/DashboardGoalsSection.tsx`; `Dashboard.tsx` passe de 582 a 574 lignes.
- 2026-06-06: validations apres extraction `DashboardGoalsSection`: typecheck client via Node runtime Codex + `node_modules/typescript/bin/tsc`, `eslint client\src --ext .ts,.tsx`, `vitest --run client`, `git diff --check`.
