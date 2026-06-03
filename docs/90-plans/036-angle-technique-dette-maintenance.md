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

## Cartographie des hotspots

| Zone | Taille / signal | Risque principal | Lecture |
| --- | ---: | --- | --- |
| `client/src/components/Dashboard.tsx` | 4410 lignes | Couplage UX, formulaires, helpers, listes et dashboard dans un seul fichier | Hotspot prioritaire |
| `server/src/routes/api.test.ts` | 2286 lignes | Tests API tres longs, difficiles a cibler rapidement | A decouper apres stabilisation frontend |
| `client/src/api/client.ts` | 622 lignes | Contrat API centralise, acceptable mais a surveiller | Pas prioritaire |
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
