# Plan - Angle priorisation: chantiers a impact

## Objectif

- Donner un cadre simple pour classer les futurs chantiers.
- Faire converger produit, dette technique et ops vers des choix lisibles.
- Eviter que les decisions se fassent uniquement au ressenti.

## Decisions

- Utiliser une grille de score legere: impact utilisateur, effort, risque, dependances, visibilite.
- Relier chaque chantier a une preuve attendue apres livraison.
- Garder un seul portefeuille de chantiers dans `docs/90-plans/`.
- Preferer un score simple et relisible a un modele trop sophistique.
- Calculer un score indicatif, puis garder une decision humaine explicite quand un chantier a une contrainte forte.

## Grille de score

Chaque chantier recoit 5 notes de `0` a `5`.

| Critere | Lecture | Note haute |
| --- | --- | --- |
| Impact utilisateur | Gain direct pour l'usage quotidien | L'utilisateur sent vite la difference |
| Visibilite produit | Effet visible dans l'interface ou le parcours | Le resultat se voit sans lire le code |
| Risque reduit | Securite, donnees, dette ou regressions evitees | Le chantier reduit un risque concret |
| Effort | Cout estime de conception, code, tests et docs | 5 = effort lourd |
| Dependances | Nombre de prealables techniques ou produit | 5 = beaucoup de prealables |

Score indicatif:

```text
score = impact utilisateur + visibilite produit + risque reduit - effort - dependances
```

Lecture rapide:

| Score | Decision par defaut |
| --- | --- |
| 8 ou plus | Prioritaire court terme |
| 5 a 7 | Bon candidat apres le court terme |
| 2 a 4 | A garder, mais attendre un meilleur moment |
| 1 ou moins | Reporter sauf contrainte externe |

## Regle d'arbitrage

- Un chantier de securite bloquant ou de donnees critiques passe devant le score.
- Un chantier deja presque termine peut etre ferme rapidement si le cout restant est faible.
- Un chantier tres visible mais tres dependant attend que son prerequis soit stabilise.
- Un chantier de dette technique est prioritaire quand il debloque plusieurs chantiers produit.
- Chaque decision doit noter la preuve attendue: test, build, capture, doc, ou comportement verifie.

## Echantillon de priorisation

| Plan | Impact | Visibilite | Risque reduit | Effort | Dependances | Score | Lecture |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `038` Priorisation chantiers | 3 | 3 | 3 | 1 | 0 | 8 | A finir tout de suite pour guider la suite |
| `037` Produit/UX parcours critiques | 4 | 4 | 2 | 2 | 1 | 7 | Fort gain visible, bon prochain candidat |
| `092` Suppression popups exercices et repas | 3 | 4 | 2 | 1 | 0 | 8 | Presque termine, a fermer par verification |
| `095` Unites aliments g ou unite | 3 | 2 | 4 | 1 | 0 | 8 | Presque termine, a fermer par verification serveur |
| `036` Dette et maintenance | 3 | 2 | 4 | 3 | 1 | 5 | Important, a cadrer avant gros refactor |
| `034` Qualite, confiance et securite | 3 | 3 | 4 | 2 | 1 | 7 | Semble livre mais demande nettoyage de statut |
| `089` Mobile Capacitor | 4 | 5 | 3 | 5 | 4 | 3 | Gros impact, mais trop dependant pour maintenant |
| `035` Mobile ops industrialisation | 3 | 2 | 4 | 4 | 3 | 2 | A rattacher au mobile quand `089` reprend |

## Candidats court terme

1. Fermer `038` pour figer la methode de priorisation.
2. Fermer les plans presque termines: `092` et `095`, avec verification ou blocage documente. Fait le 2026-06-03.
3. Nettoyer le statut des plans deja livres mais incoherents: `031`, `033`, `034`. Fait le 2026-06-03.
4. Lancer `037` pour convertir le diagnostic UX en parcours critiques concrets. Lance le 2026-06-03.
5. Cadrer `036` juste assez pour savoir quels refactors debloquent les prochaines features. Cadrage scripts/docs/config fait le 2026-06-03.

## Preuves attendues

| Type de chantier | Preuve minimale |
| --- | --- |
| Documentation / pilotage | Diff coherent, liens valides, index a jour |
| Frontend UX | Typecheck/build si disponibles, capture ou verification parcours |
| API / donnees | Tests API ou blocage documente, reference API a jour si besoin |
| Dette technique | Tests existants inchanges, extraction limitee et reversible |
| Ops / mobile | Runbook, commande de verification, prerequis explicites |

## Todo

- [x] Creer ce plan.
- [x] Definir la grille de score commune.
- [x] Reprendre quelques chantiers existants et leur attribuer un score.
- [x] Identifier les chantiers candidats a court terme.
- [x] Documenter la regle d'arbitrage.
- [x] Tester le score sur un petit echantillon reel.

## Notes de verification

- 2026-06-03: plan cree a partir du besoin de mieux prioriser les chantiers du projet.
- 2026-06-03: aucune execution de verification; le travail consiste a cadrer la methode.
- 2026-06-03: grille de priorisation ajoutee avec score indicatif, regle d'arbitrage, echantillon de 8 plans et candidats court terme.
- 2026-06-03: priorite appliquee: `092` et `095` fermes apres verification locale via binaires `node_modules`; `031`, `033` et `034` nettoyes pour retirer des todos doublonnes.
- 2026-06-03: incoherences code/config traitees ensuite: scripts racine, docs de versions, docs d'architecture, CORS et JWT production.
