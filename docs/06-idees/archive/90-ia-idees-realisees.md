# IA Idees realisees

Idees proposees par l'IA puis archivees apres realisation.

---

## 2026-05-12 - Conformite cookies: mode policy-version

## Contexte

- Une CMP frontend peut devenir obsolete quand la politique legale evolue.
- Sans versionning explicite, le consentement stocke est difficile a invalider proprement.

## Proposition

- Versionner la politique cookies (ex: date ISO) dans l'objet de consentement.
- Re-afficher la banniere automatiquement quand la version change.
- Garder un journal minimal des changements de version dans la doc legale.

## Impact

- Conformite plus robuste dans le temps.
- Moins de risques d'utiliser un ancien consentement sur de nouvelles finalites.

## Complexite

- S

## Liens

- Plan: docs/90-plans/017-cmp-cookies-frontend.md

## Archive

- Archivee le 2026-06-07.
- Realisation verifiee dans `client/src/consent/consentManager.ts`: version de politique, rejet des consentements obsoletes et tests associes.

---

## 2026-05-12 - Calendrier: score de regularite hebdo

## Contexte

- Le calendrier montre les seances, mais la progression de regularite n'est pas explicite.

## Proposition

- Ajouter un score hebdomadaire simple dans la vue calendrier:
  - nombre de seances realisees / objectif cible;
  - jauge visuelle sur la semaine courante.
- Conserver la logique de statut (`PLANNED`, `COMPLETED`, `CANCELED`) comme source de verite.

## Impact

- Feedback motivant immediat sur la constance.
- Facilite la lecture "planifie vs realise" sans ouvrir chaque jour.

## Complexite

- S

## Liens

- Plan: docs/90-plans/018-calendrier-suivi-statut-seances.md

## Archive

- Archivee le 2026-06-07.
- Realisation verifiee dans `client/src/components/WorkoutsCalendar.tsx`: calcul `weeklyCompleted`, objectif hebdomadaire actif et progression visuelle.
