# Plan - Modeles favoris repas

## Objectif

- Formaliser des modeles/favoris de repas dans le builder repas.
- Permettre de sauvegarder un repas courant comme modele local.
- Permettre de reappliquer un modele rapidement sans changement backend.

## Decisions

- Stocker les modeles de repas dans `localStorage` cote client.
- Garder les modeles comme aide de saisie locale, pas comme ressource API.
- Reutiliser les aliments et quantites du formulaire courant.
- Laisser le backend inchange tant que le besoin de synchronisation multi-appareils n'est pas confirme.

## Todo

- [x] Creer ce plan.
- [x] Ajouter le stockage local des modeles de repas.
- [x] Ajouter les actions sauvegarder/appliquer/supprimer un modele.
- [x] Mettre a jour les idees builder.
- [x] Lancer les validations et noter les resultats.

## Notes de verification

- 2026-06-07: chantier ouvert depuis le reste a faire `formaliser de vrais modeles/favoris de repas si le besoin revient`.
- 2026-06-07: modeles locaux ajoutes dans le formulaire repas avec actions sauvegarder, appliquer et supprimer.
- 2026-06-07: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w client"` OK.
- 2026-06-07: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w client -- --run"` OK, 3 fichiers et 12 tests.
- 2026-06-07: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run build -w client"` OK; warning Vite connu sur chunk > 500 kB, `client/dist` supprime apres verification.
