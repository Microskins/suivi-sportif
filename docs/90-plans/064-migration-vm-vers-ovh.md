# Plan - Migration VM vers OVH

## Objectif

- Migrer Suivi Sportif de la VM actuelle vers un hebergement OVH compatible avec la stack.
- Verifier si l'offre OVH choisie peut faire tourner l'application telle quelle ou s'il faut reduire la portee a un site statique.
- Conserver un rollback simple tant que la nouvelle production n'est pas stabilisee.

## Decisions

- L'offre 100M gratuite OVH n'est pas suffisante pour la stack actuelle: elle ne fournit pas de base de donnees et vise une simple page web.
- Pour la stack actuelle, les cibles realistes sont un Cloud Web ou POWER Node.js avec base externe, ou un VPS permettant de garder Docker Compose.
- La VM actuelle reste la reference de production tant que la cible OVH n'est pas validee en bout en bout.
- La migration doit conserver les variables sensibles hors du code et documenter le cutover DNS.

## Todo

- [x] Creer ce plan.
- [ ] Confirmer le type exact d'offre OVH et ses capacites (SSH, Node.js, DB, Docker, cron, stockage).
- [ ] Choisir l'architecture cible en fonction de l'offre OVH.
- [ ] Adapter les scripts et la documentation de deploiement a la cible choisie.
- [ ] Preparer le cutover DNS et le plan de rollback.
- [ ] Valider les health checks et l'acces public apres migration.
- [ ] Decider si la VM est gardee en secours ou retiree.

## Notes de verification

- 2026-06-09: `git status --short --branch` a confirme un depot propre sur `main...origin/main` avant la creation de la branche de chantier.
- 2026-06-09: branche dediee creee: `codex/ovh-migration`.
- 2026-06-09: inspection du deploiement actuel via `docker-compose.yml`, `server/src/server.ts`, `scripts/deploy-production.sh` et `docs/04-deployment/*`.
- 2026-06-09: la doc OVH indique que l'hebergement gratuit 100M n'inclut pas de base de donnees et vise une simple page web.
- 2026-06-09: la doc OVH indique que l'acces SSH sur les hebergements web commence au plan Pro, et que Cloud Web peut exposer des runtimes Node.js avec variables d'environnement.
- 2026-06-09: migration non executee tant que l'offre OVH cible n'est pas confirmee.
