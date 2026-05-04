---
name: securite-api
description: Définit les règles de sécurité appliquées à chaque endpoint Fastify. À utiliser pour toute route API, authentification JWT, validation d'entrée ou exposition de données.
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Pour toutes les routes API Fastify :
- Routes publiques autorisées seulement si elles sont explicitement listées (`/health`, `/api/users/login`, `/api/users/register`).
- Les routes protégées utilisent `Authorization: Bearer <JWT>` et `request.jwtVerify()`.
- Les données utilisateur courantes viennent de `request.user`, jamais d'un header manuel comme `x-user-id`.
- Ne jamais exposer `DATABASE_URL`, `JWT_SECRET`, hash de mot de passe ou variable d'environnement sensible.
- Toujours valider body, params et query avec Zod avant d'appeler la couche BDD.
- Toujours hasher les mots de passe avec `bcrypt`.
- Le frontend ne parle jamais directement à PostgreSQL.
- Ajouter un test qui prouve qu'une route protégée refuse une requête sans token.
