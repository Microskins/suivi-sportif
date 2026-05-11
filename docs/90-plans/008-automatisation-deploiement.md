# Plan - Automatisation deploiement

## Objectif

- Automatiser le deploiement production depuis GitHub Actions apres validation
  des tests, builds et typechecks.

## Decisions

- Le workflow cible `main`.
- Les validations tournent avant le deploiement.
- Le deploiement se fait par runner GitHub Actions self-hosted sur le LAN et
  appelle un script versionne localement sur le serveur de production.
- Le script refuse de deployer si le working tree serveur est sale.
- Les images Docker restent construites sur le serveur de production.
- Le runner production utilise les labels `self-hosted`, `linux`, `ARM64` et
  `production`.

## Todo

- [x] Creer ce plan.
- [x] Ajouter le plan dans l'index.
- [x] Ajouter le script de deploiement.
- [x] Ajouter le workflow GitHub Actions.
- [x] Documenter les secrets, prerequis et rollback.
- [x] Verifier la syntaxe du script.
- [x] Verrouiller les fins de ligne LF pour les scripts de deploiement.
- [x] Remplacer le deploiement SSH public par un runner self-hosted LAN.
- [x] Documenter l'installation du runner `production`.
- [x] Documenter la procedure complete utilisateur `deploy`, service runner et
  verification.
- [x] Installer et enregistrer le runner sur le serveur production.

## Notes de verification

- Apres pull du 2026-05-07, `bash -n scripts/deploy-production.sh` a detecte
  des fins de ligne CRLF incompatibles avec Bash Linux. Ajout de
  `.gitattributes`, exception `.gitignore` associee, puis normalisation LF.
- `bash -n scripts/deploy-production.sh`: OK apres normalisation LF.
- `bash -n scripts/postgres-backup.sh`: OK.
- `bash -n scripts/postgres-restore-test.sh`: OK.
- `git diff --check -- . ':!.agents/skills/*'`: OK. Les fichiers
  `.agents/skills/*` restent hors verification car proteges en ecriture dans
  l'environnement local.
- Decision du 2026-05-07: pas d'exposition SSH publique pour `192.168.1.64`.
  Le job `deploy` tourne sur un runner self-hosted LAN avec le label
  `production`.
- Les secrets GitHub `PROD_SSH_HOST`, `PROD_SSH_USER`, `PROD_SSH_KEY` et
  `PROD_SSH_PORT` ne sont plus requis. La seule variable optionnelle conservee
  est `PROD_PROJECT_DIR=/var/www/suivi-sportif`.
- Installation effective du runner non faite depuis ce workspace: elle doit
  etre realisee sur le serveur production via l'interface GitHub Actions.
- Procedure runner detaillee dans `docs/04-deployment/docker.md`: utilisateur
  `deploy`, verrouillage du mot de passe apres installation, labels attendus et
  verifications sans `sudo`.
- Runner installe et operationnel le 2026-05-09: service
  `actions.runner.Microskins-suivi-sportif.prod-192-168-1-64.service` actif.
- Le workflow `.github/workflows/deploy-production.yml` cible bien le runner
  `runs-on: [self-hosted, linux, ARM64, production]`.
