# Plan - Vague 1 feedback et motivation

## Objectif

- Donner un retour visuel et actionnable sur les donnees deja saisies.
- Rendre les mensurations, objectifs et seances plus motivants au quotidien.
- Livrer une premiere vague complete avant de demarrer la progression sportive avancee.

## Perimetre

- Graphiques corporels:
  - poids;
  - IMC;
  - masse grasse;
  - taille abdominale;
  - evolution 30j / 90j / 1 an.
- Interpretation corporelle:
  - zone IMC;
  - lecture simple de la masse grasse;
  - estimation maintien / deficit / surplus depuis la depense journaliere estimee.
- Objectifs:
  - statut plus clair;
  - projection de tendance quand assez de donnees existent;
  - alerte visuelle avant echeance.
- Calendrier:
  - score de regularite hebdomadaire;
  - comparaison seances realisees vs cible.

## Hors perimetre

- RPE / RIR.
- Regles de progression automatiques par exercice.
- Scanner code-barres.
- Mobile Capacitor.
- Notifications push natives.

## Decisions

- Utiliser les donnees existantes avant d'ajouter de nouveaux champs.
- Calculer les indicateurs cote frontend tant que les calculs restent derives et simples.
- Ne pas presenter les interpretations corporelles comme des diagnostics medicaux.
- Garder les graphiques lisibles sur mobile avant d'ajouter des vues complexes.
- Si une fonctionnalite demande une nouvelle persistance, ouvrir un sous-plan dedie avant implementation.

## Sous-chantiers

1. Graphiques corporels
   - Reutiliser `bodyMeasurements`.
   - Ajouter des courbes Recharts dans l'onglet mensurations ou objectifs corps.
   - Ajouter les periodes 30j / 90j / 1 an.

2. Interpretation corporelle
   - Ajouter des fonctions de classification IMC.
   - Ajouter une lecture prudente du pourcentage de masse grasse.
   - Afficher maintien / deficit leger / surplus leger depuis la depense estimee.

3. Objectifs et projections
   - Afficher tendance actuelle vs cible.
   - Signaler les objectifs proches de l'echeance.
   - Afficher un message si les donnees sont insuffisantes.

4. Score hebdomadaire calendrier
   - Compter les seances realisees de la semaine.
   - Comparer a l'objectif sport `SPORT_WORKOUTS_PER_WEEK` actif si disponible.
   - Afficher une jauge simple dans le calendrier ou la synthese.

## Todo

- [x] Creer ce plan.
- [x] Concevoir les helpers de calcul (tendance, zones, periodes).
- [x] Ajouter les graphiques corporels.
- [x] Ajouter l'interpretation corporelle.
- [x] Ajouter les projections et alertes d'objectifs.
- [x] Ajouter le score de regularite hebdomadaire.
- [x] Mettre a jour les docs si le comportement public change.
- [x] Valider les controles disponibles et documenter les blocages.

## Notes de verification

- 2026-06-01: plan Vague 1 cree depuis la roadmap `030-roadmap-idees-ia`.
- 2026-06-01: ajout frontend des tendances corporelles 30j/90j/1 an, interpretation IMC/masse grasse/calories, projections d'objectifs et score hebdo.
- 2026-06-01: correction du score hebdomadaire calendrier avec une borne de fin de semaine exclusive.
- 2026-06-01: aucun changement API; pas de doc API a mettre a jour pour cette vague.
- 2026-06-01: `git diff --check` : OK.
- 2026-06-01: `npm run typecheck -w client` bloque localement: `npm` absent du PATH PowerShell.
- 2026-06-03: nettoyage de suivi: retrait des todos doublonnes non coches qui contredisaient les items deja livres et valides avec blocage documente.
