# Plan - Chat box IA sans brouillons

## Objectif

- Transformer l'assistant en vraie chat box IA.
- Supprimer toute UI de brouillon et de confirmation visible.
- Conserver la capacite de traiter les demandes du compte courant et d'appliquer automatiquement les actions completes quand c'est possible.

## Decisions

- L'interface ne montrera plus de carte de brouillon, de JSON technique ni de bouton de confirmation.
- Les messages du chat restent la source de verite pour l'utilisateur; les actions completes peuvent etre appliquees automatiquement apres la reponse de l'assistant.
- Les reponses de l'assistant doivent parler comme un chat, sans vocabulaire de brouillon.
- Le contrat d'API et la documentation publique doivent passer au vocabulaire "chat" pour ne plus exposer le flux de brouillon.

## Todo

- [x] Creer ce plan.
- [x] Refonte de `AssistantChatbox` en conversation a bulles.
- [x] Supprimer l'affichage des brouillons, du JSON technique et du bouton de confirmation.
- [x] Auto-appliquer les actions completes depuis le chat et conserver les relances pour les cas incomplets.
- [x] Ajuster les reponses assistant/backend pour un vocabulaire purement conversationnel.
- [x] Mettre a jour les tests frontend/backend et les docs publiques.
- [x] Verifier le build et les tests cibles.

## Notes de verification

- 2026-06-17: plan cree suite a la demande de passer de l'interface brouillon/confirmation a une chat box IA.
- 2026-06-17: la chat box affiche maintenant une conversation a bulles avec auto-application des actions completes et sans carte de brouillon visible.
- 2026-06-17: les reponses assistant ont ete reformulees pour un ton chat, et la documentation publique a ete alignee sur ce vocabulaire.
- 2026-06-17: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run test -w client -- --run src/components/dashboard/AssistantChatbox.test.tsx'` OK.
- 2026-06-17: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run test -w server -- --run src/routes/api.test.ts -t assistant'` OK.
- 2026-06-17: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run typecheck -w client'` OK.
- 2026-06-17: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run typecheck -w server'` OK.
