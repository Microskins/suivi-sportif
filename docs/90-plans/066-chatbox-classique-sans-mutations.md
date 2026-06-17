# Plan - Chat box classique sans mutations

## Objectif

- Revenir a une vraie chat box IA classique.
- Supprimer le flux d'action interne visible ou implicite depuis le chat.
- Garder l'assistant comme un outil de conversation, d'explication et d'aide a la navigation, sans ecriture de donnees depuis le fil.

## Decisions

- Le chat ne declenche plus d'application automatique de donnees.
- Les demandes de modification, creation ou suppression sont repondues comme de simples messages conversationnels, avec redirection vers l'ecran adapte si besoin.
- L'UI ne montre plus de vocabulaire de brouillon, de confirmation ou de champs manquants.
- La conversation continue a conserver l'historique local et les exemples rapides, mais uniquement pour le chat.

## Todo

- [x] Creer ce plan.
- [x] Retirer l'auto-application et le contexte de brouillon de l'UI du chat.
- [x] Refaire la reponse serveur en mode conversationnel pur.
- [x] Ajuster les tests frontend et backend sur le nouveau comportement.
- [x] Mettre a jour la documentation publique pour parler d'un chat classique.
- [ ] Verifier les tests et le typecheck.

## Notes de verification

- 2026-06-17: plan cree suite au retour utilisateur demandant d'abandonner le faux flux brouillon/mutation au profit d'un chat classique.
- 2026-06-17: log GitHub Actions 27679981077 analyse. Echec du job Deploy sur `ENOSPC` pendant `docker build` du client, au moment de recopier `client/public/exercices-assets/images/dips-buste-penche.png` vers `dist`.
- 2026-06-17: correctif ajoute pour eviter la duplication du dossier `public/` pendant le build Vite Docker. La validation locale n'a pas pu etre lancee ici car `node`, `npm` et `docker` ne sont pas disponibles dans ce shell.
