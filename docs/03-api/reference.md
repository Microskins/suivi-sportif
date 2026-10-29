# API

Base locale:

```text
http://localhost:3001
```

Documentation interactive locale:

```text
http://localhost:3001/docs/
```

Specification OpenAPI JSON:

```text
http://localhost:3001/docs/json
```

En production, l'API est exposee derriere le domaine public:

```text
https://suivi-sportif.fr
```

## Formats standard

Liste:

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20
  }
}
```

Les routes de liste acceptent deux parametres de requete optionnels:

| Parametre | Defaut | Plafond |
| --- | --- | --- |
| `page` | `1` | aucun |
| `limit` | `20` | `100` |

Toute valeur absente, non numerique ou hors bornes retombe sur ces valeurs.
`meta.total` compte les elements correspondant au filtre, pas la taille de la
page renvoyee: c'est lui qui permet de savoir s'il reste des pages a lire.

Un client qui a besoin de la collection complete doit donc enchainer les
pages jusqu'a atteindre `meta.total`; c'est ce que fait la couche
`client/src/sites/suivi-sportif/api/client.ts`.

Detail, creation ou modification:

```json
{
  "data": {}
}
```

Suppression:

```text
204 No Content
```

Erreur:

```json
{
  "error": "Message lisible",
  "code": "ERROR_CODE"
}
```

## Auth

### `POST /api/users/register`

Public.

```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User",
  "dateOfBirth": "1992-06-15T00:00:00.000Z"
}
```

Reponse `201`:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "name": "Test User",
      "dateOfBirth": "1992-06-15T00:00:00.000Z",
      "createdAt": "2026-05-30T12:00:00.000Z",
      "updatedAt": "2026-05-30T12:00:00.000Z"
    },
    "token": "jwt"
  }
}
```

### `POST /api/users/login`

Public.

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Reponse `200`: meme format que `register`.

### `GET /api/users/me`

Protege par:

```text
Authorization: Bearer <TOKEN>
```

### `PUT /api/users/me`

Protege. Body partiel:

```json
{
  "name": "New Name",
  "dateOfBirth": "1992-06-15T00:00:00.000Z"
}
```

Pour changer l'email ou le mot de passe, le body doit aussi contenir le mot de
passe actuel:

```json
{
  "email": "new@example.com",
  "currentPassword": "password123"
}
```

## Assistant IA

Toutes les routes sont protegees et utilisent l'utilisateur du JWT.

### `POST /api/assistant/draft`

Endpoint de chat IA protege. Il interprete une demande libre pour la chat box
et renvoie une reponse conversationnelle. L'interface ne montre plus de
brouillon technique et n'applique plus de mutation automatique depuis le chat.

Si `ANTHROPIC_API_KEY` est configure cote serveur, le chat utilise Claude pour
produire la reponse. Si la cle est absente, si l'appel echoue ou si la sortie
ne respecte pas le contrat attendu, l'API retombe sur une reponse locale
deterministe.

Le contexte et l'historique recent servent uniquement a rendre la reponse plus
pertinente. Quand l'utilisateur demande d'ajouter, modifier ou supprimer une
donnee, le chat repond comme un assistant conversationnel classique et
redirige vers l'ecran adapte au lieu d'ecrire dans la base.

Body:

```json
{
  "context": "meals",
  "history": [
    {
      "role": "user",
      "content": "Tu peux m'aider à comprendre ma semaine ?"
    },
    {
      "role": "assistant",
      "content": "Bien sur, je peux te faire un resume clair."
    }
  ],
  "message": "Que dois-je regarder dans ma nutrition ?"
}
```

`context` est optionnel et vaut `dashboard`, `profile`, `meals`, `workouts`,
`measurements` ou `goals`. `history` est optionnel, limite a 20 messages, et
sert uniquement a donner le fil recent de conversation au chat.

Reponse `200`:

```json
{
  "data": {
    "action": "unknown",
    "confidence": "medium",
    "missingFields": [],
    "payload": {},
    "requiresConfirmation": false,
    "reply": "Je peux t'aider à lire ta semaine et à retrouver la bonne page.",
    "summary": "Je peux t'aider à lire ta semaine et à retrouver la bonne page."
  }
}
```

## Exercises

Toutes les routes sont protegees.

- `GET /api/exercises`
- `GET /api/exercises/:id`
- `GET /api/exercises/muscle/:group`
- `POST /api/exercises`
- `PUT /api/exercises/:id`
- `DELETE /api/exercises/:id`

Groupes musculaires autorises:

```text
chest, back, shoulders, arms, legs, core, cardio
```

Creation:

```json
{
  "name": "Squat",
  "description": "Mouvement polyarticulaire pour les jambes.",
  "muscleGroup": "legs",
  "equipment": "barbell",
  "difficulty": "intermediate"
}
```

## Workouts

Toutes les routes sont protegees et utilisent l'utilisateur du JWT.

- `GET /api/workouts`
- `GET /api/workouts/:id`
- `GET /api/workouts/range/:start/:end`
- `POST /api/workouts`
- `PUT /api/workouts/:id`
- `DELETE /api/workouts/:id`

Creation:

```json
{
  "name": "Seance jambes",
  "date": "2026-05-04T10:00:00.000Z",
  "duration": 60,
  "notes": "Travail lourd",
  "exercises": [
    {
      "exerciseId": "uuid",
      "sets": [
        {
          "reps": 10,
          "weight": 80,
          "rpe": 8,
          "rir": 2,
          "rest": 90
        }
      ]
    }
  ]
}
```

Exemple cardio (exercise de type `CARDIO`):

```json
{
  "name": "Cardio tapis",
  "date": "2026-05-04T10:00:00.000Z",
  "duration": 35,
  "exercises": [
    {
      "exerciseId": "uuid",
      "sets": [
        {
          "durationMinutes": 12.5,
          "avgKmh": 10.8,
          "inclinePercent": 2.5,
          "rpe": 7.5,
          "rir": 3,
          "rest": 60
        }
      ]
    }
  ]
}
```

Regles metier sur les sets:

- Exercice `CARDIO`: `durationMinutes` et `avgKmh` requis, `inclinePercent` optionnel.
- Exercice non `CARDIO`: `reps` et `weight` requis.
- Toutes les series acceptent `rpe` optionnel de 1 a 10 et `rir` optionnel de 0 a 10.

Pour `range`, les dates sont des datetime ISO encodees dans l'URL.

## Workout Templates

Toutes les routes sont protegees. Les modeles sont globaux et l'instanciation
cree une seance personnelle pour l'utilisateur du JWT.

- `GET /api/workout-templates`
- `POST /api/workout-templates`
- `PUT /api/workout-templates/:id`
- `DELETE /api/workout-templates/:id`
- `POST /api/workout-templates/:id/instantiate`

Mise a jour de modele (body partiel autorise):

```json
{
  "name": "Push avance",
  "duration": 70,
  "description": "Version mise a jour"
}
```

Instanciation:

```json
{
  "date": "2026-05-04T10:00:00.000Z"
}
```

Reponse `201`: une seance au meme format que `POST /api/workouts`.

## Nutrition

Toutes les routes sont protegees et utilisent l'utilisateur du JWT.

### Foods

- `GET /api/foods`
- `GET /api/foods/:id`
- `POST /api/foods`
- `PUT /api/foods/:id`
- `DELETE /api/foods/:id`

Les aliments globaux ont `userId: null`. Les aliments crees par l'API sont
personnels a l'utilisateur authentifie.

Creation:

```json
{
  "name": "Riz basmati",
  "brand": null,
  "barcode": null,
  "caloriesKcal": 350,
  "proteinGrams": 7,
  "carbsGrams": 78,
  "fatGrams": 1,
  "fiberGrams": null,
  "servingUnit": "g"
}
```

`servingUnit` vaut `g` ou `unit`.

Les valeurs nutritionnelles sont stockees pour 100 g.

### Meals

- `GET /api/meals`
- `GET /api/meals/:id`
- `GET /api/meals/range/:start/:end`
- `POST /api/meals`
- `PUT /api/meals/:id`
- `DELETE /api/meals/:id`

Creation:

```json
{
  "name": "Dejeuner",
  "date": "2026-05-04T12:00:00.000Z",
  "mealType": "lunch",
  "notes": null,
  "items": [
    {
      "foodId": "uuid",
      "quantityGrams": 150
    }
  ]
}
```

`mealType` accepte `breakfast`, `lunch`, `dinner`, `snack`, `other`.

Les reponses contiennent des totaux calories/macros calcules depuis des
snapshots par item. Un ancien repas ne change donc pas si un aliment est modifie.

### Nutrition Goals

- `GET /api/nutrition-goals`
- `GET /api/nutrition-goals/active`
- `GET /api/nutrition-goals/:id`
- `POST /api/nutrition-goals`
- `PUT /api/nutrition-goals/:id`
- `DELETE /api/nutrition-goals/:id`

Creation:

```json
{
  "name": "Maintien",
  "startDate": "2026-05-04T00:00:00.000Z",
  "endDate": null,
  "dailyCaloriesKcal": 2400,
  "dailyProteinGrams": 160,
  "dailyCarbsGrams": 260,
  "dailyFatGrams": 70,
  "isActive": true
}
```

Creer ou modifier un objectif avec `isActive: true` desactive les autres
objectifs actifs de l'utilisateur.

## Objectifs sport et corps

Toutes les routes sont protegees et utilisent l'utilisateur du JWT.

- `GET /api/user-goals`
- `GET /api/user-goals/:id`
- `POST /api/user-goals`
- `PUT /api/user-goals/:id`
- `DELETE /api/user-goals/:id`

Creation:

```json
{
  "domain": "BODY",
  "exerciseId": null,
  "metric": "BODY_WEIGHT_KG",
  "direction": "AT_MOST",
  "name": "Poids cible",
  "targetValue": 80,
  "startDate": "2026-05-04T00:00:00.000Z",
  "endDate": null,
  "isActive": true,
  "notes": null
}
```

`domain` vaut `SPORT` ou `BODY`.
`direction` vaut `AT_MOST`, `AT_LEAST` ou `EXACT`.

Metriques disponibles:

- `SPORT_WORKOUTS_PER_WEEK`
- `SPORT_MINUTES_PER_WEEK`
- `SPORT_EXERCISE_ONE_REP_MAX_KG`
- `SPORT_EXERCISE_TEN_REP_MAX_KG`
- `SPORT_EXERCISE_MAX_REPS`
- `BODY_WEIGHT_KG`
- `BODY_BMI`
- `BODY_FAT_PERCENT`

Les metriques `SPORT_EXERCISE_*` doivent renseigner `exerciseId`.

## Mensurations

Toutes les routes sont protegees et utilisent l'utilisateur du JWT.

- `GET /api/body-measurements`
- `GET /api/body-measurements/latest`
- `GET /api/body-measurements/:id`
- `POST /api/body-measurements`
- `PUT /api/body-measurements/:id`
- `DELETE /api/body-measurements/:id`

Creation:

```json
{
  "date": "2026-05-04T08:00:00.000Z",
  "silhouette": "MALE",
  "isActiveLifestyle": true,
  "weightKg": 82.4,
  "heightCm": 181,
  "chestCm": 104,
  "waistCm": 86,
  "hipsCm": 99,
  "neckCm": 39,
  "shouldersCm": 121,
  "leftArmCm": 36,
  "rightArmCm": 36.5,
  "leftForearmCm": 29,
  "rightForearmCm": 29.5,
  "leftThighCm": 60,
  "rightThighCm": 60.5,
  "leftCalfCm": 39,
  "rightCalfCm": 39.5,
  "notes": "Mesure du matin"
}
```

`silhouette` vaut `MALE` ou `FEMALE` et vaut `MALE` par defaut.
`isActiveLifestyle` est optionnel et sert a ajuster la depense journaliere estimee.
L'age est calcule automatiquement depuis `dateOfBirth` du profil utilisateur.
Tous les champs de mesure sauf `date` sont optionnels et peuvent etre `null`.
Les valeurs sont stockees avec precision decimale.

## Voyages

Donnees du site Voyage (`/voyage`). Routes declarees dans
`server/src/routes/voyages.ts`, validees par `server/src/schemas/voyages.ts`.

### Lecture publique

Sans JWT. Seuls les voyages `published: true` sont visibles; un brouillon
repond comme un voyage absent.

- `GET /api/voyages`: catalogue du globe, sans etapes. Reponse
  `{ "data": [...] }` sans `meta`: la liste n'est pas paginee. Ordre: voyages
  a venir d'abord, puis par `startDate` decroissante, voyages sans dates en
  dernier.
- `GET /api/voyages/:slug`: carnet complet (etapes, traces, photos).
  `404 TRIP_NOT_FOUND` si le slug est absent ou non publie.
- `GET /api/voyages/files/:fileName`: sert une trace GPX ou une photo.
  `fileName` doit etre un nom genere par l'API (`<uuid>.gpx|jpg|png|webp`),
  sinon `400 VALIDATION_ERROR`. `404 TRIP_FILE_NOT_FOUND` si le fichier n'est
  rattache a aucun voyage publie ou manque sur le disque. Reponse servie avec
  `Cache-Control: public, max-age=31536000, immutable`: un nom de fichier
  n'est jamais reutilise.

Voyage resume (`GET /api/voyages`):

```json
{
  "id": "uuid",
  "slug": "ecosse-2026",
  "title": "Ecosse - Boucle des Highlands",
  "country": "Ecosse",
  "description": "Texte libre",
  "stubLabel": "SCO / 2026",
  "startDate": "2026-10-19",
  "endDate": "2026-10-27",
  "published": true,
  "status": "realise",
  "flights": [
    {
      "from": { "code": "CRL", "city": "Charleroi", "name": "...", "coordinates": [4.4538, 50.4592] },
      "to": { "code": "EDI", "city": "Edimbourg", "name": "...", "coordinates": [-3.3725, 55.95] }
    }
  ]
}
```

`status` est calcule, jamais stocke: `a-venir` tant que `endDate` n'est pas
passee (comparaison au jour UTC), sinon `realise`; un voyage sans `endDate`
est `realise`. `startDate` et `endDate` sont facultatives (`null`). Les
coordonnees sont toujours `[longitude, latitude]`.

Carnet (`GET /api/voyages/:slug`): les memes champs, plus `stages`, dans
l'ordre de l'itineraire:

```json
{
  "id": "uuid",
  "code": "EDI",
  "dayLabel": "J1",
  "dateLabel": "19 oct.",
  "title": "Edimbourg",
  "detail": "Texte libre",
  "highlights": ["Royal Mile"],
  "coordinates": [-3.19, 55.95],
  "route": [[-3.19, 55.95], [-3.5, 56.1]],
  "tracks": [
    { "id": "uuid", "kind": "trajet", "name": "Edimbourg - Glencoe", "url": "/api/voyages/files/<uuid>.gpx" }
  ],
  "photos": [
    { "id": "uuid", "url": "/api/voyages/files/<uuid>.jpg", "alt": "Texte alternatif", "caption": "" }
  ]
}
```

`route` est le trace reconstitue de l'etape (`[lng, lat][]`, eventuellement
vide). `kind` vaut `trajet` (route de A a B) ou `randonnee`. Les `url` sont
relatives a l'API.

### Administration

Toutes les routes sous `/api/voyages/admin` exigent un JWT
(`401 UNAUTHORIZED` sinon) dont l'e-mail figure dans `VOYAGE_ADMIN_EMAILS`
(liste separee par des virgules, comparaison sans casse). Un compte connecte
mais absent de la liste recoit `403 VOYAGE_ADMIN_REQUIRED`: l'inscription
publique ne donne aucun droit d'ecriture sur le site Voyage.

Les routes d'ecriture (`POST`, `PUT`, `DELETE`) sont limitees a
`VOYAGE_WRITE_RATE_LIMIT_MAX` requetes par minute (defaut `60`), au-dela
`429 RATE_LIMIT_EXCEEDED`.

Voyages:

- `GET /api/voyages/admin/trips`: tous les voyages, brouillons compris, au
  format resume (meme ordre que la liste publique).
- `GET /api/voyages/admin/trips/:id`: carnet complet, publie ou non.
- `POST /api/voyages/admin/trips`: cree un voyage, `201` avec le carnet. Le
  voyage est rattache a l'utilisateur du JWT.
- `PUT /api/voyages/admin/trips/:id`: remplace le voyage, `200` avec le
  carnet.
- `DELETE /api/voyages/admin/trips/:id`: `204`; les fichiers des etapes sont
  effaces du disque.

Sur les routes avec `:id`, un voyage inconnu repond `404 TRIP_NOT_FOUND`.

`:id` est un UUID (`400 VALIDATION_ERROR` sinon). Corps de `POST` et `PUT`:

```json
{
  "slug": "ecosse-2026",
  "title": "Ecosse - Boucle des Highlands",
  "country": "Ecosse",
  "description": "",
  "stubLabel": "SCO / 2026",
  "startDate": "2026-10-19",
  "endDate": "2026-10-27",
  "published": false,
  "flights": [{ "fromCode": "CRL", "toCode": "EDI", "mode": "avion" }],
  "stages": [
    {
      "id": "uuid d'une etape existante, a omettre pour une nouvelle etape",
      "code": "EDI",
      "dayLabel": "J1",
      "dateLabel": "19 oct.",
      "title": "Edimbourg",
      "detail": "",
      "highlights": [],
      "coordinates": [-3.19, 55.95],
      "route": []
    }
  ]
}
```

Regles de validation:

- `slug`: minuscules, chiffres et tirets (`ecosse-2026`), 60 caracteres max,
  unique (`409 TRIP_SLUG_TAKEN`).
- `title` (120), `country` (80), `stubLabel` (30) obligatoires;
  `description` (1000) vaut `""` par defaut.
- `startDate` et `endDate`: `AAAA-MM-JJ` ou `null` (defaut); si les deux sont
  presentes, `endDate` ne precede pas `startDate`.
- `published` vaut `false` par defaut.
- `flights`: 1 a 10 trajets, codes a 3 lettres (mis en majuscules) d'un lieu
  du referentiel `airports` (aeroport ou ville); chaque lieu doit exister
  (`400 AIRPORT_NOT_FOUND`). `mode`: `avion` (defaut si absent) ou `voiture`;
  le globe trace un trajet en voiture en tirets, avec une voiture au lieu
  d'un avion. Un retour depuis une autre ville se declare comme un second
  trajet. Les reponses portent aussi `mode` sur chaque element de `flights`.
- `stages`: 60 max, ordre du tableau = ordre de l'itineraire. `code` 2 a 4
  caracteres (mis en majuscules), `dayLabel` (20), `dateLabel` (40), `title`
  (120) obligatoires; `detail` (2000), `highlights` (12 x 60 caracteres) et
  `route` (5000 points) facultatifs.

Au `PUT`, les vols sont remplaces en bloc. Une etape envoyee avec son `id`
est mise a jour et garde ses traces et ses photos; une etape sans `id` est
creee; une etape existante absente du tableau est supprimee avec ses
fichiers. Un `id` qui n'appartient pas a ce voyage donne
`400 STAGE_NOT_FOUND`. Le tout tient dans une transaction.

Aeroports (referentiel partage par tous les voyages):

- `GET /api/voyages/admin/airports`: liste triee par code.
- `PUT /api/voyages/admin/airports`: cree ou met a jour un aeroport par son
  code, `200`.

```json
{
  "code": "EDI",
  "city": "Edimbourg",
  "name": "Aeroport d'Edimbourg",
  "latitude": 55.95,
  "longitude": -3.3725
}
```

Il n'y a pas de route de suppression d'aeroport.

Traces GPX et photos d'une etape: le fichier est envoye tel quel en corps
brut (pas de `multipart/form-data`), ses metadonnees en query. Le format est
verifie au contenu, pas au nom ni au `Content-Type`; le fichier est stocke
sous un nom genere (`<uuid>.<extension>`), le nom d'origine n'est jamais
utilise.

- `POST /api/voyages/admin/stages/:id/tracks?kind=trajet&name=...`:
  `Content-Type: application/gpx+xml` (ou `application/xml`, `text/xml`,
  `application/octet-stream`), 10 Mo max. `kind` vaut `trajet` ou
  `randonnee`, `name` (120) est obligatoire. `201` avec la trace
  (`{ id, kind, name, url }`).
- `POST /api/voyages/admin/stages/:id/photos?alt=...&caption=...`:
  `Content-Type: image/jpeg`, `image/png` ou `image/webp` (ou
  `application/octet-stream`), 15 Mo max. JPEG, PNG ou WebP reconnus a leur
  signature. `alt` (200) est obligatoire, `caption` (200) facultatif. `201`
  avec la photo (`{ id, url, alt, caption }`), ajoutee en fin de pellicule.
- `DELETE /api/voyages/admin/tracks/:id` et
  `DELETE /api/voyages/admin/photos/:id`: `204`, fichier efface du disque;
  `404 TRIP_FILE_NOT_FOUND` si l'id est inconnu.

Exemple d'envoi:

```bash
curl -X POST "https://suivi-sportif.fr/api/voyages/admin/stages/<stageId>/tracks?kind=randonnee&name=Quiraing" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/gpx+xml" \
  --data-binary @quiraing.gpx
```

Erreurs propres aux envois:

- `404 STAGE_NOT_FOUND`: etape inconnue.
- `400 UPLOAD_EMPTY`: fichier vide.
- `400 UPLOAD_TYPE_NOT_ALLOWED`: le contenu n'est pas un GPX, ou pas une
  image JPEG, PNG ou WebP.
- `415 UPLOAD_TYPE_NOT_ALLOWED`: corps non brut (par exemple du JSON).
- `413 UPLOAD_TOO_LARGE`: GPX de plus de 10 Mo.
- `400 VALIDATION_ERROR`: query invalide (`kind`, `name` ou `alt` manquant).

Au-dela de 15 Mo (photo ou GPX), ou avec un `Content-Type` non gere
(`image/gif`, `multipart/form-data`...), Fastify rejette la requete avant la
route: le gestionnaire d'erreurs global repond `413 PAYLOAD_TOO_LARGE` ou
`415 UNSUPPORTED_MEDIA_TYPE`. Le JSON d'un voyage (`POST` / `PUT
/admin/trips`) est accepte jusqu'a 8 Mo (traces reconstituees volumineuses).
En production, Nginx coupe a 16 Mo sur `/api/voyages/admin/` (`413` HTML de
Nginx).

## Erreurs frequentes

- `400 VALIDATION_ERROR`: body, params ou dates invalides.
- `401 UNAUTHORIZED`: token manquant ou invalide.
- `403 FORBIDDEN`: route volontairement indisponible sans role admin.
- `403 VOYAGE_ADMIN_REQUIRED`: compte connecte absent de `VOYAGE_ADMIN_EMAILS`
  sur une route `/api/voyages/admin`.
- `404 *_NOT_FOUND`: ressource absente ou hors scope utilisateur.
- `409 EMAIL_ALREADY_EXISTS`: email deja pris, a l'inscription ou au
  changement d'email.
- `409 TRIP_SLUG_TAKEN`: slug de voyage deja utilise.
- `413 UPLOAD_TOO_LARGE`, `415 UPLOAD_TYPE_NOT_ALLOWED`: envoi de fichier
  Voyage refuse (voir section Voyages).
- `413 PAYLOAD_TOO_LARGE`, `415 UNSUPPORTED_MEDIA_TYPE`: corps refuse par
  Fastify avant la route (taille ou `Content-Type`), sur toute l'API.
- `429 RATE_LIMIT_EXCEEDED`: trop de tentatives sur `/login` ou `/register`,
  ou trop d'ecritures admin Voyage.
- `500 INTERNAL_SERVER_ERROR`: erreur inattendue, sans detail d'implementation.

Le code d'un `404` nomme la ressource (`USER_NOT_FOUND`, `WORKOUT_NOT_FOUND`,
`MEAL_NOT_FOUND`, ...): il n'existe pas de `NOT_FOUND` generique. Un acces a
la ressource d'un autre utilisateur renvoie `404` et non `403`, afin de ne pas
divulguer son existence.

Exception du site Voyage: `AIRPORT_NOT_FOUND` et `STAGE_NOT_FOUND` renvoyes
pour un code d'aeroport ou un id d'etape cite dans le corps d'un voyage
repondent `400`, pas `404`: c'est le corps qui est invalide, pas l'URL.
