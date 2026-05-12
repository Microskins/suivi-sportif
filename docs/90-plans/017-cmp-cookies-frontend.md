# Plan - CMP cookies frontend

## Objectif

- Ajouter une CMP complete cote frontend avec consentement versionne.
- Afficher une banniere cookies, un panneau de preferences et un lien persistant de gestion.
- Ajouter une page politique cookies et preparer le gating pour les scripts non necessaires.

## Decisions

- Stockage du consentement dans `localStorage` sous une cle versionnee.
- Categories: `necessary` (toujours true), `analytics`, `marketing`.
- Aucun tracker analytics branche dans cette iteration.
- Exposition d'un service `consentManager` et d'un store UI pour `openConsentPreferences`.

## Todo

- [x] Creer ce plan.
- [x] Implementer le modele/types de consentement et le manager.
- [x] Implementer le store UI de consentement.
- [x] Integrer la banniere + panneau de preferences + lien persistant.
- [x] Ajouter la page politique cookies et les liens associes.
- [x] Ajouter les tests unitaires/composants du flux CMP.
- [x] Lancer les verifications et noter les resultats.

## Notes de verification

- Commandes tentees:
  - `npm run typecheck -w client`
  - `npm run test -w client -- --run src/consent/consentManager.test.ts src/components/CookieConsentLayer.test.tsx`
- Resultat: non executees dans cet environnement local car `npm` est indisponible dans le shell courant (`CommandNotFoundException`).
- Verification manuelle de coherence: le flux CMP couvre banniere initiale, accept/refuse/personnaliser, reouverture des preferences et page politique cookies.
