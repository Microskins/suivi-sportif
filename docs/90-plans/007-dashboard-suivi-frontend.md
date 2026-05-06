# Plan - Dashboard suivi frontend

## Objectif

- Ajouter une vue d'accueil dashboard pour suivre les donnees sport et nutrition
  sans nouvel endpoint backend.

## Decisions

- Le dashboard reste frontend-only et calcule ses indicateurs depuis les stores
  existants.
- Les periodes disponibles sont 3 jours, 7 jours, 1 mois et 1 an.
- Les graphiques utilisent `recharts`, deja present dans le client.
- Le dashboard devient la vue authentifiee ouverte par defaut.
- Une passe style rend le dashboard plus lisible avec une navigation plus nette,
  des panneaux differencies et des accents sport/nutrition.

## Todo

- [x] Creer ce plan.
- [x] Ajouter le plan dans l'index.
- [x] Ajouter la vue dashboard avec graphiques.
- [x] Brancher la navigation et les actions rapides.
- [x] Ameliorer le style du dashboard.
- [ ] Verifier typecheck/build client.

## Notes de verification

- `git diff --check`: OK, aucun whitespace error; avertissements CRLF attendus.
- `Get-Command node,npm`: aucun executable trouve dans ce shell local.
