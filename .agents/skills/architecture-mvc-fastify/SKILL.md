---
name: architecture-mvc-fastify
description: Définit comment organiser le backend Fastify en MVC pragmatique avec routes, validation Zod, queries Prisma et tests API. À utiliser pour créer ou modifier une feature API.
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Quand tu génères du code backend Fastify, respecte l'architecture du projet :
- `server/src/app.ts` construit l'instance Fastify testable avec `fastify.inject()`.
- `server/src/server.ts` démarre seulement le serveur réseau.
- Routes dans `server/src/routes/` (un fichier par domaine).
- Validation Zod dans `server/src/schemas/`.
- Accès BDD dans `server/src/db/queries/` via Prisma uniquement.
- Ajouter `controllers/` ou `services/` quand une route commence à porter trop de logique métier.
- Jamais de Prisma directement dans les composants React.
- Jamais d'accès BDD dans le frontend.
- Toujours utiliser async/await avec try/catch dans les handlers.
- Toujours envoyer des codes HTTP explicites avec `reply.code(...).send(...)`.
- Ajouter ou adapter les tests API Vitest quand le comportement d'une route change.
