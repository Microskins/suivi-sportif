---
name: structure-des-reponses-api
description: Définit le format standard des réponses HTTP des routes Fastify (liste, détail, création, modification, suppression, erreurs), avec la convention de pagination, le catalogue des codes d'erreur, le pattern de validation Zod et le pattern de test associé. À utiliser pour toute création ou modification de route API Fastify, ou tout test de route, afin que le frontend et les tests puissent lire les réponses sans surprise. Déclenche-toi sur toute mention de "route API", "endpoint Fastify", "handler", ou tout fichier sous `routes/`.
---

# Structure des réponses API (Fastify)

Convention à appliquer sans exception sur toute route Fastify de ce projet. L'objectif : le frontend et les tests peuvent toujours prédire la forme d'une réponse à partir du seul statut HTTP, sans lire le code de la route.

Ce document décrit la convention **réellement appliquée** dans `server/src`. Les helpers existent pour de bon dans `server/src/lib/api-response.ts` — les importer, ne pas reconstruire un corps de réponse à la main.

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

`details` contient **le tableau `error.errors` de Zod** (les `ZodIssue` bruts), pas un message reformulé à la main.

⚠️ Ne pas utiliser `zodError.flatten()` ici : les schémas de réponse Fastify déclarent `details: { type: "array" }`, or `flatten()` renvoie un objet. La sérialisation Fastify supprimerait alors le champ.

## Catalogue des codes d'erreur

| `code` | Statut | Quand |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Corps/query/params invalides (échec Zod) |
| `UNAUTHORIZED` | 401 | Authentification absente ou invalide |
| `FORBIDDEN` | 403 | Fonctionnalité volontairement indisponible sur cet endpoint |
| `<RESSOURCE>_NOT_FOUND` | 404 | Ressource inexistante ou hors du scope de l'utilisateur |
| `<CODE_METIER>` | 409 | Conflit d'unicité ou état incompatible |
| `INTERNAL_SERVER_ERROR` | 500 | Erreur inattendue, jamais de détail d'implémentation exposé |

### Codes 404 préfixés par la ressource

Le code d'un 404 nomme la ressource : `USER_NOT_FOUND`, `WORKOUT_NOT_FOUND`, `EXERCISE_NOT_FOUND`, `FOOD_NOT_FOUND`, `MEAL_NOT_FOUND`, `NUTRITION_GOAL_NOT_FOUND`, `USER_GOAL_NOT_FOUND`, `BODY_MEASUREMENT_NOT_FOUND`, `WORKOUT_TEMPLATE_NOT_FOUND`.

Il n'existe **pas** de code générique `NOT_FOUND` dans ce projet, et le code 500 est `INTERNAL_SERVER_ERROR` (pas `INTERNAL_ERROR`). Une nouvelle ressource suit le même schéma : `<RESSOURCE>_NOT_FOUND`.

### Codes métier existants

`INVALID_CREDENTIALS` (401), `CURRENT_PASSWORD_REQUIRED` (400), `INVALID_CURRENT_PASSWORD` (401), `EMAIL_ALREADY_EXISTS` (409), `RATE_LIMIT_EXCEEDED` (429).

Un conflit d'unicité est un `409`, pas un `400`.

## Pagination

- Query params : `page` (défaut `1`) et `limit` (défaut `20`, plafonné à `100`).
- Toujours normaliser via `parsePagination(request.query)` plutôt que de faire confiance aux query params bruts.
- `meta.total` = nombre total d'éléments correspondant au filtre, **pas** la taille de la page renvoyée. Il vient d'un `count()` Prisma sur le même `where` que le `findMany`.

Côté `db/queries`, une fonction de liste :
- prend un paramètre `pagination` **optionnel** `{ skip, take }` ;
- renvoie `{ items, total }`.

Le paramètre est optionnel parce que les services internes ont parfois besoin du jeu complet : `services/assistant-orchestrator.ts` appelle `getFoods`/`getExercises` sans pagination pour faire du rapprochement par nom sur tout le catalogue. Une route, elle, passe **toujours** la pagination.

## Authentification

Les routes protégées installent le hook partagé :

```ts
import { authenticate } from "../plugins/auth.js";

fastify.addHook("preHandler", authenticate);
```

Ne pas recopier un bloc `jwtVerify` + `401` dans chaque fichier, et ne pas compter sur `fastify.authenticate` : le décorateur existe mais `authPlugin` est enregistré **sans** `fastify-plugin`, donc son `decorate()` reste encapsulé dans le scope du plugin et n'est pas visible depuis les routes voisines. C'est la raison pour laquelle ce décorateur n'a jamais servi.

Cas particulier : `users.ts` a son propre hook, car `/login` et `/register` doivent rester publics au sein du même préfixe.

## Règles d'implémentation

- Toujours répondre via les helpers de `server/src/lib/api-response.ts` : `sendOk`, `sendList`, `sendCreated`, `sendNoContent`, `sendValidationError`, `sendUnauthorized`, `sendForbidden`, `sendNotFound`, `sendConflict`, `sendInternalError`.
- Importer aussi les schémas JSON partagés (`errorResponseSchema`, `validationErrorResponseSchema`, `metaSchema`) plutôt que de les redéfinir en tête de chaque fichier.
- `sendNotFound(reply, message, code)` et `sendConflict(reply, message, code)` prennent le code en paramètre, puisque celui-ci dépend de la ressource.
- Vérifier l'authentification **avant** de parser/valider le body : un appel non authentifié reçoit `401`, pas `400`, même si le payload est aussi invalide. Le hook `preHandler` garantit cet ordre.
- Sur `404`, le message peut nommer le type de ressource, mais un accès hors scope renvoie `404` et non `403`, pour ne pas divulguer l'existence d'une ressource appartenant à quelqu'un d'autre.
- Une erreur `500` ne renvoie jamais la stack trace ni le message brut — message générique, détail dans les logs via `fastify.log.error(error)`.

## Tests

Chaque route testée doit vérifier **à la fois** :
1. Le statut HTTP exact.
2. La forme du corps de réponse (`data`/`meta` ou `error`/`code`/`details` selon le cas) — pas seulement « le statut est bon ».

Toute route protégée nouvelle doit avoir un test qui prouve qu'elle refuse une requête sans token.

Attention en modifiant un statut : une assertion peut porter sur `statusCode` sans jamais citer le `code` d'erreur. Chercher uniquement le nom du code laisse passer ces tests-là.

## Référence de code

La source de vérité est le code du serveur :

- `server/src/lib/api-response.ts` — les helpers réellement utilisés.
- `server/src/routes/meals.ts` — route CRUD complète appliquant la convention.
- `server/src/routes/api.test.ts` — patterns de test.

Les fichiers `assets/` de ce skill donnent le même pattern sous forme d'exemple autonome (ressource fictive « séances »), utile pour démarrer une nouvelle route sans lire tout le serveur.
