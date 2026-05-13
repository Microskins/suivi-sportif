# Plan - Edition modeles de seances

## Objectif

- Permettre la modification d'un modele de seance existant.
- Exposer une route API dediee a l'update des modeles.
- Integrer la mise a jour cote client (store + API + ecran de selection).

## Decisions

- Le chantier complete le plan `015-modeles-seances-defaut.md` sans changer le principe de modeles globaux.
- L'update API se fait via `PUT /api/workout-templates/:id`.
- Si la liste des exercices est fournie, elle remplace integralement les exercices du modele.
- Le frontend conserve un seul composant de gestion des modeles avec un mode edition.

## Todo

- [x] Creer ce plan.
- [x] Ajouter l'idee IA complementaire liee au chantier.
- [x] Ajouter schema/query/route backend pour modifier un modele.
- [x] Ajouter les tests API Fastify pour le `PUT /api/workout-templates/:id`.
- [x] Integrer la mise a jour dans le client (API/store/UI).
- [x] Mettre a jour la documentation API.
- [x] Lancer les verifications et noter les resultats.

## Notes de verification

- Idee IA ajoutee dans `docs/06-idees/90-ia-idees.md` (section datee 2026-05-13).
- Commandes lancees (bloquees par environnement):
  - `npm run test -w server -- --run server/src/routes/api.test.ts`
  - `npm run typecheck -w server`
  - `npm run typecheck -w client`
- Resultat: `npm` introuvable dans la session PowerShell (`CommandNotFoundException`), verification locale non executable sans Node/npm disponible dans le PATH.
