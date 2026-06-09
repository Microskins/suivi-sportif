# Plan - Fix memoire build deploy

## Objectif

- Corriger l'echec GitHub Actions du deploiement production tue pendant le build Docker.
- Adapter le script au runner self-hosted ARM64 limite en memoire.
- Garder le deploiement deterministe sans changer le comportement applicatif.

## Decisions

- Construire les images Docker une par une pour limiter la pression memoire.
- Garder BuildKit actif pour conserver le cache et les performances raisonnables.
- Ne pas toucher aux services applicatifs: le probleme observe vient du build deploy.

## Todo

- [x] Lire les logs du job GitHub Actions casse.
- [x] Modifier le script de deploiement.
- [x] Valider la syntaxe et documenter les resultats.

## Notes de verification

- 2026-06-09: job GitHub Actions `80265950175` inspecte via connecteur GitHub; etape `Deploy locally` en echec avec `failed to execute bake: signal: killed` puis signal d'arret runner.
- 2026-06-09: `docker compose build` remplace par des builds sequentiels `api`, `client`, `mcp` via `COMPOSE_BUILD_SERVICES`.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && bash -n scripts/deploy-production.sh"` OK.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && docker compose config --quiet"` OK avec avertissement local attendu `MCP_AUTH_TOKEN` absent.
