# Plan - Durcissement securite auth/session/CORS

## Objectif

- Eliminer les defaults dangereux autour du JWT et du transport de session.
- Limiter les origines autorisees et reduire l'impact d'un XSS sur le token.
- Harmoniser la documentation et les validations d'environnement pour la prod.

## Decisions

- Traiter le chantier en priorite backend, puis frontend et documentation.
- En production, le serveur ne doit plus demarrer sans `JWT_SECRET` explicite et suffisamment fort.
- CORS sera configure avec une allowlist explicite selon l'environnement, pas de reflet libre de l'origine.
- La strategie de session sera tranchee avant toute migration:
  - cookie `HttpOnly`/`Secure` si faisable sans casser le flux;
  - sinon maintien temporaire du stockage local avec durcissement XSS/CSP et plan de migration clair.
- Les endpoints d'authentification recevront un frein contre les abus (rate limit/backoff) et des tests associes.

## Todo

- [x] Creer ce plan.
- [x] Cartographier les environnements et origines autorisees.
- [x] Remplacer le secret JWT de secours par un echec au demarrage en production.
- [x] Restreindre CORS a une allowlist explicite et couvrir le comportement par tests.
- [x] Trancher la strategie de stockage du token et appliquer la solution retenue.
- [x] Ajouter une protection contre le brute-force sur login/register.
- [x] Mettre a jour les docs sources de verite et les notes de deploiement.
- [x] Verifier les changements via tests pertinents et `git diff --check`.

## Notes de verification

- 2026-06-03: plan cree a partir du point securite du depot.
- 2026-06-03: branche dediee `codex/security-hardening-auth-session-cors` creee pour porter le chantier.
- 2026-06-03: enrichissement des idees complementaires ajoute dans `docs/06-idees/90-ia-idees.md`.
- 2026-06-03: origines retenues: dev local `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`, `http://127.0.0.1:3000`; prod via `CORS_ORIGINS`, recommande `https://suivi-sportif.fr,https://www.suivi-sportif.fr`.
- 2026-06-03: strategie token retenue pour cette passe: conserver temporairement le bearer token cote frontend, ajouter CSP/headers Nginx pour reduire l'impact XSS, et garder la migration cookie `HttpOnly`/refresh-token comme evolution plus large.
- 2026-06-03: `npm run db:generate -w server` via WSL: OK.
- 2026-06-03: `npm run typecheck -w server` via WSL: OK.
- 2026-06-03: `npm run test -w server -- --run` via WSL + Node 24.15.0: OK, 5 fichiers, 164 tests passes.
- 2026-06-03: `git diff --check`: OK; avertissement Git seulement sur normalisation CRLF -> LF pour `deploy/nginx/suivi-sportif.fr.conf`.
- 2026-06-07: correction post-merge sur `main`: restauration du bloc durci JWT/CORS dans `server/src/app.ts`, suppression des restes `CORS_ORIGIN`/JWT dupliques, alignement des tests sur `CORS_ORIGINS` et secret prod >= 32 caracteres.
- 2026-06-07: validations apres correction CI: typecheck serveur via Node runtime Codex + `node_modules/typescript/bin/tsc --noEmit`: OK; tests serveur via WSL `npm run test -w server -- --run`: OK, 5 fichiers, 167 tests passes; build serveur via Node runtime Codex + `tsc`: OK; typecheck client via Node runtime Codex + `tsc --noEmit`: OK; build client via WSL `npm run build -w client`: OK avec avertissement chunk > 500 kB; `git diff --check`: OK.
- 2026-06-07: note environnement local: `npm` n'est pas disponible dans PowerShell et le build/test Vite/Vitest Windows bloque sur la dependance optionnelle manquante `@rolldown/binding-win32-x64-msvc`; les validations dependantes de Rolldown ont donc ete lancees via WSL.
