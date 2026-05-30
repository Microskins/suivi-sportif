# Plan - Mensurations corporelles

## Objectif

- Permettre a l'utilisateur de saisir son poids, sa taille et ses mensurations.
- Conserver un historique date pour suivre l'evolution corporelle dans le temps.
- Exposer une API protegee et une interface frontend coherente avec le dashboard existant.

## Decisions

- Creer une ressource `bodyMeasurements` rattachee a l'utilisateur.
- Stocker les valeurs numeriques en `Decimal` cote Prisma pour eviter les erreurs d'arrondi.
- Garder la taille dans chaque entree pour permettre un historique complet, meme si elle change rarement.
- Rendre les mensurations optionnelles: poids, taille, poitrine, taille abdominale, hanches, cou, epaules, bras, avant-bras, cuisses, mollets.
- Stocker la silhouette choisie par entree (`MALE` ou `FEMALE`) pour afficher l'image homme ou femme dans le schema.

## Todo

- [x] Creer ce plan.
- [x] Ajouter les idees IA liees au chantier.
- [x] Ajouter le modele Prisma et la migration.
- [x] Ajouter schemas, queries, routes API et tests.
- [x] Ajouter le client API, le store Zustand et les donnees bypass.
- [x] Ajouter l'ecran UI dans le dashboard.
- [x] Ajouter le choix de silhouette homme/femme et les assets generes.
- [x] Mettre a jour les docs API si necessaire.
- [x] Valider typecheck/tests/build backend et frontend.
- [x] Nettoyer les artefacts non destines au commit.

## Notes de verification

- 2026-05-29: chantier ouvert pour l'ajout d'un suivi historise du poids, de la taille et des mensurations.
- 2026-05-29: idee IA ajoutee dans `docs/06-idees/90-ia-idees.md` pour des graphiques de progression corporelle.
- 2026-05-29: modele Prisma `BodyMeasurement` ajoute avec migration `20260529170000_add_body_measurements`.
- 2026-05-29: routes API `/api/body-measurements`, `/latest`, `/:id` ajoutees avec CRUD protege JWT.
- 2026-05-29: `npm run typecheck -w server` : OK.
- 2026-05-29: `npm run test -w server -- --run src/routes/api.test.ts` : OK, 117 tests.
- 2026-05-29: client API, store Zustand `bodyMeasurementsStore` et donnees bypass ajoutes.
- 2026-05-29: entree Dashboard `Mensurations` ajoutee avec historique, derniere mesure, creation, edition et suppression.
- 2026-05-29: `npm run typecheck -w client` : OK.
- 2026-05-29: `docs/03-api/reference.md` mis a jour avec les endpoints `/api/body-measurements`.
- 2026-05-29: `npm run test -w server -- --run` : OK, 150 tests.
- 2026-05-29: `npm run build -w server` : OK.
- 2026-05-29: `npm run build -w client` : OK, warning Vite attendu sur chunk > 500 kB.
- 2026-05-29: `client/dist/` et `server/dist/` supprimes apres validation.
- 2026-05-29: apres format Prisma, `npm run typecheck -w server && npm run typecheck -w client` : OK.
- 2026-05-29: verification Playwright locale sur `http://localhost:5173/` en mode bypass: entree `Mensurations`, formulaire `Ajouter une mesure`, champs poids/taille/taille abdominale visibles, largeur mobile 390/390.
- 2026-05-29: `npm run db:migrate -w server -- --name add_body_measurements` bloque localement: PostgreSQL `localhost:5432` refuse les identifiants `postgres` (`P1000`). Migration SQL versionnee presente dans le depot.
- 2026-05-29: image homme generee via l'outil `image_gen` et ajoutee dans `client/public/body-measurements/body-silhouette.png`.
- 2026-05-29: schema SVG remplace par une image bitmap verte avec libelles et valeurs en overlay HTML dynamique.
- 2026-05-30: image femme generee via l'outil `image_gen` et ajoutee dans `client/public/body-measurements/body-silhouette-female.png`.
- 2026-05-30: champ `silhouette` ajoute aux mensurations pour choisir l'image `MALE` ou `FEMALE`.
- 2026-05-30: `prisma generate` apres ajout de `BodySilhouette` : OK.
- 2026-05-30: `tsc -p server/tsconfig.json --noEmit` : OK.
- 2026-05-30: `tsc -p client/tsconfig.json --noEmit` : OK.
- 2026-05-30: `vitest --run server/src/routes/api.test.ts` : OK, 117 tests.
- 2026-05-30: `vite build` cote client : OK, warning Vite attendu sur chunk > 500 kB.
- 2026-05-30: `tsc -p server/tsconfig.json` : OK.
- 2026-05-29: `npm run typecheck -w client` apres schema SVG : OK.
- 2026-05-29: `npm run build -w client` apres schema SVG : OK, warning Vite attendu sur chunk > 500 kB.
- 2026-05-29: schema SVG retravaille en silhouette verte avec lignes horizontales et libelles autour du corps, inspire de la reference fournie.
- 2026-05-29: `npm run typecheck -w client` apres reprise du schema : OK.
