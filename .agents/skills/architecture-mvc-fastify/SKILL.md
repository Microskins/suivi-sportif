---
name: architecture-mvc-fastify
description: Définit comment organiser le code backend. Sépare clairement les routes (ce qui reçoit la requête), les requêtes SQL (ce qui parle à la BDD) et la validation (ce qui vérifie les données). Évite le code spaghetti où tout est mélangé dans un seul fichier.
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Quand tu génères du code backend Node.js avec Fastify, respecte toujours une architecture MVC stricte :
- Routes dans server/src/routes/ (un fichier par domaine)
- Requêtes SQL dans server/src/db/queries/ (un fichier par domaine)
- Validation Zod dans server/src/schemas/
- Jamais de SQL directement dans les routes
- Toujours utiliser async/await avec try/catch
- Codes HTTP explicites (200, 201, 400, 401, 404, 500)