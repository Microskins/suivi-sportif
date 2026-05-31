# Plan - Onglet profil

## Objectif

- Ajouter un onglet Profil dans l'application pour permettre a l'utilisateur connecte de modifier son email, sa date de naissance et son mot de passe.
- Reutiliser l'endpoint protege `/api/users/me` et le store d'authentification existants.

## Decisions

- L'onglet Profil vit dans le dashboard principal afin de rester accessible apres connexion.
- Le changement de mot de passe reste optionnel et n'est envoye que si un nouveau mot de passe est saisi.
- Le backend refuse le changement vers un email deja utilise par un autre compte.

## Todo

- [x] Creer ce plan.
- [x] Ajouter les idees IA connexes.
- [x] Renforcer l'API profil et ses tests.
- [x] Ajouter l'action profil dans le store auth.
- [x] Creer l'onglet Profil dans le dashboard.
- [x] Lancer les validations utiles et noter les resultats.

## Notes de verification

- Idees IA ajoutees dans `docs/06-idees/90-ia-idees.md`.
- `npm run typecheck -w server` bloque: `npm` n'est pas reconnu dans ce shell.
- `npm run typecheck -w client` bloque: `npm` n'est pas reconnu dans ce shell.
- `npm run test -w server -- --run server/src/routes/api.test.ts` bloque: `npm` n'est pas reconnu dans ce shell.
