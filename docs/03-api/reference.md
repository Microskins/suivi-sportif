# API

Base locale:

```text
http://localhost:3001
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
  "name": "Test User"
}
```

Reponse `201`:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "name": "Test User"
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
  "name": "New Name"
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
          "rest": 90
        }
      ]
    }
  ]
}
```

Pour `range`, les dates sont des datetime ISO encodees dans l'URL.

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

## Erreurs frequentes

- `400 VALIDATION_ERROR`: body, params ou dates invalides.
- `401 UNAUTHORIZED`: token manquant ou invalide.
- `403 FORBIDDEN`: route volontairement indisponible sans role admin.
- `404 *_NOT_FOUND`: ressource absente ou hors scope utilisateur.
