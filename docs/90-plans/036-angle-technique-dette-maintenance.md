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
