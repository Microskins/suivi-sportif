# Plan - Renumerotation continue des plans

## Objectif

- Corriger le trou de numerotation entre les plans `038` et `088`.
- Renommer les plans concernes pour obtenir une sequence continue.
- Mettre a jour les references documentaires vers les nouveaux numeros.

## Decisions

- Renommer les plans `088` a `104` en `039` a `055`.
- Conserver les slugs existants pour limiter le bruit et garder les titres lisibles.
- Ajouter ce plan en `056` pour documenter la correction.

## Todo

- [x] Creer ce plan.
- [x] Renommer les fichiers de plans.
- [x] Mettre a jour l'index des plans.
- [x] Mettre a jour les references dans `docs/`.
- [x] Verifier l'absence d'anciens liens `088` a `104`.
- [x] Noter les validations.

## Notes de verification

- 2026-06-07: plans `088` a `104` renommes en `039` a `055`.
- 2026-06-07: controle de l'index `docs/90-plans/README.md`: aucun numero manquant de `1` a `56`.
- 2026-06-07: recherche des anciens slugs `088-` a `104-`: aucun lien documentaire restant.
- 2026-06-07: `git diff --check`: OK.
