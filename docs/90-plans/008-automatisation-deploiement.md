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
- [x] Verrouiller les fins de ligne LF pour les scripts de deploiement.
- [ ] Configurer les secrets GitHub et l'acces SSH production.

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
- Secrets GitHub non configures a ce stade: `PROD_SSH_HOST`,
  `PROD_SSH_USER`, `PROD_SSH_KEY`, `PROD_SSH_PORT` restent a creer.
- Acces SSH production non finalise pour GitHub Actions: `192.168.1.64` est une
  IP LAN, donc il faudra un endpoint SSH joignable publiquement ou un runner
  self-hosted dans le reseau.
