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
- [x] Diagnostiquer les images manquantes servies en 200 HTML.
- [x] Corriger le fallback des assets exercices et l'affichage en erreur.
- [x] Revalider le typage/frontend.
- [x] Recadrer les miniatures sur les positions de depart et finale.

## Notes de verification

- `npx tsc --noEmit` (dans `client/`) : OK.
- `npm run build -w client` non valide dans cet environnement WSL (Node 18, Vite requiert Node 20.19+).
- `Invoke-WebRequest https://suivi-sportif.fr/exercices-assets/images/wall-sit-chaise.png` : 200 `text/html`, contenu `index.html`; le PNG n'est pas servi.
- Inventaire local `client/public/exercices-assets/exercices.json` vs `client/public/exercices-assets/images` : 100 images referencees absentes, dont `images/wall-sit-chaise.png`.
- Correction Nginx client : `/exercices-assets/` et `/assets/` utilisent `try_files $uri =404` pour ne plus renvoyer `index.html` en faux 200.
- Correction UI : `ExerciseImagePreview` affiche `Image indisponible` quand le chargement ou le decodage image echoue.
- `npm run typecheck -w client` via WSL : OK.
- `nginx -t` via Docker non lanceable localement : Docker present dans WSL mais acces refuse a `/var/run/docker.sock`.
- Miniatures recadrees avec `object-[center_56%]`, hauteur liste reduite a `h-32`, apercu formulaire reduit a `h-24`.
- `npm run typecheck -w client` via WSL apres recadrage : OK.
