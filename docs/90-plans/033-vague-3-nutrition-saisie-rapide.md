# Plan - Vague 3 nutrition et saisie rapide

## Objectif

- Reduire la friction de saisie nutritionnelle.
- Rendre les repas plus rapides a creer et reutiliser.
- Donner un retour simple entre apports reels et objectifs nutrition.

## Perimetre

- Scanner code-barres:
  - recherche par code-barres;
  - association a un aliment;
  - gestion des aliments frequents.
- Builder repas:
  - duplication de repas;
  - repas favoris;
  - portions frequentes;
  - recap calories/macros avant validation.
- Suggestions nutritionnelles:
  - comparaison aux objectifs actifs;
  - ecarts calories/proteines/glucides/lipides;
  - message explicatif non medical.

## Hors perimetre

- Base alimentaire publique complete si aucune source fiable n'est choisie.
- Recommandations medicales ou regime prescriptif.
- Paiement, abonnement ou compte premium.
- Notifications push natives.

## Decisions

- Commencer par les flux reutilisables sans dependance externe: duplication, favoris, portions.
- Choisir une source code-barres seulement apres verification juridique et technique.
- Conserver les snapshots nutritionnels des repas pour ne pas casser l'historique.
- Garder les suggestions sous forme d'aide a la decision.

## Sous-chantiers

1. Repas favoris et duplication
   - Dupliquer un repas existant.
   - Marquer un repas comme favori si un modele de repas devient necessaire.
   - Reutiliser les aliments et quantites.

2. Portions frequentes
   - Memoriser les quantites recentes par aliment.
   - Proposer des raccourcis dans le formulaire repas.

3. Comparaison aux objectifs
   - Afficher ecarts journaliers.
   - Mettre en evidence proteines et calories.
   - Gerer les jours sans repas saisi.

4. Scanner code-barres
   - Etudier source de donnees.
   - Ajouter recherche par barcode.
   - Preparer integration mobile.

## Todo

- [x] Creer ce plan.
- [ ] Auditer l'API meals/foods et les stores.
- [ ] Prioriser duplication/favoris avant scanner.
- [ ] Implementer repas rapides.
- [ ] Ajouter portions frequentes.
- [ ] Ajouter comparaison aux objectifs nutrition.
- [ ] Evaluer la source code-barres.
- [ ] Mettre a jour docs API/UI.
- [ ] Valider typecheck/tests/build pertinents.
- [ ] Pousser la vague avant d'ouvrir la Vague 4.

## Notes de verification

- 2026-06-01: plan cree depuis la roadmap `030-roadmap-idees-ia`.
- 2026-06-01: cette vague doit attendre la fin de la Vague 2.
