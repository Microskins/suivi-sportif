# Plan 013 — GitHub Actions: opt-in Node 24 (deprecation Node 20)

## Objectif

- Rendre le workflow `deploy-production.yml` robuste avant le passage par defaut
  de GitHub Actions a Node 24 (date annoncee: 2026-06-02).

## Decisions

- Forcer l'execution des JavaScript actions sur Node 24 via
  `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` au niveau du workflow.
- Ne pas changer la version Node du projet dans les jobs (on garde Node 20 pour
  `actions/setup-node` tant qu'on n'a pas de raison de migrer l'app).
- Le warning "Node.js 20 actions are deprecated..." peut persister meme si
  l'action est forcee a tourner sur Node 24.

## Todo

- [x] Creer ce plan.
- [x] Ajouter `env: FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: \"true\"` dans
  `.github/workflows/deploy-production.yml`.
- [ ] Verifier sur un run `workflow_dispatch` que `Verify` et `Deploy` passent.

## Notes de verification

- A completer apres un run manuel.

