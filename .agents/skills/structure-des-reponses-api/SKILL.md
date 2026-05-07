---
name: structure-des-reponses-api
description: Définit le format standard des réponses HTTP Fastify. À utiliser pour toute création ou modification de route API afin que le frontend sache lire les réponses sans surprise.
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Toutes les réponses API doivent suivre ce format :
- Liste : `{ data: [...], meta: { total, page, limit } }`
- Détail : `{ data: ... }`
- Création : `201` avec `{ data: ... }`
- Modification : `200` avec `{ data: ... }`
- Suppression sans contenu : `204`
- Erreur : `{ error: "message lisible", code: "ERROR_CODE" }`
- Validation Zod : `400` avec `{ error, code: "VALIDATION_ERROR", details }`
- Auth manquante/invalide : `401` avec `{ error, code: "UNAUTHORIZED" }`
- Toujours utiliser `reply.code(xxx).send(...)`.
- Les tests API doivent vérifier le statut HTTP et la structure de réponse.
