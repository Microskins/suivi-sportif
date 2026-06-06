# Plan - Suppression des popups exercices et repas

## Objectif

- Retirer les popups de creation pour les exercices et les repas.
- Rendre les filtres visibles et utilisables en continu pour faciliter le tri par marque, muscle cible, type ou difficulte.
- Verifier s'il reste des popups utiles apres la refonte et les documenter.

## Decisions

- Conserver le dashboard comme point d'entree principal, mais remplacer les modales de creation par des panneaux inline ou sections permanentes.
- Garder les filtres exercice existants et les rendre plus visibles dans le flux de creation.
- Pour les repas, privilegier une creation directe dans la page avec recherche et filtres persistants sur les aliments.
- Ne pas supprimer les popups qui servent a une confirmation destructive tant qu'elles apportent une vraie valeur.

## Todo

- [x] Creer ce plan.
- [x] Ajouter le plan a l'index `docs/90-plans/README.md`.
- [x] Ajouter des idees adjacentes dans `docs/06-idees/90-ia-idees.md`.
- [x] Refaire le flux de creation des exercices sans popup.
- [x] Refaire le flux de creation des repas sans popup.
- [x] Repasser sur l'application pour lister les popups restantes et trier celles qui doivent rester.
- [x] Lancer les tests front pertinents et noter le resultat.

## Notes de verification

- 2026-06-03: refonte inline des repas et ajout de filtres persistants pour les aliments; les exercices restent inline avec filtre par zone cible ajoute.
- 2026-06-03: audit code source: il reste des popups de type `Modal` pour les seances, les aliments et les objectifs, plus les confirmations natives `window.confirm` pour les suppressions.
- 2026-06-03: verification locale bloquee pour `npm run typecheck -w client` car `npm` n'est pas disponible dans l'environnement courant.
- 2026-06-03: `git diff --check` lance avec succes.
- 2026-06-03: `.\node_modules\.bin\tsc --noEmit -p client\tsconfig.json` lance via PowerShell : OK.
- 2026-06-03: `.\node_modules\.bin\vitest --run client\src\components\CookieConsentLayer.test.tsx client\src\components\WorkoutsCalendar.test.tsx client\src\consent\consentManager.test.ts` lance via PowerShell : OK.
