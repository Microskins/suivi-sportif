# Architecture

## Vue d'ensemble

Le projet est un monorepo npm avec trois workspaces:

- `server`: API Fastify en TypeScript.
- `client`: application React/Vite en TypeScript.
- `mcp`: serveur MCP de debug et d'automatisation.

Versions principales actuelles:

- Fastify 5.
- Vite 8.
- React 18.

La source de verite metier est cote API. Le frontend appelle l'API et ne parle
jamais directement a PostgreSQL.

## Architecture cible

```text
Navigateur
  |
  v
Serveur frontend
React/Vite build statique, servi par Nginx ou equivalent
  |
  v
Serveur API
Fastify + TypeScript + JWT + Prisma
  |
  v
Serveur PostgreSQL
Base dediee, non exposee au navigateur
```

Regles:

- Le frontend ne possede pas `DATABASE_URL`.
- L'API est la seule couche autorisee a lire ou modifier la base.
- PostgreSQL n'accepte que les connexions depuis l'API.
- Le MCP passe par l'API pour les operations metier.

## Backend

Entrees:

- `server/src/app.ts`: construit l'instance Fastify et sert aux tests.
- `server/src/server.ts`: demarre l'API sur le port `3001`.

Organisation:

```text
server/src/
|-- app.ts
|-- server.ts
|-- db/
|   |-- index.ts
|   `-- queries/
|       |-- body-measurements.ts
|       |-- exercises.ts
|       |-- foods.ts
|       |-- meals.ts
|       |-- nutrition-goals.ts
|       |-- user-goals.ts
|       |-- users.ts
|       |-- workouts.ts
|       `-- workout-templates.ts
|-- plugins/
|   `-- auth.ts
|-- routes/
|   |-- api.test.ts
|   |-- body-measurements.ts
|   |-- exercises.ts
|   |-- foods.ts
|   |-- meals.ts
|   |-- nutrition-goals.ts
|   |-- user-goals.ts
|   |-- users.ts
|   |-- workouts.ts
|   `-- workout-templates.ts
`-- schemas/
    `-- index.ts
```

### MVC pragmatique

- `routes/`: transport HTTP, validation, codes de reponse.
- `schemas/`: schemas Zod et types d'entree/sortie.
- `db/queries/`: acces Prisma et persistance.
- `controllers/` ou `services/`: a ajouter quand un flux grossit.

Aujourd'hui, les routes et `db/queries` portent encore l'essentiel de la logique
car les flux restent simples. Des services seront ajoutes quand une route
commencera a orchestrer plusieurs decisions metier.

### Reponses API

- Liste: `{ data, meta: { total, page, limit } }`
- Detail: `{ data }`
- Erreur: `{ error, code }`
- Suppression: `204`

### Authentification

Routes publiques:

- `POST /api/users/register`
- `POST /api/users/login`

Routes protegees:

- `GET /api/users/me`
- `PUT /api/users/me`
- CRUD exercices
- CRUD seances
- CRUD modeles de seances
- CRUD aliments
- CRUD repas
- CRUD objectifs nutritionnels
- CRUD objectifs sport/corps
- CRUD mensurations corporelles

Les mots de passe sont hashes avec `bcrypt`. Les ressources utilisateur utilisent
`request.user.id`, issu du token JWT.

### Donnees

Prisma utilise PostgreSQL via `DATABASE_URL`.

Modeles principaux:

- `User`
- `Exercise`
- `Workout`
- `WorkoutExercise`
- `WorkoutSet`
- `Food`
- `Meal`
- `MealItem`
- `NutritionGoal`

Les repas stockent des snapshots nutritionnels par item pour conserver
l'historique meme si un aliment est modifie ensuite. Un objectif nutritionnel
actif desactive les autres objectifs actifs du meme utilisateur.

### Tests

Les tests API utilisent Vitest et `fastify.inject()`:

```bash
npm run test -w server -- --run
```

Tests importants:

- `server/src/routes/api.test.ts`
- `server/src/db/queries/workouts.test.ts`

## Frontend

Organisation actuelle:

```text
client/src/
|-- app/
|   |-- site-identities.ts
|   `-- site-router.tsx
|-- main.tsx
`-- sites/
    |-- portfolio/
    |-- prix-aliments/
    |-- trekking/
    |-- voyage/
    `-- suivi-sportif/
        |-- api/
        |-- components/
        |-- consent/
        |-- data/
        `-- stores/
```

`client/src/app/site-router.tsx` ne porte aucune logique metier: il choisit le
site selon le chemin courant. Chaque site possede ses composants et son etat,
sans import direct vers les fichiers internes d'un autre site.

`client/src/app/site-identities.ts` porte uniquement le registre transversal
des identites. Il applique avant le rendu React le titre, la description, la
couleur navigateur, le favicon et l'attribut `data-site` correspondant a la
route. Les images sociales suivent aussi le contexte. Le manifeste et les
icones d'installation PWA ne sont ajoutes que pour Suivi Sportif, afin que le
portfolio, Trekking et Voyage ne proposent pas d'installer la mauvaise
application.
Les signatures de marque, palettes et composants visuels restent dans leur
dossier de site:

- portfolio: direction editoriale ivoire, encre et vermillon;
- Suivi Sportif: interface chaleureuse et arrondie, dans la DA Energie;
- Trekking: univers organique inspire des cartes topographiques;
- Voyage: billets clairs, encre bleu nuit et donnees monospaces dans la DA
  Boarding Pass.
- Prix Frais: recu de caisse central sur fond comptoir, JetBrains Mono,
  separateurs pointilles et vert reserve exclusivement au meilleur prix.

Cette frontiere permet d'ajouter un site sans melanger son interface avec les
autres, tout en gardant un seul document HTML et un seul build Vite.

Dans Suivi Sportif, `api/client.ts` centralise les appels HTTP et lit les
reponses standardisees `{ data: ... }`. Les stores Zustand portent l'etat
d'auth, d'exercices et de seances. Le mode `VITE_BYPASS_AUTH=true` permet de
travailler sur l'interface sans API locale.

Le client sert aussi de point d'entree de portfolio:

- `/` affiche le portfolio;
- `/suivi-sportif` affiche l'application de suivi sportif;
- `/suivi-sportif/politique-cookies` affiche sa politique de cookies.
- `/trekking` affiche le catalogue des voyages de trekking.
- `/trekking/vosges-wild` affiche le carnet de preparation Vosges 2027; sa
  checklist est conservee localement dans le navigateur via un store Zustand.
  Ses deux traces Google My Maps restent inactives jusqu'au clic du visiteur.
- `/voyage` affiche le catalogue des carnets de voyage.
- `/voyage/islande-2026` affiche le carnet de preparation Islande 2026, sans
  reference de reservation privee dans le bundle public.
- `/prix-aliments` affiche le comparateur alimentaire Prix Frais. Son catalogue
  local est un jeu de demonstration explicitement identifie comme tel; aucune
  donnee magasin en direct n'est encore collectee. La configuration locale
  actuelle utilise le code postal `59278` et quatre fiches officielles:
  Intermarche Escautpont, Carrefour Conde-sur-l'Escaut, ALDI
  Fresnes-sur-Escaut et Colruyt Peruwelz.

Les routes techniques restent a la racine du domaine: `/api`, `/health` et
`/mcp`. Cette organisation permet d'ajouter de futurs projets sous leurs
propres chemins sans nouveau domaine ni DNS.

Les assets propres a un site suivent la meme frontiere sous
`client/public/sites/<site>`. Les fichiers maintenus dans `client/src` sont
limites a 500 lignes et controles avec `npm run check:file-size`.

## MCP

Le workspace `mcp/` expose un serveur de debug sur `127.0.0.1:3033`. Il fournit
des outils de diagnostic, de checks, de lecture de donnees et quelques actions
metier controlees. Voir [debug-server.md](../05-mcp/debug-server.md).

## Deploiement

Le deploiement courant cible Docker Compose derriere Nginx:

- API: `127.0.0.1:3001`
- Frontend: `127.0.0.1:5173`
- MCP: `127.0.0.1:3033`

Voir [docker.md](../04-deployment/docker.md) pour le runbook et
[target.md](../04-deployment/target.md) pour la cible long terme.
