# Plan - Lookup code-barres aliments

## Objectif

- Connecter une source externe de code-barres pour pre-remplir un aliment.
- Utiliser Open Food Facts via un endpoint backend authentifie.
- Garder l'import comme aide de saisie, avec validation utilisateur avant sauvegarde.

## Decisions

- Appeler Open Food Facts depuis le backend pour respecter le User-Agent custom demande par l'API.
- Exposer un endpoint protege `GET /api/foods/barcode/:barcode/lookup`.
- Ne pas persister automatiquement les donnees externes: le formulaire aliment reste la source de validation.
- Importer uniquement nom, marque, code-barres et macros par 100 g.
- Utiliser les champs v3 `product_name`, `brands` et `nutriments`.

## Todo

- [x] Creer ce plan.
- [x] Ajouter le service Open Food Facts cote backend.
- [x] Ajouter l'endpoint API protege et ses tests.
- [x] Ajouter le client frontend et le bouton d'import.
- [x] Mettre a jour les idees builder.
- [x] Lancer les validations et noter les resultats.

## Notes de verification

- 2026-06-07: Open Food Facts documente `GET /api/v3/product/{code}` et recommande un User-Agent applicatif; le lookup passe donc par le backend.
- 2026-06-07: import ajoute dans le formulaire aliment; les donnees externes pre-remplissent le formulaire sans sauvegarde automatique.
- 2026-06-07: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w server"` OK.
- 2026-06-07: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w client"` OK.
- 2026-06-07: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w server -- --run"` a d'abord atteint le timeout Vitest 5 s sur un test CORS existant; les nouveaux tests code-barres etaient OK dans cette execution.
- 2026-06-07: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w server -- --run --testTimeout=15000"` OK, 5 fichiers et 170 tests.
- 2026-06-07: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w client -- --run"` OK, 3 fichiers et 12 tests.
- 2026-06-07: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run build -w server"` OK; `server/dist` supprime apres verification.
- 2026-06-07: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run build -w client"` OK; warning Vite connu sur chunk > 500 kB, `client/dist` supprime apres verification.
- 2026-06-07: `git diff --check` OK.
