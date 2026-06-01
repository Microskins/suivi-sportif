# Plan - Vague 2 progression sportive

## Objectif

- Rendre le suivi d'entrainement plus intelligent et plus actionnable.
- Donner du sens aux series au-dela du simple historique poids/reps.
- Aider l'utilisateur a progresser exercice par exercice avec des signaux simples.

## Perimetre

- Objectifs par exercice:
  - 1RM estime;
  - 10RM;
  - max reps;
  - objectif de serie type 3x8 a une charge cible.
- Regles de progression:
  - double progression;
  - increment de charge;
  - plage de reps cible.
- RPE / RIR et sensations:
  - effort percu;
  - repetitions en reserve;
  - notes courtes fatigue / douleur / energie.
- Modeles de seances enrichis:
  - etiquettes objectif;
  - duree;
  - materiel;
  - filtres et recherche.
- Historique des revisions de modeles:
  - date;
  - resume;
  - auteur plus tard si roles.

## Hors perimetre

- IA generative de programme complet.
- Coaching medical ou prevention blessure avancee.
- Notifications mobiles.
- Scanner nutrition.

## Decisions

- Reutiliser les objectifs sport deja poses avant d'ajouter un nouveau domaine.
- Stocker RPE/RIR seulement si l'usage UI est clair.
- Afficher les recommandations comme des aides, pas comme des obligations.
- Eviter les automatismes opaques: une regle de progression doit etre lisible.
- Garder chaque ajout testable via API et donnees bypass.

## Sous-chantiers

1. Objectifs de performance avances
   - Completer l'affichage des objectifs par exercice.
   - Ajouter l'objectif de serie cible si necessaire.
   - Afficher la meilleure performance recente et historique.

2. RPE / RIR
   - Ajouter les champs au bon niveau (serie ou exercice).
   - Adapter API, Prisma, store et formulaire.
   - Ajouter une lecture dans l'historique.

3. Regles de progression
   - Definir les types de regles.
   - Calculer le prochain conseil.
   - Afficher "augmenter", "rester", "reduire" avec raison.

4. Modeles enrichis
   - Ajouter les tags et filtres.
   - Ameliorer la selection de modele.
   - Preparer l'historique de revision si utile.

## Todo

- [x] Creer ce plan.
- [ ] Auditer les donnees existantes workouts/objectifs/modeles.
- [ ] Prioriser le premier sous-chantier de la vague.
- [ ] Implementer objectifs de performance avances.
- [ ] Ajouter RPE/RIR si valide.
- [ ] Ajouter les regles de progression.
- [ ] Enrichir les modeles et filtres.
- [ ] Mettre a jour les docs API/UI.
- [ ] Valider typecheck/tests/build pertinents.
- [ ] Pousser la vague avant d'ouvrir la Vague 3.

## Notes de verification

- 2026-06-01: plan cree depuis la roadmap `030-roadmap-idees-ia`.
- 2026-06-01: cette vague ne doit demarrer qu'apres validation de la Vague 1.
