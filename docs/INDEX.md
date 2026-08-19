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
|-- 06-idees/
|   |-- README.md
|   |-- 01-calendrier-suivi.md
|   |-- 06- chatbox-ia.md
|   `-- 90-ia-idees.md
|-- 07-qualite/
|   |-- README.md
|   |-- checklist-ui-accessibilite.md
|   `-- images-exercices.md
|-- 90-plans/
|   |-- README.md
|   `-- XXX-nom-du-chantier.md   (un fichier par chantier, voir l'index)
`-- 99-archive/
    `-- (phase 0, conserve pour l'historique)
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
| Proposer ou retrouver une idee | [06-idees/README.md](./06-idees/README.md) |
| Verifier l'interface et l'accessibilite | [checklist-ui-accessibilite.md](./07-qualite/checklist-ui-accessibilite.md) |
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
- `docs/06-idees/README.md`
- `docs/07-qualite/README.md`
- `docs/07-qualite/checklist-ui-accessibilite.md`
- `docs/90-plans/README.md`
- `docs/90-plans/*.md`

Les fichiers de l'ancienne phase 0 restent presents dans `docs/99-archive/`,
mais ils ne doivent plus etre utilises pour installer, developper ou deployer le
projet.

## Etat du projet

- Monorepo npm: `server`, `client`, `mcp`.
- Backend Fastify/TypeScript avec Prisma/PostgreSQL.
- Auth JWT avec mots de passe hashes, via un hook `authenticate` partage.
- Reponses API centralisees dans `server/src/lib/api-response.ts`; les routes
  de liste sont paginees (`page`/`limit`, defaut 20, plafond 100).
- Routes utilisateurs, exercices, seances, aliments, repas, objectifs
  nutrition, mensurations, modeles de seances et assistant.
- Frontend React/Vite **multi-sites**: un seul build sert cinq surfaces
  (portfolio, Suivi Sportif, Trekking, Voyage, Prix Frais), chacune avec sa
  direction artistique. Voir `02-architecture/project-structure.md`.
- Seul Suivi Sportif consomme l'API et utilise Zustand; les quatre autres
  sites fonctionnent sur donnees locales.
- Tests serveur via Vitest et `fastify.inject()`, tests client via Vitest, et
  une suite Playwright pour le comparateur de prix.
- Interface conforme WCAG 2.1 AA sur les cinq sites (plan 075).
- Deploiement Docker Compose derriere Nginx.

## Controles du depot

Trois controles gardent des conventions qui ne tiendraient pas seules:

```bash
npm run check:file-size         # 500 lignes maximum par fichier de client/src
npm run check:site-boundaries   # un site n'importe jamais un autre site
npm run check:contrast          # les couleurs de DA respectent WCAG AA
```

S'y ajoutent `npm run lint`, `npm test` et `npm run build`.

## Regle de maintenance

Quand le code change:

1. Mettre a jour `README.md` si les commandes, scripts ou comportements visibles changent.
2. Mettre a jour `01-getting-started/quick-start.md` si l'installation ou le lancement change.
3. Mettre a jour `03-api/reference.md` si un endpoint, un schema ou un code d'erreur change.
4. Mettre a jour `02-architecture/overview.md` si une couche, un dossier ou une convention change.
5. Mettre a jour `07-qualite/checklist-ui-accessibilite.md` si une regle
   d'interface ou d'accessibilite change.
6. Ajouter ou completer un plan dans `90-plans/` pour les chantiers suivis.

Un cas merite une vigilance particuliere: les skills de `.agents/skills/`
decrivent des conventions et des couleurs. Quand le code les change, les
mettre a jour dans le meme mouvement, sinon ils documentent un projet qui
n'existe plus. Les plans 074 et 075 ont tous deux eu a corriger ce decalage.
