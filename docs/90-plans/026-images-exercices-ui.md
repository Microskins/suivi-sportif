# Plan - Images exercices dans UI

## Objectif

- Afficher l'image associee a chaque exercice dans l'onglet Exercices.
- Afficher un apercu image au survol/focus de l'exercice selectionne dans le formulaire de seance.

## Decisions

- Exposer `exercices/` via Vite `publicDir` pour servir `exercices.json` et `images/*`.
- Charger le catalogue image cote `Dashboard` via `fetch("/exercices.json")`.
- Associer image <-> exercice par nom normalise (accents/casse ignores).

## Todo

- [x] Ajouter `publicDir` vers `../exercices` dans Vite.
- [x] Charger le catalogue image dans `Dashboard`.
- [x] Afficher image dans la liste Exercices.
- [x] Ajouter apercu image au survol/focus dans le formulaire de seance.
- [x] Verifier le typage TypeScript.

## Notes de verification

- `npx tsc --noEmit` (dans `client/`) : OK.
- `npm run build -w client` non valide dans cet environnement WSL (Node 18, Vite requiert Node 20.19+).