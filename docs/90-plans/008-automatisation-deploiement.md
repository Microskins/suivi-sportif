# Plan - Automatisation deploiement

## Objectif

- Automatiser le deploiement production depuis GitHub Actions apres validation
  des tests, builds et typechecks.

## Decisions

- Le workflow cible `main`.
- Les validations tournent avant le deploiement.
- Le deploiement se fait par SSH et appelle un script versionne.
- Le script refuse de deployer si le working tree serveur est sale.
- Les images Docker restent construites sur le serveur de production.

## Todo

- [x] Creer ce plan.
- [x] Ajouter le plan dans l'index.
- [x] Ajouter le script de deploiement.
- [x] Ajouter le workflow GitHub Actions.
- [x] Documenter les secrets, prerequis et rollback.
- [x] Verifier la syntaxe du script.

## Notes de verification

- `bash -n scripts/deploy-production.sh`: OK.
- `git diff --check`: OK, aucun whitespace error; avertissements CRLF attendus.
