# Plan - Assistant chat V2

## Objectif

- Rendre l'assistant capable de reprendre un brouillon en cours avec les reponses utilisateur.
- Permettre de completer les champs manquants depuis le chat, sans repartir de zero.
- Garder la confirmation explicite avant toute mutation.

## Decisions

- Ajouter `currentDraft` au contrat de demande assistant pour transmettre le brouillon actif.
- Fusionner les informations de suivi cote serveur avant enrichissement.
- Demarrer par les repas et aliments: quantites, macros et champs manquants les plus frequents.
- L'interface doit inviter a repondre dans le chat quand un brouillon est incomplet.

## Todo

- [x] Creer ce plan.
- [x] Ajouter `currentDraft` au schema API et au client.
- [x] Implementer la fusion conversationnelle des brouillons.
- [x] Adapter la chatbox pour envoyer le brouillon actif.
- [x] Ajouter les tests API et frontend utiles.
- [x] Valider backend/frontend.

## Notes de verification

- 2026-06-09: chantier lance apres demande de passer l'assistant en V2 type chat plus interactif.
- 2026-06-09: `currentDraft` ajoute au contrat API pour transmettre le brouillon actif lors d'une reponse utilisateur.
- 2026-06-09: reprise conversationnelle implementee pour completer les quantites de repas et les macros d'aliments depuis le chat.
- 2026-06-09: la chatbox envoie maintenant le brouillon actif et adapte son CTA en `Completer le brouillon`.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run test -w server -- --run src/routes/api.test.ts -t "continues a meal draft"'` OK.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run test -w server -- --run src/routes/api.test.ts -t "breakfast draft"'` OK.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run test -w client -- --run src/components/dashboard/AssistantChatbox.test.tsx'` OK, 5 tests passes.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run typecheck -w server'` OK.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run typecheck -w client'` OK.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run test -w server -- --run'` OK, 185 tests passes.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run build -w server'` OK; `server/dist/` supprime apres verification.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run build -w client'` OK avec avertissement bundle > 500 kB deja connu; `client/dist/` supprime apres verification.
