# Plan - Assistant IA MCP

## Objectif

- Ajouter une chatbox IA capable de transformer une demande en brouillon d'action sur les donnees du compte connecte.
- Couvrir progressivement le profil, les repas, les seances, les mensurations et les objectifs.
- Reutiliser les API metier existantes et leurs regles de validation, d'ownership et de securite.
- S'appuyer sur le serveur MCP existant quand il sert de couche d'outils pour l'assistant.
- Garder la main utilisateur avec une confirmation explicite avant chaque creation, modification ou suppression.

## Decisions

- La chatbox vit dans le dashboard et peut proposer des actions selon le contexte courant.
- L'assistant ne cible que l'utilisateur authentifie et ne peut modifier que son propre profil.
- Le serveur porte la cle IA via variable d'environnement et ne l'expose jamais au client.
- Le MCP expose les outils metier de l'assistant, mais ces outils doivent continuer a passer par l'API Fastify.
- Le navigateur n'appelle pas directement le MCP: la chatbox parle au backend, qui orchestre l'IA et les outils.
- Les reponses IA sont normalisees en brouillons d'action structures avant application.
- Les repas, aliments et objectifs nutrition peuvent s'appuyer sur les outils MCP deja presents.
- Les seances, mensurations, objectifs corps/sport et profil necessitent des outils MCP dedies.
- Les changements sensibles comme l'email ou le mot de passe conservent la confirmation du mot de passe actuel.
- En cas d'echec IA, l'utilisateur conserve les formulaires manuels classiques.

## Exemples cibles

- "Tu peux rajouter mon repas de ce midi ? Riz, poulet, banane."
- "Ajoute ma pesee du jour a 82,4 kg."
- "Planifie une seance push demain a 18h avec developpe couche et dips."
- "Change mon email de profil."
- "Cree un objectif corps pour descendre a 80 kg avant septembre."

## Todo

- [x] Creer ce plan.
- [x] Recrire l'idee 06 avec le nouveau cadrage.
- [x] Ajouter le plan a l'index.
- [x] Elargir le cadrage de la chatbox au-dela du profil.
- [ ] Inventorier les outils MCP existants et manquants par domaine.
- [ ] Ajouter ou adapter les outils MCP profil, seances, mensurations et objectifs via l'API.
- [ ] Definir le contrat backend de l'assistant, l'appel MCP et la validation de sortie.
- [ ] Ajouter le branchement IA cote serveur avec cle d'environnement.
- [ ] Ajouter la chatbox dans le dashboard cote frontend.
- [ ] Reutiliser les stores existants pour appliquer ou rafraichir les changements confirmes.
- [ ] Ajouter les tests API, composants et validations utiles.
- [ ] Mettre a jour les notes de verification et les docs si le comportement public evolue.

## Notes de verification

- 2026-06-08: chantier cadre et docs only a ce stade; aucune validation applicative lancee encore.
- 2026-06-08: idee complementaire ajoutee dans `docs/06-idees/90-ia-idees.md` pour le diff avant application, les raccourcis de commandes et le journal leger des actions.
- 2026-06-08: `git diff --check` OK; `docs/90-plans/README.md` reference bien `058-chatbox-ia.md`; les chemins d'idee et de plan existent.
- 2026-06-08: decision ajoutee apres revue du workspace `mcp/`: le MCP peut porter les outils IA profil, mais les mutations passent toujours par l'API Fastify.
- 2026-06-08: cadrage elargi: la chatbox devient un assistant IA MCP multi-domaines, avec repas/aliments/objectifs nutrition deja proches des outils MCP existants et seances/mensurations/profil a completer.
