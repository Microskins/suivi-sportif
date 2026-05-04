# Documentation

Cette page est la source d'orientation pour la documentation du projet.

## Documents actifs

- [Quick Start](./QUICK_START.md): commandes pour installer, lancer et vérifier le projet.
- [Architecture](./ARCHITECTURE.md): organisation backend/frontend et conventions principales.
- [Project Structure](./PROJECT_STRUCTURE.md): structure actuelle des dossiers et fichiers importants.

## Etat du projet

Le projet est actuellement centré sur l'API:

- Backend Fastify/TypeScript.
- Prisma/PostgreSQL.
- Auth JWT avec mots de passe hashés.
- Routes users, exercises, workouts.
- Workouts persistés avec exercices et séries.
- Premiers tests API Vitest avec `fastify.inject()`.
- Frontend React encore minimal.

## Documents historiques

Les fichiers suivants viennent d'une phase de setup plus ancienne. Ils peuvent contenir des références obsolètes à SQLite, `index.js`, `setup-dirs.js`, `migrations/` ou une structure React en `.jsx`.

- `00_START_HERE.txt`
- `GETTING_STARTED.txt`
- `PHASE_0_READY.txt`
- `PHASE_0_SETUP.md`
- `README_SETUP.md`
- `SUMMARY.md`

Ne pas les utiliser comme source de vérité sans les relire et les mettre à jour.

## Règle de maintenance

Quand le code change:

1. Mettre à jour le README si l'installation, les scripts ou l'état produit changent.
2. Mettre à jour `ARCHITECTURE.md` si l'organisation technique change.
3. Mettre à jour `QUICK_START.md` si une commande change.
4. Ajouter ou corriger les tests API avant de documenter une route comme stable.
