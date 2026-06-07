# Plan - Drag bibliotheque builder repas

## Objectif

- Permettre d'ajouter un aliment au builder de repas depuis la bibliotheque filtree.
- Supporter le clic rapide et le drag-and-drop depuis la liste filtree.
- Garder le comportement frontend-only, sans changement API.

## Decisions

- Reutiliser les filtres aliments deja presents dans `MealForm`.
- Ajouter un aliment au clic pour couvrir les usages mobiles.
- Permettre le drag depuis la bibliotheque vers une zone de depot ou une ligne existante.
- Pre-remplir la quantite a `100` pour rester coherent avec le comportement actuel.

## Todo

- [x] Creer ce plan.
- [x] Ajouter l'ajout au clic depuis la bibliotheque filtree.
- [x] Ajouter le drag-and-drop depuis la bibliotheque vers le repas.
- [x] Mettre a jour les idees builder.
- [x] Lancer les validations et noter les resultats.

## Notes de verification

- 2026-06-07: chantier ouvert depuis le reste a faire `permettre de glisser/deposer un aliment dans le repas`.
- 2026-06-07: ajout d'une bibliotheque filtree dans `MealForm.tsx`, avec ajout au clic pour mobile et drag-and-drop vers une zone de depot.
- 2026-06-07: depot d'un aliment sur une ligne existante ajoute la nouvelle ligne juste apres la ligne cible.
- 2026-06-07: les lignes ajoutees depuis la bibliotheque gardent la quantite par defaut de 100 g.
- 2026-06-07: `npm run typecheck -w client` via WSL Node 22.12.0: OK.
- 2026-06-07: `npm run test -w client -- --run` via WSL Node 22.12.0: OK, 3 fichiers, 12 tests passes.
- 2026-06-07: `npm run build -w client` via WSL Node 22.12.0: OK; avertissement Vite attendu sur chunk JS > 500 kB; `client/dist/` genere puis supprime apres verification.
