# Plan - API tests ownership update delete

## Objectif

Verrouiller les comportements critiques de l'API backend:

- authentification JWT sur les routes protegees;
- ownership utilisateur sur les ressources personnelles;
- update/delete sans modification hors scope;
- validations `400`;
- erreurs `401`, `403`, `404`;
- suppressions `204` sans body.

## Decisions

- Le chantier couvre users, exercises, workouts, foods, meals et nutrition goals.
- Les exercises restent des ressources globales.
- Les routes arbitraires users restent interdites sans role admin.
- Les tests route utilisent `fastify.inject()` et des mocks de queries.
- Les tests query mockent Prisma et verifient les filtres d'ownership.
- Les corrections de route/query sont autorisees si un test revele un ecart.
- Aucun changement frontend et aucune migration Prisma.

## Todo

- [x] Creer ce plan.
- [x] Ajouter le plan dans `docs/90-plans/README.md`.
- [x] Completer les tests routes Fastify pour foods.
- [x] Completer les tests routes Fastify pour meals.
- [x] Completer les tests routes Fastify pour nutrition goals.
- [x] Ajouter les tests query foods.
- [x] Ajouter les tests query meals.
- [x] Ajouter les tests query nutrition goals.
- [x] Verifier les routes users/exercises/workouts existantes.
- [x] Lancer le typecheck serveur.
- [x] Lancer les tests serveur.
- [x] Lancer le build serveur.

## Notes de verification

- Les routes protegees refusent les requetes sans token.
- Les ids invalides ne doivent pas appeler la couche query.
- Les payloads invalides ne doivent pas appeler la couche query.
- Les ressources hors scope retournent `404`.
- Les foods globales sont lisibles mais pas modifiables ni supprimables.
- Les meals refusent les foods inaccessibles a la creation et a l'update.
- Un nutrition goal actif desactive uniquement les autres objectifs actifs du
  meme utilisateur.
- `npm` n'etait pas disponible dans le shell local; les validations ont ete
  lancees via le runtime Node local:
  - `node node_modules/typescript/bin/tsc -p server/tsconfig.json --noEmit`
  - `node node_modules/vitest/vitest.mjs --run --root server`
  - `node node_modules/typescript/bin/tsc -p server/tsconfig.json`
