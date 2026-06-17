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
- [x] Transmettre la cle Anthropic au conteneur API Docker.

## Notes de verification

- 2026-06-09: job GitHub Actions `80265950175` inspecte via connecteur GitHub; etape `Deploy locally` en echec avec `failed to execute bake: signal: killed` puis signal d'arret runner.
- 2026-06-09: `docker compose build` remplace par des builds sequentiels `api`, `client`, `mcp` via `COMPOSE_BUILD_SERVICES`.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && bash -n scripts/deploy-production.sh"` OK.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && docker compose config --quiet"` OK avec avertissement local attendu `MCP_AUTH_TOKEN` absent.
- 2026-06-09: `ANTHROPIC_API_KEY` et `ANTHROPIC_MODEL` ajoutes a l'environnement du service Docker `api`.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && docker compose config --quiet"` OK apres ajout Anthropic, avec avertissement local attendu `MCP_AUTH_TOKEN` absent.
- 2026-06-17: le run GitHub Actions `27679981077` a echoue dans `Deploy locally` avec `ENOSPC: no space left on device` pendant `npm run build -w client` dans Docker.
- 2026-06-17: ajout d'un `docker system prune -af` juste avant les builds pour liberer l'espace disque inutilise sur le runner self-hosted.
