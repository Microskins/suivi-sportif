---
name: conventions-de-code
description: Définit le style d'écriture commun à tout le projet — nommage des variables, fichiers, commits. Permet à n'importe qui de lire le code et de comprendre sa structure sans documentation supplémentaire.
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Conventions générales pour ce projet :
- Commits conventionnels : feat:, fix:, chore:, docs:, refactor:
- Variables et fonctions en camelCase
- Constantes en SCREAMING_SNAKE_CASE
- Fichiers en kebab-case
- Toujours des commentaires en français
- Pas de console.log en production, utiliser le logger Fastify (fastify.log)