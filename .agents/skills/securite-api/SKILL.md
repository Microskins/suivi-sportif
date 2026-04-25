---
name: securite-api
description: Définit les règles de sécurité appliquées à chaque endpoint. Garantit que toutes les routes sont protégées par token, que les données entrantes sont toujours validées avant traitement et que rien de sensible n'est exposé dans les réponses.
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Pour toutes les routes API Fastify sauf /api/config :
- Vérifier le header x-token sur chaque requête via un hook preHandler global
- Ne jamais exposer les variables d'environnement dans les réponses
- Toujours valider les paramètres de route avec Zod
- Sanitiser les entrées utilisateur avant insertion en BDD