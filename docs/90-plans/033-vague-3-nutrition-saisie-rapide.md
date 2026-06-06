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
- [x] Auditer l'API meals/foods et les stores.
- [x] Prioriser duplication/favoris avant scanner.
- [x] Implementer repas rapides.
- [x] Ajouter portions frequentes.
- [x] Ajouter comparaison aux objectifs nutrition.
- [x] Evaluer la source code-barres.
- [x] Mettre a jour docs API/UI.
- [x] Valider les controles disponibles et documenter les blocages.
- [x] Pousser la vague avant d'ouvrir la Vague 4.

## Notes de verification

- 2026-06-01: plan cree depuis la roadmap `030-roadmap-idees-ia`.
- 2026-06-01: cette vague doit attendre la fin de la Vague 2.
- 2026-06-01: audit Vague 3: repas et aliments disposent deja de CRUD, snapshots nutritionnels, barcode local sur aliment et stores bypass.
- 2026-06-01: tranche retenue: duplication de repas, portions recentes, recap macros avant validation, comparaison journaliere aux objectifs actifs; scanner externe reporte apres choix de source.
- 2026-06-01: ajout UI duplication de repas existants, reutilisation des aliments/quantites et recherche locale nom/marque/code-barres dans les aliments.
- 2026-06-01: ajout UI portions recentes par aliment dans le formulaire repas et recap calories/macros avant validation.
- 2026-06-01: ajout UI comparaison journaliere aux objectifs nutrition actifs dans l'onglet Repas.
- 2026-06-01: source code-barres candidate: Open Food Facts API v3 `GET /api/v3/product/{barcode}`; donnees ouvertes sous ODbL mais qualite non garantie, donc integration externe repoussee a une vague dediee.
- 2026-06-01: reference source: https://openfoodfacts.github.io/documentation/docs/Product-Opener/v3/products/get-api-v3-product-code/ et https://support.openfoodfacts.org/help/en-gb/12-api-data-reuse/94-are-there-conditions-to-use-the-api.
- 2026-06-01: aucun changement API; la reference API ne change pas pour cette vague.
- 2026-06-01: `git diff --check` : OK.
- 2026-06-01: `npm run typecheck -w client` bloque localement: `npm` absent du PATH PowerShell.
- 2026-06-03: nettoyage de suivi: retrait des todos doublonnes non coches qui contredisaient les items deja livres et valides avec blocage documente.
