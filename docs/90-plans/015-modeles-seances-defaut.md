# Plan - Modeles de seances par defaut

## Objectif

- Ajouter une premiere version utilisable des modeles de seances.
- Fournir 5 modeles globaux couvrant cardio, poids du corps, push, pull et legs.
- Permettre a un utilisateur de creer une vraie seance depuis un modele.

## Decisions

- Les modeles sont globaux et non modifiables par utilisateur en v1.
- Les modeles sont stockes dans des tables Prisma dediees, separees des seances utilisateur.
- L'instanciation copie le contenu du modele vers un `Workout` utilisateur a la date demandee.
- Les exercices manquants au seed sont crees ou reutilises par nom.
- Le frontend expose une action "Depuis un modele" dans l'ecran des seances.

## Todo

- [x] Creer ce plan.
- [x] Ajouter l'idee IA complementaire liee au chantier.
- [x] Ajouter le schema Prisma, la migration et le seed des modeles.
- [x] Ajouter les schemas, queries et routes API.
- [x] Ajouter les tests API Fastify.
- [x] Integrer les modeles cote React/Zustand avec bypass.
- [x] Lancer les verifications et noter les resultats.

## Notes de verification

- Idee IA ajoutee dans `docs/06-idees/90-ia-idees.md`: etiquettes et recherche rapide pour les modeles.
- Verification en bash: `node v18.19.0`, `npm 9.2.0`.
- `npm run db:generate -w server`: OK.
- `npm run typecheck -w server`: OK.
- `npm run test -w server -- --run`: OK (131 tests passes).
- `npm run build -w server`: OK.
- `npm run typecheck -w client`: OK.
- `npm run build -w client`: OK (warning chunk > 500 kB, build reussi).
- Nettoyage des artefacts de build non commits: `rm -rf server/dist client/dist`.
- `git diff --check`: OK, seulement avertissements CRLF sur `server/prisma/schema.prisma` et `server/src/app.ts`.
- `git status --short`: changements attendus sur docs, Prisma, API, tests et frontend; nouveaux fichiers de route/query/store/migration.
- Reference API mise a jour dans `docs/03-api/reference.md` pour `GET /api/workout-templates` et l'instanciation.
