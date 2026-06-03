# Plan - Reload Nginx conditionnel

## Objectif

- Automatiser `sudo nginx -t` puis `sudo systemctl reload nginx` pendant le deploiement.
- Ne lancer cette verification que si une conf Nginx du depot a change.

## Decisions

- Centraliser la logique dans `scripts/deploy-production.sh`.
- Considerer comme changements Nginx les fichiers sous `client/nginx/` et `deploy/nginx/`.
- Executer la validation juste apres le `git pull`, avant le build Docker.

## Todo

- [x] Creer ce plan.
- [x] Modifier `scripts/deploy-production.sh`.
- [x] Mettre a jour l'index des plans.
- [x] Verifier le diff final.

## Notes de verification

- 2026-06-03: logique ajoutee dans `scripts/deploy-production.sh` juste apres `git pull`, avec detection sur `client/nginx/` et `deploy/nginx/`.
- 2026-06-03: `sudo -n nginx -t` puis `sudo -n systemctl reload nginx` s'executent seulement si la conf Nginx a change.
- 2026-06-03: `git diff --check` passe.
