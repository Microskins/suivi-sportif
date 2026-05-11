# Plan 011 — Skill IA idees pendant creation de plan

## Objectif

- Ajouter un skill qui, lors de la creation ou mise a jour d'un plan, propose des
  ameliorations complementaires non encore notees et les consigne dans
  `docs/06-idees/90-ia-idees.md`.

## Decisions

- Le skill ne modifie pas le code applicatif.
- Les idees ajoutees sont tracees (date + reference du plan) et ecrites au format
  minimal (Contexte/Proposition/Impact/Complexite/Liens).
- Le skill doit verifier l'existant avant d'ajouter (eviter les doublons).

## Todo

- [x] Creer ce plan.
- [x] Ajouter le skill `ia-idees-plan`.
- [x] Documenter le workflow du skill (checks + heuristiques).
- [x] Indexer le plan 011 dans `docs/90-plans/README.md`.

## Notes de verification

- Skill ajoute: `.agents/skills/ia-idees-plan/SKILL.md`.
