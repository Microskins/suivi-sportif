# Documentation

Cette page est la porte d'entree des docs du projet.

## Hierarchie

```text
docs/
|-- INDEX.md
|-- 01-getting-started/
|   `-- quick-start.md
|-- 02-architecture/
|   |-- overview.md
|   `-- project-structure.md
|-- 03-api/
|   |-- reference.md
|   `-- data-entry.md
|-- 04-deployment/
|   |-- target.md
|   `-- docker.md
|-- 05-mcp/
|   `-- debug-server.md
|-- 90-plans/
|   |-- README.md
|   |-- 001-compte-initial-data.md
|   `-- 002-api-helpers.md
`-- 99-archive/
    |-- 00-start-here.txt
    |-- getting-started.txt
    |-- phase-0-ready.txt
    |-- phase-0-setup.md
    |-- readme-setup.md
    `-- summary.md
```

## Lire selon le besoin

| Besoin | Document |
| --- | --- |
| Installer et lancer le projet | [quick-start.md](./01-getting-started/quick-start.md) |
| Comprendre l'organisation technique | [overview.md](./02-architecture/overview.md) |
| Connaitre les dossiers importants | [project-structure.md](./02-architecture/project-structure.md) |
| Consulter les endpoints et formats | [reference.md](./03-api/reference.md) |
| Creer des donnees via scripts API | [data-entry.md](./03-api/data-entry.md) |
| Comprendre la cible de deploiement | [target.md](./04-deployment/target.md) |
| Deployer en Docker/Nginx | [docker.md](./04-deployment/docker.md) |
| Utiliser le MCP de debug | [debug-server.md](./05-mcp/debug-server.md) |
| Suivre les chantiers | [90-plans/README.md](./90-plans/README.md) |

## Source de verite

Les documents actifs sont:

- `README.md`
- `docs/INDEX.md`
- `docs/01-getting-started/quick-start.md`
- `docs/02-architecture/overview.md`
- `docs/02-architecture/project-structure.md`
- `docs/03-api/reference.md`
- `docs/03-api/data-entry.md`
- `docs/04-deployment/target.md`
- `docs/04-deployment/docker.md`
- `docs/05-mcp/debug-server.md`
- `docs/90-plans/README.md`
- `docs/90-plans/*.md`

Les fichiers de l'ancienne phase 0 restent presents dans `docs/99-archive/`,
mais ils ne doivent plus etre utilises pour installer, developper ou deployer le
projet.

## Etat du projet

- Monorepo npm: `server`, `client`, `mcp`.
- Backend Fastify/TypeScript avec Prisma/PostgreSQL.
- Auth JWT avec mots de passe hashes.
- Routes utilisateurs, exercices, seances, aliments, repas et objectifs nutrition.
- Frontend React/Vite avec Zustand et mode bypass local.
- Tests serveur via Vitest et `fastify.inject()`.
- Deploiement Docker Compose derriere Nginx.

## Regle de maintenance

Quand le code change:

1. Mettre a jour `README.md` si les commandes, scripts ou comportements visibles changent.
2. Mettre a jour `01-getting-started/quick-start.md` si l'installation ou le lancement change.
3. Mettre a jour `03-api/reference.md` si un endpoint, un schema ou un code d'erreur change.
4. Mettre a jour `02-architecture/overview.md` si une couche, un dossier ou une convention change.
5. Ajouter ou completer un plan dans `90-plans/` pour les chantiers suivis.
