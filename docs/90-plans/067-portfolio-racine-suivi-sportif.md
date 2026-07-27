# Plan - Portfolio racine et Suivi Sportif en sous-site

## Objectif

- Faire de `/` la page portfolio du domaine existant.
- Rendre Suivi Sportif accessible sous `/suivi-sportif` sans changer de DNS ni
  modifier les routes API existantes.

## Decisions

- Conserver un seul client React/Vite et choisir l'ecran selon le chemin URL.
- Garder `/api`, `/health` et `/mcp` a la racine du domaine pour ne pas casser
  les integrations serveur existantes.
- Faire vivre les pages et liens internes de Suivi Sportif sous
  `/suivi-sportif`, notamment la politique de cookies.
- Creer un portfolio minimal et extensible, avec Suivi Sportif comme premier
  projet visible.

## Todo

- [x] Creer le plan et la branche dediee.
- [x] Identifier les routes, assets et liens internes a adapter.
- [x] Ajouter la page portfolio a la racine.
- [x] Monter Suivi Sportif sous `/suivi-sportif` et corriger ses liens.
- [x] Documenter l'architecture et le deploiement.
- [ ] Verifier le typecheck, les tests frontend et le build (bloque par Node.js absent).

## Notes de verification

- 2026-07-27: branche `feat/portfolio-root` creee.
- 2026-07-27: analyse des routes frontend, de Nginx et de Docker realisee.
- 2026-07-27: idees complementaires ajoutees a `docs/06-idees/90-ia-idees.md`.
- 2026-07-27: `git diff --check` valide sans erreur.
- 2026-07-27: `npm run typecheck -w client`, `npm run test -w client -- --run`
  et `npm run build -w client` non executes: `node`, `npm` et `npx` sont
  absents du `PATH` de l'environnement local.
