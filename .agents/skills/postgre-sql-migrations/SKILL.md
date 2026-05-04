---
name: postgre-sql-migrations
description: Définit les conventions PostgreSQL/Prisma du projet. À utiliser quand le schéma Prisma, les relations, les index, les migrations ou la préparation de la base changent.
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Quand tu modifies la base de données :
- La source de vérité est `server/prisma/schema.prisma`.
- Utiliser Prisma plutôt que des migrations SQL manuelles dans un dossier `migrations/`.
- En développement rapide, `npm run db:push -w server` peut appliquer le schéma.
- Pour un changement durable/versionné, utiliser `npm run db:migrate -w server`.
- Après un changement de schéma, lancer `npm run db:generate -w server`.
- Les relations critiques doivent définir `onDelete: Cascade` quand la donnée enfant n'a pas de sens seule.
- Ajouter des index Prisma (`@@index`) sur les filtres fréquents, notamment user/date.
- Utiliser `Decimal` pour les poids, mesures et valeurs où l'arrondi flottant est dangereux.
- Garder PostgreSQL accessible uniquement au serveur API, jamais au frontend.
- Vérifier au minimum `npm run typecheck -w server` après génération Prisma.
