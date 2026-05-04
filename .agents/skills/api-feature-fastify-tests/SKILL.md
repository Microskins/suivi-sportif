---
name: api-feature-fastify-tests
description: Workflow complet pour ajouter ou modifier une feature API Fastify dans ce projet avec Zod, Prisma, JWT, réponses standardisées, tests Vitest via fastify.inject et commit de progression.
---

Utilise ce skill quand une demande touche une route API, un endpoint, une ressource backend, une query Prisma, un schéma Zod ou un test API.

## Workflow

1. Lire les fichiers du domaine concerné :
   - `server/src/routes/<domain>.ts`
   - `server/src/db/queries/<domain>.ts`
   - `server/src/schemas/index.ts`
   - `server/src/routes/api.test.ts`

2. Implémenter en gardant les responsabilités séparées :
   - routes : HTTP, validation, auth, codes de réponse ;
   - schemas : Zod et types inférés ;
   - db/queries : Prisma uniquement ;
   - services/controllers : à ajouter seulement si la logique métier dépasse l'orchestration simple.

3. Sécurité :
   - routes publiques seulement si explicitement nécessaire ;
   - routes protégées avec `Authorization: Bearer <JWT>` ;
   - utilisateur courant depuis `request.user` ;
   - jamais de mot de passe, secret ou variable sensible dans les réponses.

4. Réponses API :
   - liste : `{ data, meta: { total, page, limit } }` ;
   - détail/création/modification : `{ data }` ;
   - suppression : `204` ;
   - erreur : `{ error, code }`.

5. Tests :
   - utiliser `buildApp({ logger: false })` et `app.inject()`;
   - mocker les queries Prisma si le test porte sur les routes ;
   - vérifier au moins statut HTTP, structure de réponse et appel query attendu ;
   - ajouter un test `401` pour toute route protégée nouvelle.

6. Validation avant commit :
   - `npm run typecheck -w server`
   - `npm run test -w server -- --run`
   - `npm run build -w server`
   - supprimer `server/dist/` si généré et non destiné au commit.

7. Commit :
   - utiliser un commit conventionnel (`feat:`, `fix:`, `test:`, `refactor:`) ;
   - garder les commits par progression fonctionnelle.
