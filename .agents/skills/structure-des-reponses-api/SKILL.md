---
name: structure-des-reponses-api
description: Définit le format standard des réponses HTTP des routes Fastify (liste, détail, création, modification, suppression, erreurs), avec la convention de pagination, le catalogue des codes d'erreur, le pattern de validation Zod et le pattern de test associé. À utiliser pour toute création ou modification de route API Fastify, ou tout test de route, afin que le frontend et les tests puissent lire les réponses sans surprise. Déclenche-toi sur toute mention de "route API", "endpoint Fastify", "handler", ou tout fichier sous `routes/`.
---

# Structure des réponses API (Fastify)

Convention à appliquer sans exception sur toute route Fastify de ce projet. L'objectif : le frontend et les tests peuvent toujours prédire la forme d'une réponse à partir du seul statut HTTP, sans lire le code de la route.

## Format par type de réponse

| Cas | Statut | Corps |
|---|---|---|
| Liste | `200` | `{ data: [...], meta: { total, page, limit } }` |
| Détail | `200` | `{ data: ... }` |
| Création | `201` | `{ data: ... }` |
| Modification | `200` | `{ data: ... }` |
| Suppression | `204` | *(vide)* |
| Erreur | `4xx` / `5xx` | `{ error: "message lisible", code: "ERROR_CODE" }` |
| Erreur de validation | `400` | `{ error, code: "VALIDATION_ERROR", details }` |

`details` sur une erreur de validation contient la sortie de `zodError.flatten()` (ou équivalent), pas un message reformulé à la main.

## Catalogue des codes d'erreur

Ne pas inventer un nouveau `code` pour un cas déjà couvert ici.

| `code` | Statut | Quand |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Corps/query/params invalides (échec Zod) |
| `UNAUTHORIZED` | 401 | Authentification absente ou invalide |
| `FORBIDDEN` | 403 | Authentifié mais accès refusé sur cette ressource |
| `NOT_FOUND` | 404 | Ressource inexistante ou hors du scope de l'utilisateur |
| `CONFLICT` | 409 | Contrainte d'unicité ou état incompatible (ex. double booking) |
| `INTERNAL_ERROR` | 500 | Erreur inattendue, jamais de détail d'implémentation exposé |

Un nouveau code métier (ex. `SEANCE_DEJA_PLANIFIEE`) est acceptable pour un cas précis non couvert ci-dessus, mais reste un `409 CONFLICT` ou un `400 VALIDATION_ERROR` selon la nature — ne pas créer de nouveau statut HTTP hors de cette liste sans raison forte.

## Pagination

- Query params : `page` (défaut `1`) et `limit` (défaut `20`, plafonné à `100`).
- `meta.total` = nombre total d'éléments correspondant au filtre, pas la taille de la page renvoyée.
- Toujours normaliser `page`/`limit` avec des bornes sûres (voir `parsePagination` dans la référence) plutôt que de faire confiance aux query params bruts.

## Règles d'implémentation

- Toujours répondre via `reply.code(xxx).send(...)` — jamais `reply.send()` seul sans code explicite, même pour un `200`.
- Toujours passer par les helpers centralisés (`sendOk`, `sendList`, `sendCreated`, `sendNoContent`, `sendValidationError`, `sendUnauthorized`, `sendForbidden`, `sendNotFound`, `sendConflict`, `sendInternalError`) plutôt que de construire le corps de réponse à la main dans chaque route — voir `assets/api-response.ts`.
- Vérifier l'authentification **avant** de parser/valider le body : un appel non authentifié doit recevoir `401`, pas `400`, même si le payload est aussi invalide.
- Sur `404`, le message peut nommer le type de ressource ("Séance introuvable.") mais ne doit jamais confirmer ou infirmer l'existence d'une ressource appartenant à un autre utilisateur — un accès hors scope renvoie `404`, pas `403`, pour ne pas fuiter l'existence de la ressource.
- Une erreur `500` ne renvoie jamais la stack trace ni le message d'erreur brut dans `error` — toujours un message générique, le détail va dans les logs serveur.

## Tests

Chaque route testée doit vérifier **à la fois** :
1. Le statut HTTP exact.
2. La forme du corps de réponse (`data`/`meta` ou `error`/`code`/`details` selon le cas) — pas seulement "le statut est bon".

Voir `assets/seances.route.test.ts` pour le pattern (statut + `toMatchObject`/`toEqual` sur la forme attendue), y compris le cas où l'authentification manque alors que le payload est aussi invalide (l'assertion doit porter sur `401`, pas `400`).

## Référence de code

- `assets/api-response.ts` — helpers de réponse centralisés à importer dans toute nouvelle route.
- `assets/seances.route.ts` — exemple de route CRUD complète (liste paginée, détail, création, modification, suppression) appliquant la convention de bout en bout, y compris l'ordre auth → validation → lookup → action.
- `assets/seances.route.test.ts` — exemple de suite de tests couvrant les statuts et les formes de réponse pour chaque cas.

Pour toute nouvelle route : copier le pattern de `seances.route.ts` plutôt que d'écrire le handler à la main, et adapter le schéma Zod et les appels DB — la structure de réponse et l'ordre des vérifications ne changent pas.