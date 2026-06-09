# Plan - Chat assistant interactif

## Objectif

- Rendre l'assistant plus conversationnel: le modele repond en langage naturel.
- Garder les brouillons d'action confirmables avant mutation.
- Afficher dans l'historique la reponse de l'assistant plutot que seulement le resume technique.

## Decisions

- Ajouter un champ `reply` au brouillon assistant.
- Ne pas appliquer automatiquement les mutations sans confirmation utilisateur.
- Conserver `summary` pour le resume d'action et `reply` pour le chat.

## Todo

- [x] Creer ce plan.
- [x] Ajouter `reply` au contrat backend/frontend.
- [x] Demander au modele une reponse conversationnelle.
- [x] Afficher `reply` dans la chatbox et l'historique.
- [x] Valider backend/frontend.

## Notes de verification

- 2026-06-09: demande produit: rendre l'assistant proche d'un chat interactif qui repond et prepare/ajoute les donnees avec confirmation.
- 2026-06-09: champ `reply` ajoute aux brouillons assistant pour afficher une reponse naturelle dans la chatbox.
- 2026-06-09: le prompt Anthropic demande une reponse courte et utile en plus du brouillon structure.
- 2026-06-09: l'historique frontend stocke `reply` et ajoute un message apres application confirmee.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w server"` OK.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w client"` OK.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run test -w server -- --run src/routes/api.test.ts -t assistant'` OK, 3 tests passes.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w client -- --run src/components/dashboard/AssistantChatbox.test.tsx"` OK, 4 tests passes.
