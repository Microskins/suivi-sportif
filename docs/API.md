# API

Base locale:

```text
http://localhost:3001
```

Les réponses suivent:

- succès liste: `{ data: [...], meta: { total, page, limit } }`
- succès détail/création/modification: `{ data: ... }`
- suppression: `204`
- erreur: `{ error, code }`

## Auth

### `POST /api/users/register`

Public.

Body:

```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

Réponse `201`:

```json
{
  "data": {
    "user": {},
    "token": "jwt"
  }
}
```

### `POST /api/users/login`

Public.

Body:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Réponse `200`: même format que register.

### `GET /api/users/me`

Protégé par `Authorization: Bearer <TOKEN>`.

Réponse `200`:

```json
{
  "data": {
    "id": "uuid",
    "email": "test@example.com",
    "name": "Test User",
    "createdAt": "2026-05-04T10:00:00.000Z",
    "updatedAt": "2026-05-04T10:00:00.000Z"
  }
}
```

### `PUT /api/users/me`

Protégé.

Body partiel:

```json
{
  "name": "New Name"
}
```

## Exercises

Toutes les routes sont protégées.

- `GET /api/exercises`
- `GET /api/exercises/:id`
- `GET /api/exercises/muscle/:group`
- `POST /api/exercises`
- `PUT /api/exercises/:id`
- `DELETE /api/exercises/:id`

Muscle groups autorisés:

```text
chest, back, shoulders, arms, legs, core, cardio
```

Créer un exercice:

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

Toutes les routes sont protégées et utilisent l'utilisateur du JWT.

- `GET /api/workouts`
- `GET /api/workouts/:id`
- `GET /api/workouts/range/:start/:end`
- `POST /api/workouts`
- `PUT /api/workouts/:id`
- `DELETE /api/workouts/:id`

Créer une séance:

```json
{
  "name": "Séance jambes",
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

Pour `range`, les dates doivent être des datetime ISO encodées dans l'URL.

## Erreurs fréquentes

- `400 VALIDATION_ERROR`: body, params ou dates invalides.
- `401 UNAUTHORIZED`: token manquant ou invalide.
- `403 FORBIDDEN`: route volontairement indisponible sans rôle admin.
- `404 *_NOT_FOUND`: ressource absente ou hors scope utilisateur.
