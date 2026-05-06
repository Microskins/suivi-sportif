# Plan - Frontend CRUD ecrans

## Objectif

- Terminer les ecrans frontend de creation, edition et suppression pour les
  exercices, seances, aliments, repas et objectifs nutrition.

## Decisions

- Garder un dashboard sans React Router, avec onglets Sport et Nutrition.
- Utiliser une couche API dans `client/src/api/` et un store Zustand par domaine.
- Garder le mode bypass compatible pour travailler sans API distante.
- Ajouter la configuration Tailwind minimale manquante cote client.
- Corriger l'update interne des seances pour remplacer exercices et series sans
  changer le contrat HTTP public.

## Todo

- [x] Creer ce plan.
- [x] Ajouter le plan dans l'index.
- [x] Etendre la couche API frontend.
- [x] Ajouter les stores CRUD manquants.
- [x] Remplacer l'ecran principal par le dashboard CRUD.
- [x] Ajouter la configuration Tailwind minimale.
- [x] Corriger la persistance des exercices/series lors de l'edition seance.
- [ ] Lancer les verifications frontend.

## Notes de verification

- `npm run typecheck -w client`: non lance, `npm` absent du PATH dans ce shell.
- `where.exe npm` et `where.exe node`: aucun executable trouve.
- `git diff --check`: OK, aucun whitespace error; avertissements CRLF attendus.
- `rg -n '[ \t]+$' ...`: OK, aucun whitespace final dans les nouveaux fichiers.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\smoke-prod.ps1 -BaseUrl 'https://suivi-sportif.fr'`:
  OK, health/frontend/auth/creations sport+nutrition/nettoyage verts.
