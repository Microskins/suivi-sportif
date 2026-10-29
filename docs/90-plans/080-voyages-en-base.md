# Plan - Voyages en base de donnees et ecran d'admin

## Objectif

- Plus aucune donnee de voyage en dur dans le client: le globe, les billets
  et les carnets lisent l'API.
- Ajouter un voyage, ses vols, ses etapes, ses traces GPS et ses photos
  depuis un ecran d'admin `/voyage/admin`, sans commit ni deploiement.
- Remplacer les pages ecrites a la main (`ecosse-trip-site.tsx`,
  `islande-trip-site.tsx`) par une page carnet generique `/voyage/:slug`.

## Etat de depart

- API Fastify 5 + Prisma 5 + PostgreSQL. Toutes les routes existantes sont
  privees (JWT) et rattachees a l'utilisateur connecte; aucune route publique
  ni role administrateur.
- Client: le site Voyage n'appelle aucune API. Le seul client HTTP vit dans
  `sites/suivi-sportif/api/client.ts` et ne peut pas etre importe (frontieres
  entre sites controlees par `check:site-boundaries`).
- Donnees en dur: `voyage-trips.ts` (catalogue du globe), `ecosse-2026-data.ts`
  (etapes, traces), `islande-trip-site.tsx` (itineraire et reservations).
- Production: Nginx hote proxifie deja `/api/` vers l'API (127.0.0.1:3001).

## Decisions

### Modele de donnees (Prisma, une migration)

- `Airport`: `code` IATA (cle naturelle unique), `city`, `country`,
  `latitude`, `longitude`. Referentiel partage par tous les voyages.
- `Trip`: `slug` unique, `title`, `country`, `description`, `startDate`,
  `endDate`, `departureCode` / `arrivalCode` du billet, `stubLabel`,
  `published`, `userId` (proprietaire), horodatages.
- `TripFlight`: `tripId`, `position`, `fromAirportCode`, `toAirportCode`.
  Un retour depuis une autre ville = un second vol.
- `TripStage`: `tripId`, `position`, `code`, `dayLabel`, `dateLabel`,
  `title`, `detail`, `highlights` (text[]), `latitude`, `longitude`,
  `route` (JSON, trace reconstitue `[lng, lat][]`).
- `TripTrack`: `stageId`, `kind` (`TRAJET` | `RANDONNEE`), `name`,
  `fileName`, `byteSize`. Le GPX reste un fichier; le client le lit et le
  parse comme aujourd'hui (`gpx-track.ts` reutilise tel quel).
- `TripPhoto`: `stageId`, `position`, `fileName`, `alt`, `caption`, `mimeType`.
- Suppressions en cascade depuis `Trip` (vols, etapes, traces, photos); un
  compte proprietaire ne peut pas etre supprime tant qu'il a des voyages
  (`RESTRICT`); noms de colonnes en snake_case
  (`@map`), comme le reste du schema.
- **Statut calcule, jamais stocke**: "a venir" si `endDate` est dans le
  futur, sinon "realise". Corrige d'office le cas de l'Islande.

### API

- Publique, sans JWT, uniquement les voyages `published`:
  - `GET /api/voyages` -> catalogue du globe (voyage + vols + aeroports +
    statut calcule), sans etapes.
  - `GET /api/voyages/:slug` -> carnet complet (etapes, traces, photos avec
    leurs URL publiques).
  - `GET /api/voyages/files/:fileName` -> sert un GPX ou une photo.
- Admin, JWT + e-mail present dans `VOYAGE_ADMIN_EMAILS` (variable d'env,
  liste separee par des virgules). Un compte inscrit mais non liste recoit
  403: l'inscription publique existante ne doit pas permettre d'ecrire sur le
  site Voyage. Pas de colonne `role` a ajouter ni a administrer.
  - `GET /api/voyages/admin` (tous les voyages, y compris brouillons),
    `POST`, `PUT /:id`, `DELETE /:id` pour les voyages;
  - vols et etapes remplaces en bloc dans le `PUT` du voyage (une seule
    transaction, ordre = position dans le tableau): plus simple a valider et
    a saisir qu'un CRUD par sous-ressource;
  - `GET/POST/DELETE /api/voyages/admin/airports`;
  - `POST /api/voyages/admin/stages/:stageId/tracks` et `.../photos`,
    `DELETE` correspondants.
- Envoi de fichiers en corps brut (`Content-Type` du fichier, metadonnees en
  query), via un content-type parser Fastify borne en taille: GPX 10 Mo,
  photo 15 Mo. Aucune dependance ajoutee (`@fastify/multipart` non requis).
- Fichiers ecrits dans `UPLOAD_DIR` (defaut `./uploads`) sous un nom genere
  (`uuid` + extension controlee); le nom d'origine n'est jamais utilise comme
  chemin. Types acceptes: `.gpx` (XML verifie), `image/jpeg`, `image/png`,
  `image/webp`. Lecture servie par l'API: pas de nouvelle `location` Nginx,
  `/api/` est deja proxifie.
- Validation Zod comme le reste de `schemas/`, reponses via
  `lib/api-response.ts`, codes d'erreur prefixes (`TRIP_NOT_FOUND`,
  `TRIP_SLUG_TAKEN`, `VOYAGE_ADMIN_REQUIRED`, `UPLOAD_TYPE_NOT_ALLOWED`...).
- Rate limit sur les routes d'ecriture et d'envoi.

### Client

- `sites/voyage/api/voyage-api.ts`: petit client `fetch` propre au site Voyage
  (pas d'import depuis `suivi-sportif`), base `VITE_API_URL`.
- Globe et billets: chargement de `GET /api/voyages`; etats chargement,
  erreur et catalogue vide. `voyage-trips.ts` est supprime.
- Page carnet generique `voyage/:slug` (`trip-site.tsx`): billet, stats,
  carte MapLibre + GPS, feuille de route, pellicule, a partir de
  `GET /api/voyages/:slug`. Remplace `ecosse-trip-site.tsx` et
  `islande-trip-site.tsx`; `ecosse-2026-data.ts` ne garde que les fonctions
  de calcul (renomme `trip-geometry.ts`).
- Routeur: `/voyage`, `/voyage/admin`, `/voyage/:slug`.
- `VITE_BYPASS_AUTH=true` sert un jeu de demonstration local, comme le site
  Suivi Sportif, pour travailler sans API.
- Ecran `/voyage/admin` (charge a la demande):
  - connexion via `POST /api/users/login` existant, jeton en
    `sessionStorage` (propre a l'onglet), deconnexion;
  - liste des voyages (publies et brouillons) et bouton "Nouveau voyage";
  - formulaire voyage: infos, dates, publication, vols (choix d'aeroports +
    ajout d'un aeroport), etapes (ajout, ordre, suppression), position d'une
    etape par clic sur une carte MapLibre;
  - par etape: envoi de GPX (trajet / randonnee) et de photos (texte
    alternatif obligatoire, legende);
  - lien "Voir la page" vers le carnet publie.
  - DA Boarding Pass, mais sobre: c'est un outil, pas une vitrine.

### Reprise de l'existant

- Script idempotent `server/prisma/seed-voyages.ts` (`npm run db:seed:voyages
  -w server`): aeroports CDG, EDI, KEF, puis Ecosse (7 etapes et leurs traces
  reconstituees) et Islande (5 etapes), rattaches au premier compte admin.
  Relancable sans doublon (`upsert` par slug).
- Perdu volontairement: la section "Reservations a cadrer" de l'Islande,
  propre a un voyage en preparation. A reintroduire plus tard si besoin
  (table `TripBooking`), hors scope ici.

### Deploiement

- `docker-compose.yml`: volume nomme `voyage-uploads` monte sur
  `/app/uploads` dans `api`, variables `UPLOAD_DIR` et `VOYAGE_ADMIN_EMAILS`.
- Migration appliquee par `prisma migrate deploy` (procedure existante du
  runbook de deploiement).
- CSP inchangee: GPX et photos viennent de `'self'` via `/api/`.

## Phases et ordre

1. Schema Prisma, migration, statut calcule. Test de migration sur une base
   PostgreSQL locale (disponible dans l'environnement de travail).
2. Requetes `db/queries/voyages.ts`, schemas Zod, routes publiques et admin,
   garde admin, envoi/lecture de fichiers. Tests `fastify.inject` (mocks,
   comme `api.test.ts`) + un test d'integration sur la base locale.
3. Seed Ecosse + Islande.
4. Client public: API Voyage, globe et billets, page carnet generique,
   suppression des donnees en dur, tests.
5. Ecran d'admin.
6. Docker, docs (`overview`, `reference` API, deploiement), verification de
   bout en bout dans le navigateur avec API + base locales.

Chaque phase est commitee et poussee separement, avec typecheck, lint, tests
et controles du depot verts.

## Hors scope

- Comptes multiples ou partage de voyages entre utilisateurs.
- Redimensionnement / vignettes des photos (servies telles qu'envoyees;
  limite de taille a l'envoi).
- Import direct depuis l'API Strava (export GPX manuel).
- Reservations (`TripBooking`).

## Points a confirmer avec l'utilisateur

- E-mail du compte admin a mettre dans `VOYAGE_ADMIN_EMAILS`.
- Aeroport de depart de l'Ecosse (CDG provisoire).

## Todo

- [x] Phase 1 - modele et migration
- [x] Phase 2 - API et fichiers
- [x] Phase 3 - reprise des voyages (Ecosse, Albanie, Roumanie, Grande
  Canarie; Islande retiree)
- [x] Phase 4 - site public branche sur l'API
- [x] Phase 5 - ecran d'admin
- [x] Phase 6 - deploiement, docs, verification de bout en bout
- [ ] Mise en production (procedure: `docs/04-deployment/docker.md`)
  (Docker, Nginx et docs faits le 2026-10-29; reste la verification de bout
  en bout et la mise en production)

## Notes de verification

- 2026-10-29: migration `20261029120000_add_voyages` generee avec
  `prisma migrate diff`. Le diff proposait aussi de supprimer les colonnes
  historiques `exercises.equipment` et `exercises.muscle_group`, gardees en
  base depuis `exercise_relations_refactor` mais absentes du schema Prisma:
  ces `DROP COLUMN` ont ete retires a la main. La migration ne fait que creer
  l'enum `TripTrackKind`, les tables des voyages, leurs index et leurs cles
  etrangeres.
- 2026-10-29: Islande retiree. Il n'y a pas eu de voyage en Islande: ni
  aeroport KEF, ni voyage, ni page `islande-trip-site.tsx`. Le point "statut
  de l'Islande" du plan 079 tombe avec.
- 2026-10-29: 4 voyages repris dans `server/prisma/voyages-seed.json`, tous
  publies: Ecosse CRL -> EDI (19-27 octobre 2026, 7 etapes et leurs traces
  reconstituees; l'aeroport de depart est Charleroi, plus CDG), Albanie
  BVA -> TIA, Roumanie CRL -> OTP et Grande Canarie ORY -> LPA. Ces trois
  derniers n'ont ni dates ni etapes et sont comptes "realises".
- 2026-10-29: dates rendues facultatives (`start_date` / `end_date`
  nullables, `null` accepte par l'API). Un voyage sans date de fin est
  "realise"; il est classe apres les voyages dates.
- 2026-10-29: le seed est `seed-voyages.mjs` (et non `.ts`), pour tourner
  tel quel dans l'image de production comme `prod-seed.mjs`. Il ne fait pas
  d'`upsert` des voyages: un slug deja present est laisse intact, pour ne
  jamais ecraser une modification faite depuis l'admin. Il exige que le compte
  du premier e-mail de `VOYAGE_ADMIN_EMAILS` existe. Admin de production:
  `thomas.cochart@outlook.fr`.
- 2026-10-29: `VITE_BYPASS_AUTH` n'a pas de jeu de demonstration pour le site
  Voyage. Idee abandonnee: elle aurait reintroduit des donnees de voyage en dur
  dans le client. Sans API, le globe et le carnet affichent leur etat
  d'erreur.
- 2026-10-29: routes reellement livrees (voir `docs/03-api/reference.md`):
  `GET /api/voyages/admin/trips` (et non `/api/voyages/admin`),
  `GET/PUT /api/voyages/admin/airports` (creation ou mise a jour par code, pas
  de suppression), `POST /api/voyages/admin/stages/:id/tracks|photos`,
  `DELETE /api/voyages/admin/tracks/:id` et `.../photos/:id`. Au `PUT` d'un
  voyage, une etape envoyee avec son `id` garde ses traces et ses photos.
- 2026-10-29: deploiement prepare: volume `voyage-uploads` monte sur
  `/app/uploads` (`UPLOAD_DIR=/app/uploads`) et `VOYAGE_ADMIN_EMAILS` dans
  `docker-compose.yml`; `client_max_body_size 16m` sur
  `location /api/voyages/admin/` dans `deploy/nginx/suivi-sportif.fr.conf`
  (la limite Nginx par defaut de 1 Mo bloquait les envois). La CSP ne change
  pas. Ordre de mise en production dans `docs/04-deployment/docker.md`.
- 2026-10-29: relecture du deploiement, trois defauts corriges dans l'API:
  un corps refuse par Fastify avant la route (photo de plus de 15 Mo,
  `Content-Type` non gere) repondait `500` au lieu de `413` / `415`
  (`app.ts` gere desormais ces deux statuts); le JSON d'un voyage etait
  limite a 1 Mo (route `bodyLimit` porte a 8 Mo); et `trips.user_id` etait en
  `ON DELETE CASCADE`, si bien que supprimer le compte admin effacait tous les
  voyages en laissant leurs fichiers sur le disque (passe en `RESTRICT`,
  migration non encore deployee donc corrigee sur place). Reste hors scope:
  sans `trustProxy`, les limites de debit voient toutes les requetes venir de
  Nginx (127.0.0.1); defaut anterieur, commun a toute l'API.
- 2026-10-29: ecran `/voyage/admin` livre (fichiers `admin-*`, charge a la
  demande, 34,7 kB minifie). Verifie de bout en bout dans Chromium contre
  l'API et la base locales: connexion, creation d'un voyage publie avec un
  vol BVA -> TIA et une etape, envoi d'un GPX et d'une photo JPEG, carnet
  public affichant la trace et la photo, puis suppression du voyage (API
  publique -> 404, dossier des fichiers revenu a vide).
- 2026-10-29: constat hors scope: `POST /api/users/login` compare l'e-mail en
  tenant compte de la casse (un compte inscrit en `Thomas.Cochart@...` ne se
  connecte pas en minuscules), alors que `VOYAGE_ADMIN_EMAILS` l'ignore.
  Comportement anterieur au chantier, laisse tel quel.
