# Plan - Assistant creation aliments

## Objectif

- Permettre a l'assistant IA de preparer un brouillon de creation d'aliment.
- Expliquer clairement pourquoi un repas reste bloque quand des aliments ne sont pas encore connus.
- Garder la confirmation utilisateur avant toute creation.

## Decisions

- Ajouter une action `create_food` plutot qu'une creation automatique cachee pendant un repas.
- Un repas reste applique seulement si les `foodId` et quantites sont disponibles.
- Les valeurs nutritionnelles proposees par l'IA sont affichees comme brouillon confirmable.

## Todo

- [x] Creer ce plan.
- [x] Ajouter l'action assistant `create_food` cote backend.
- [x] Brancher l'application du brouillon cote frontend.
- [x] Ameliorer l'explication UI des champs manquants.
- [x] Valider et documenter.

## Notes de verification

- 2026-06-09: besoin observe en prod: le repas est bloque quand un aliment comme `flocon d'avoine` n'existe pas encore dans la base ou n'a pas de quantite exploitable.
- 2026-06-09: action assistant `create_food` ajoutee avec payload nutritionnel compatible `FoodInput`.
- 2026-06-09: UI chatbox ajustee: champs manquants affiches en libelles humains, aliments detectes visibles, JSON replie dans "donnees techniques".
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w server"` OK.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w client"` OK.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run test -w server -- --run src/routes/api.test.ts -t food'` OK, 19 tests passes.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w client -- --run src/components/dashboard/AssistantChatbox.test.tsx"` OK, 4 tests passes.
- 2026-06-09: correction du nettoyage des noms d'aliments: une demande comme `fruit rouge ?Calories...` garde seulement `fruit rouge` dans `name`.
- 2026-06-09: sanitation appliquee aussi aux brouillons Anthropic avant retour API.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w server"` OK apres correction.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run test -w server -- --run src/routes/api.test.ts -t food'` OK, 21 tests passes.
