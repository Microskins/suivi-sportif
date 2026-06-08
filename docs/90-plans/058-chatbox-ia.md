# Plan - Chatbox IA profil

## Objectif

- Ajouter dans l'onglet Profil une chatbox IA capable de transformer une demande en modification du profil connecte.
- Reutiliser la source de verite `/api/users/me` et ses regles de validation et de securite deja en place.
- S'appuyer sur le serveur MCP existant quand il sert de couche d'outils pour l'assistant.
- Garder la main sur les champs sensibles en restant compatible avec la confirmation du mot de passe actuel.

## Decisions

- La chatbox vit dans la section Profil du dashboard, pas dans un ecran global separe.
- L'assistant ne cible que l'utilisateur authentifie et ne peut modifier que son propre profil.
- Le serveur porte la cle IA via variable d'environnement et ne l'expose jamais au client.
- Le MCP peut exposer les outils profil de l'assistant, mais ces outils doivent continuer a passer par l'API Fastify.
- Le navigateur n'appelle pas directement le MCP: la chatbox parle au backend, qui orchestre l'IA et les outils.
- Les reponses IA sont normalisees en modifications de profil structurees avant d'appeler `updateProfile`.
- Les changements sensibles comme l'email ou le mot de passe conservent la confirmation du mot de passe actuel.
- En cas d'echec IA, l'utilisateur conserve le formulaire manuel classique.

## Todo

- [x] Creer ce plan.
- [x] Recrire l'idee 06 avec le nouveau cadrage.
- [x] Ajouter le plan a l'index.
- [ ] Ajouter ou adapter les outils MCP profil (`get_profile`, `update_profile`) via l'API.
- [ ] Definir le contrat backend de l'assistant profil, l'appel MCP et la validation de sortie.
- [ ] Ajouter le branchement IA cote serveur avec cle d'environnement.
- [ ] Ajouter la chatbox dans l'onglet Profil cote frontend.
- [ ] Reutiliser le store profil pour appliquer les changements proposes.
- [ ] Ajouter les tests API, composants et validations utiles.
- [ ] Mettre a jour les notes de verification et les docs si le comportement public evolue.

## Notes de verification

- 2026-06-08: chantier cadre et docs only a ce stade; aucune validation applicative lancee encore.
- 2026-06-08: idee complementaire ajoutee dans `docs/06-idees/90-ia-idees.md` pour le diff avant application, les raccourcis de commandes et le journal leger des actions.
- 2026-06-08: `git diff --check` OK; `docs/90-plans/README.md` reference bien `058-chatbox-ia.md`; les chemins d'idee et de plan existent.
- 2026-06-08: decision ajoutee apres revue du workspace `mcp/`: le MCP peut porter les outils IA profil, mais les mutations passent toujours par l'API Fastify.
