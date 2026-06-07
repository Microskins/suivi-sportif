# Plan - Tutoriels echauffement Tabata builder

## Objectif

- Ajouter des raccourcis de tutoriels depuis le builder de seances.
- Ajouter des blocs d'echauffement rapides.
- Ajouter un mode Tabata simple sans changement API.

## Decisions

- Utiliser un lien de recherche YouTube genere depuis le nom de l'exercice, sans stocker d'URL en base.
- Ajouter les blocs d'echauffement comme lignes d'exercices pre-remplies.
- Ajouter Tabata comme ligne cardio avec 8 series chronometrees, si un exercice cardio existe.
- Rester compatible avec le schema actuel des seances.

## Todo

- [x] Creer ce plan.
- [x] Ajouter les liens tutoriels depuis le builder de seance.
- [x] Ajouter un bloc d'echauffement rapide.
- [x] Ajouter un bloc Tabata rapide.
- [x] Mettre a jour les idees builder.
- [x] Lancer les validations et noter les resultats.

## Notes de verification

- 2026-06-07: chantier ouvert pour finir les restes a faire actionnables de `02-builder-seances.md`.
- 2026-06-07: bouton tutoriel ajoute sur chaque ligne du builder; il ouvre une recherche YouTube basee sur le nom de l'exercice.
- 2026-06-07: action `Ajouter echauffement` ajoute une ligne pre-remplie depuis un exercice mobilite, cardio ou le premier exercice disponible.
- 2026-06-07: action `Ajouter Tabata` ajoute 8 intervalles cardio de 20 secondes avec 10 secondes de repos, si un exercice cardio existe.
- 2026-06-07: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w client"` OK.
- 2026-06-07: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w client -- --run"` OK, 3 fichiers et 12 tests.
- 2026-06-07: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run build -w client"` OK; warning Vite connu sur chunk > 500 kB, `client/dist` supprime apres verification.
