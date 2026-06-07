# Plan - Drag bibliotheque builder seances

## Objectif

- Permettre d'ajouter un exercice au builder de seance depuis la bibliotheque filtree.
- Supporter le clic rapide et le drag-and-drop depuis la liste filtree.
- Garder le comportement frontend-only, sans changement API.

## Decisions

- Afficher une bibliotheque rapide basee sur les filtres deja presents.
- Ajouter un exercice au clic pour couvrir les usages mobiles.
- Permettre le drag depuis la bibliotheque vers une zone de depot ou une ligne existante.
- Reutiliser les repos conseilles pour pre-remplir la nouvelle ligne.

## Todo

- [x] Creer ce plan.
- [x] Ajouter l'ajout au clic depuis la bibliotheque filtree.
- [x] Ajouter le drag-and-drop depuis la bibliotheque vers le builder.
- [x] Mettre a jour les idees builder.
- [x] Lancer les validations et noter les resultats.

## Notes de verification

- 2026-06-07: chantier ouvert depuis le reste a faire `drag and drop d'un exercice depuis une bibliotheque/listing vers la seance`.
- 2026-06-07: ajout d'une bibliotheque filtree dans `WorkoutExerciseRows.tsx`, avec ajout au clic pour mobile et drag-and-drop vers une zone de depot.
- 2026-06-07: depot d'un exercice sur une ligne existante ajoute la nouvelle ligne juste apres la ligne cible.
- 2026-06-07: les lignes ajoutees depuis la bibliotheque reutilisent le repos conseille du plan `049`.
- 2026-06-07: `npm run typecheck -w client` via WSL Node 22.12.0: OK.
- 2026-06-07: `npm run test -w client -- --run` via WSL Node 22.12.0: OK, 3 fichiers, 12 tests passes.
- 2026-06-07: `npm run build -w client` via WSL Node 22.12.0: OK; avertissement Vite attendu sur chunk JS > 500 kB; `client/dist/` genere puis supprime apres verification.
