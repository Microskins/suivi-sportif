---
name: react-zustand
description: Définit les règles d'écriture du frontend React/Vite avec Zustand. À utiliser pour créer des écrans, stores, hooks ou appels API côté client.
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Quand tu génères du code frontend React :
- Composants fonctionnels uniquement, jamais de classes
- Un store Zustand par domaine métier (`auth`, `exercises`, `workouts`, puis `dashboard` si nécessaire)
- La couche API dans `client/src/api/` uniquement, jamais de `fetch` direct dans les composants
- Le frontend appelle l'API via `VITE_API_URL`, jamais PostgreSQL directement
- TailwindCSS pour tous les styles, jamais de CSS inline
- Nommage : composants en PascalCase, hooks en camelCase avec préfixe "use"
- Les composants lisent des données déjà normalisées par la couche API (`{ data }` côté backend)
