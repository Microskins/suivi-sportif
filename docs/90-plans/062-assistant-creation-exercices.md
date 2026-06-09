# Plan - Assistant creation exercices

## Objectif

- Permettre a l'assistant IA de preparer un brouillon de creation d'exercice sportif.
- Reutiliser le store et l'API exercices existants.
- Garder une confirmation utilisateur avant l'ajout a la bibliotheque.

## Decisions

- Ajouter une action `create_exercise` dans le contrat assistant.
- Les champs minimum sont `name`; `difficulty`, `exerciseType`, `description` et `bodyParts` peuvent etre proposes ou prendre les valeurs par defaut.
- Aucune creation automatique pendant une seance: l'exercice est cree d'abord, puis il peut etre utilise dans une seance.

## Todo

- [x] Creer ce plan.
- [x] Ajouter l'action backend `create_exercise`.
- [x] Brancher l'application frontend via `exercisesStore`.
- [x] Ameliorer l'affichage chatbox pour le brouillon exercice.
- [x] Valider et documenter.

## Notes de verification

- 2026-06-09: besoin produit: ajouter un exercice de sport via l'assistant, comme les aliments.
- 2026-06-09: action `create_exercise` ajoutee au contrat assistant et au prompt IA.
- 2026-06-09: application frontend branchee via `exercisesStore.createExercise`, puis rafraichissement de la bibliotheque.
- 2026-06-09: la chatbox affiche un bloc lisible "Exercice propose" avec type, difficulte et parties du corps.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w server"` OK.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w client"` OK.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run test -w server -- --run src/routes/api.test.ts -t exercise'` OK, 20 tests passes.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w client -- --run src/components/dashboard/AssistantChatbox.test.tsx"` OK, 4 tests passes.
