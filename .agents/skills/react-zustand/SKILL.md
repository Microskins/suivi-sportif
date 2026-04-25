---
name: react-zustand
description: Définit les règles d'écriture des composants React et de la gestion d'état. Garantit que les appels API ne sont jamais dispersés dans les composants, que le style est toujours en Tailwind, et que chaque module a son propre store de données isolé.
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Quand tu génères du code frontend React :
- Composants fonctionnels uniquement, jamais de classes
- Un store Zustand par domaine métier (body, sleep, meals, sessions)
- La couche API dans client/src/api/ uniquement, jamais de fetch dans les composants
- TailwindCSS pour tous les styles, jamais de CSS inline
- Nommage : composants en PascalCase, hooks en camelCase avec préfixe "use"