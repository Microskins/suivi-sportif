# IA Idees

## 1) Modeles: templates de seances

## Contexte

- Beaucoup de seances reviennent (full body, push/pull/legs, etc.).
- Recomposer les memes blocs prend du temps.

## Proposition

- Ajouter des "templates" de seances:
  - creer un template depuis une seance existante;
  - instancier un template en seance planifiee (ou en brouillon).
- Option: versionner un template (v1, v2) et garder l'historique.

## Impact

- Gain de temps important sur la creation.
- Standardisation de la structure.

## Complexite

- M

## Liens

- Plan: docs/90-plans/XXX-... (quand ce sera actee)

---

## 2026-05-11 - Mobile: Capacitor checklist pre-release

## Contexte

- Une app mobile "wrappee" peut marcher en dev mais casser a la publication (signing, deep links, storage, network).

## Proposition

- Ajouter une checklist pre-release mobile:
  - mode offline (assets embarques) + ecran d'erreur reseau;
  - token storage (Preferences/secure storage) + expiration;
  - base URL API selon env + blocage du "localhost" en prod;
  - verification HTTPS (mixed content) + config CORS;
  - analytics/logging minimal pour diagnostiquer en prod.

## Impact

- Moins de surprises au moment de la publication.
- Diagnostic plus rapide quand un device reel a un comportement different.

## Complexite

- S

## Liens

- Plan: docs/90-plans/089-mobile-capacitor.md

---

## 2026-05-11 - Docs: controle des doublons d'idees

## Contexte

- Les idees sont numerotees par fichier.
- Un doublon de numero peut cacher des propositions non indexees ou dispersees.

## Proposition

- Ajouter une verification simple de documentation qui signale:
  - deux fichiers avec le meme prefixe numerique dans `docs/06-idees`;
  - un fichier d'idee absent de l'index;
  - un lien d'index vers un fichier inexistant.

## Impact

- Moins de perte d'idees.
- Nettoyage plus rapide avant de transformer une idee en chantier.

## Complexite

- S

## Liens

- Plan: docs/90-plans/014-fusion-idees-seances.md

---

## 2) Progression: PRs et objectifs par exercice

## Contexte

- La progression (poids/reps) est le coeur du suivi.
- Sans objectif, on ne sait pas si une seance est "bonne" ou "mauvaise".

## Proposition

- Par exercice, definir:
  - un objectif (ex: 3x8 a 80kg) et/ou une plage (ex: 6-10 reps);
  - une regle de progression (double progression, +2.5kg, etc.).
- Afficher un indicateur simple dans la seance (atteint / en dessous / au dessus).

## Impact

- Donne du sens aux donnees.
- Encourage la constance.

## Complexite

- L

## Liens

- Plan: docs/90-plans/XXX-... (quand ce sera actee)

---

## 3) Qualite: RPE / RIR et sensations

## Contexte

- Deux seances identiques sur le papier peuvent etre tres differentes en fatigue.

## Proposition

- Ajouter a la serie ou a l'exercice:
  - RPE (1-10) ou RIR (0-5);
  - note libre courte ("douleur epaule", "bonne energie").
- Exploiter ca dans les stats (ex: charge vs RPE).

## Impact

- Suivi plus intelligent (fatigue, deload, blessure).

## Complexite

- M

## Liens

- Plan: docs/90-plans/XXX-... (quand ce sera actee)

---

## 4) Nutrition: scanner code-barres (plus tard)

## Contexte

- Ajouter des aliments manuellement est long et repetitif.

## Proposition

- Ajouter un mode "scanner" (mobile) pour rechercher un aliment par code-barres.
- Stocker les aliments frequents et permettre des favoris.

## Impact

- UX nutrition nettement meilleure.

## Complexite

- L

## Liens

- Plan: docs/90-plans/XXX-... (quand ce sera actee)

---

## 2026-05-11 - Modeles: etiquettes et recherche rapide

## Contexte

- Les premiers modeles de seances vont couvrir quelques cas simples.
- Quand la bibliotheque grandira, une liste brute deviendra moins pratique.

## Proposition

- Ajouter des etiquettes aux modeles:
  - objectif principal (force, cardio, hypertrophie, reprise);
  - duree courte / moyenne / longue;
  - materiel requis.
- Ajouter une recherche et des filtres dans la modale de choix de modele.

## Impact

- Selection plus rapide du bon modele.
- Meilleure extensibilite quand on ajoutera plus de seances preconstruites.

## Complexite

- M

## Liens

- Plan: docs/90-plans/015-modeles-seances-defaut.md

---

## 2026-05-12 - Conformite cookies: mode policy-version

## Contexte

- Une CMP frontend peut devenir obsolète quand la politique legale evolue.
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
