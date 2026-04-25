---
name: structure-des-reponses-api
description: Définit le format standard de toutes les réponses HTTP. Garantit que le frontend sait toujours où trouver les données, comment détecter une erreur et quel code HTTP attendre — sans surprise.
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Toutes les réponses API doivent suivre ce format :
- Succès : { data: ..., meta: { total, page, limit } } pour les listes
- Succès simple : { ok: true } pour les créations/modifications
- Erreur : { error: 'message lisible', code: 'ERROR_CODE' }
- Toujours reply.code(xxx).send(...) avec le code HTTP explicite