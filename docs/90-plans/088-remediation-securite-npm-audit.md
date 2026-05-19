# Plan - Remediation securite npm audit

## Objectif

- Reduire les vulnerabilites `npm audit` du monorepo.
- Traiter en priorite les vulnerabilites critiques et hautes.
- Garder le projet fonctionnel (typecheck/tests/deploiement) apres upgrades.

## Decisions

- Execution en 3 vagues:
  - Vague 1: correctifs non-breaking.
  - Vague 2: upgrades breaking backend securite JWT/Fastify.
  - Vague 3: upgrades breaking frontend/dev toolchain (Vite/Vitest/ESLint).
- Validation apres chaque vague via typecheck et tests server.
- Les vulnerabilites residuelles non corrigeables immediatement seront documentees.

## Todo

- [x] Creer ce plan.
- [x] Vague 1: executer `npm audit fix` sans `--force` et verifier.
- [x] Vague 2: migrer stack backend Fastify/JWT et adapter le code si necessaire.
- [x] Vague 3: migrer toolchain frontend/dev (Vite/Vitest/ESLint/typescript-eslint).
- [x] Reexecuter audit + typechecks + tests et documenter le delta final.
- [x] Mettre a jour l'index des plans.

## Notes de verification

- Environnement valide avec Node `20.20.2` (WSL).
- Commandes executees:
  - `npm audit fix`
  - `npm install -w server fastify@^5.8.5 @fastify/jwt@^10.1.0 @fastify/cors@latest @fastify/helmet@latest @fastify/swagger@latest @fastify/swagger-ui@latest @fastify/rate-limit@latest`
  - `npm install -w client vite@latest vitest@latest @vitejs/plugin-react@latest eslint@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest`
  - `npm install -w server vitest@latest eslint@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest`
  - `npm install -w mcp vitest@latest`
  - `npm install -w server bcrypt@latest node-pg-migrate@latest`
  - `npm run typecheck -w server`
  - `npm run typecheck -w client`
  - `npm run test -w server -- --run`
  - `npm audit`
- Resultats:
  - `npm audit`: `found 0 vulnerabilities`
  - `typecheck server`: OK
  - `typecheck client`: OK
  - `tests server`: `140 passed`
- Ajustements de compatibilite effectues:
  - `server/src/app.ts`: typage explicite de l'erreur dans `setErrorHandler`.
  - `server/src/routes/api.test.ts`: test Swagger UI rendu compatible avec le comportement de la version plugin (`200` ou `302`).
