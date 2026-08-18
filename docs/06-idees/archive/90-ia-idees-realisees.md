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

---

## 2026-08-17 - Prix alimentaires: impression du ticket comparatif

## Contexte

- La direction artistique Ticket de caisse se prete a une version papier ou PDF
  compacte utilisable pendant les courses.

## Proposition

- Ajouter une feuille `@media print` qui masque la navigation et imprime
  uniquement la recherche, la date, les magasins et les lignes de prix.
- Conserver les mentions de prix indicatifs et les sources dans le pied du recu.

## Impact

- Comparatif transportable sans connexion et coherence forte avec la DA.

## Complexite

- S

## Liens

- Plan initial: docs/90-plans/072-comparateur-prix-aliments.md
- Plan de realisation: docs/90-plans/073-idees-ia-ticket-comparateur.md

## Archive

- Archivee le 2026-08-18.
- Realisation verifiee avec la vue media print, le resume, les sources et les
  controles Playwright dedies.

---

## 2026-08-17 - Prix alimentaires: recherche partageable par URL

## Contexte

- Une recherche filtree n'est actuellement conservee que dans le store Zustand
  de la page.

## Proposition

- Synchroniser le terme, la categorie et la zone avec des parametres d'URL.
- Generer un numero de ticket stable a partir de ces parametres pour partager ou
  retrouver exactement le meme comparatif.

## Impact

- Partage simple d'une comparaison sans capture d'ecran ni ressaisie.

## Complexite

- M

## Liens

- Plan initial: docs/90-plans/072-comparateur-prix-aliments.md
- Plan de realisation: docs/90-plans/073-idees-ia-ticket-comparateur.md

## Archive

- Archivee le 2026-08-18.
- Realisation verifiee avec les parametres zone, q et categorie, la restauration
  Zustand, la copie de l'URL et le numero stable du ticket.

---

## 2026-08-17 - Prix alimentaires: meilleur prix lisible en monochrome

## Contexte

- Le vert est reserve au meilleur prix, mais la couleur peut disparaitre a
  l'impression ou etre mal percue par certains utilisateurs.

## Proposition

- Tester le ticket en niveaux de gris et avec des simulations de daltonisme.
- Conserver simultanement l'etoile, le libelle, la bordure double et la position
  de la ligne afin que le statut ne depende jamais de la seule couleur.

## Impact

- Signal de meilleure offre robuste sur ecran, en impression et pour
  l'accessibilite.

## Complexite

- S

## Liens

- Plan initial: docs/90-plans/072-comparateur-prix-aliments.md
- Plan de realisation: docs/90-plans/073-idees-ia-ticket-comparateur.md

## Archive

- Archivee le 2026-08-18.
- Realisation verifiee en media print: texte et bordure noirs, etoile, libelle,
  premiere position et double bordure conserves.

---

## 2026-08-18 - Prix alimentaires: partage natif sur mobile

## Contexte

- Le ticket partageable doit utiliser les fonctions du telephone sans perdre un
  repli fiable sur desktop.

## Proposition

- Utiliser Web Share lorsque disponible et copier l'URL dans le presse-papiers
  lorsque l'API est absente ou echoue.

## Impact

- Partage direct vers les contacts et applications mobiles.

## Complexite

- S

## Liens

- Plan de realisation: docs/90-plans/073-idees-ia-ticket-comparateur.md

## Archive

- Archivee le 2026-08-18.
- Realisation verifiee par tests composants pour Web Share et le repli desktop.

---

## 2026-08-18 - Prix alimentaires: QR code du ticket imprime

## Contexte

- Le papier doit permettre de rouvrir le comparatif sans ressaisir les filtres.

## Proposition

- Generer localement un QR code SVG depuis l'URL partageable et l'afficher dans
  la vue d'impression avec une zone calme suffisante.

## Impact

- Passage immediat du ticket papier au comparateur interactif.

## Complexite

- M

## Liens

- Plan de realisation: docs/90-plans/073-idees-ia-ticket-comparateur.md

## Archive

- Archivee le 2026-08-18.
- Realisation verifiee avec qrcode 1.5.4, tests composants et controle visuel
  Playwright en media print.

---

## 2026-08-18 - Prix alimentaires: regression visuelle ecran et impression

## Contexte

- Les rendus desktop, mobile et print ont des contraintes et contenus differents.

## Proposition

- Ajouter des controles Playwright qui capturent les trois rendus et verifient
  dimensions, visibilite, QR code et signal monochrome.

## Impact

- Regressions de mise en page detectees avant publication.

## Complexite

- M

## Liens

- Plan de realisation: docs/90-plans/073-idees-ia-ticket-comparateur.md

## Archive

- Archivee le 2026-08-18.
- Realisation verifiee par 3 tests Playwright executables via `test:e2e`.
