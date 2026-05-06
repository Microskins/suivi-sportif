# Plan - Tests API OpenAPI robustesse

## Objectif

Renforcer les tests API backend et rendre Swagger/OpenAPI exploitable:

- verifier les erreurs `401`, `400`, `500`;
- verifier que les entrees invalides ne touchent pas les queries;
- verifier les suppressions `204` sans body;
- completer les schemas OpenAPI des routes nutrition;
- documenter les URLs Swagger UI et OpenAPI JSON.

## Decisions

- Le chantier reste limite au backend et a la documentation API.
- Swagger existe deja; il est complete et verrouille par tests.
- Les tests routes utilisent `fastify.inject()` et les mocks de queries existants.
- Les schemas OpenAPI sont declares dans les routes, comme les routes deja documentees.
- Aucun changement frontend, Prisma ou migration.

## Todo

- [x] Creer ce plan.
- [x] Ajouter le plan dans `docs/90-plans/README.md`.
- [x] Completer les schemas OpenAPI foods, meals et nutrition goals.
- [x] Renforcer les tests `/docs/json`.
- [x] Ajouter les tests robustesse auth, validation et `500`.
- [x] Mettre a jour `docs/03-api/reference.md`.
- [x] Lancer le typecheck serveur.
- [x] Lancer les tests serveur.
- [x] Lancer le build serveur.

## Notes de verification

- `/docs/` doit servir Swagger UI.
- `/docs/json` doit exposer les chemins API principaux et `bearerAuth`.
- Les routes protegees doivent declarer `security: [{ bearerAuth: [] }]`.
- Les erreurs doivent garder le format `{ error, code }`.
- Les validations doivent garder `code: "VALIDATION_ERROR"` et `details`.
- `npm` et `node` ne sont pas disponibles dans le `PATH` du shell local.
  Les validations ont ete lancees via le runtime Node embarque de Codex:
  - `node.exe node_modules/typescript/bin/tsc -p server/tsconfig.json --noEmit`
  - `node.exe node_modules/vitest/vitest.mjs --run --root server`
  - `node.exe node_modules/typescript/bin/tsc -p server/tsconfig.json`
- `server/dist/` a ete supprime apres le build.
