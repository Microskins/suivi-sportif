# Plan - Assistant IA contextuel

## Objectif

- Transformer l'assistant actuel en vraie IA de suivi sportif, avec contexte utilisateur, recommandations argumentees et reponses plus naturelles.
- Garder le flux brouillon/confirmation pour les mutations, mais enrichir la partie conseil et interpretation.
- Utiliser les donnees du compte, l'historique recent et la documentation du projet comme sources de contexte.

## Decisions

- L'assistant reste rattache au compte authentifie et ne voit que les donnees de l'utilisateur courant.
- Les actions sensibles continuent de passer par des brouillons confirmables avant mutation.
- Les reponses doivent expliquer le "pourquoi" d'un conseil quand c'est possible, et signaler clairement quand elles inferrent.
- Le comportement IA doit fonctionner avec une cle de modele cote serveur, avec fallback local si besoin.
- Le premier perimetre prioritaire est le coach sport/nutrition: progression, repas, poids, objectifs et prochaines actions.
- Les sources de contexte doivent etre explicites et limitees pour garder de la confiance et de la performance.

## Todo

- [x] Creer ce plan.
- [ ] Cadrer le format de reponse IA: conseil, resume, actions proposees, sources.
- [ ] Definir les sources de contexte prioritaires et la fenetre d'historique.
- [ ] Ajouter ou ajuster les endpoints de lecture de contexte si necessaire.
- [ ] Brancher l'assistant sur un mode conseil plus riche pour sport, nutrition et corps.
- [ ] Exposer dans l'UI les explications et les recommandations.
- [ ] Ajouter les tests backend et frontend pertinents.
- [ ] Mettre a jour les docs sources de verite si le comportement public change.

## Notes de verification

- 2026-06-12: plan cree a partir de la demande "vraie IA sur mon projet", en partant de l'assistant existant deja branche via `ANTHROPIC_API_KEY`.
- 2026-06-12: aucune validation code n'a ete lancee; le chantier est au stade de cadrage.
