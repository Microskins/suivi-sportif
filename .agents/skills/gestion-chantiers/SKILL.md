---
name: gestion-chantiers
description: Applique obligatoirement la convention de suivi des chantiers du projet Suivi Sportif. Utilise ce skill avant toute implementation, correction, refactor, feature, test, documentation ou changement non trivial dans ce depot, afin de creer ou mettre a jour un plan dans docs/90-plans, l'indexer, suivre sa todo et noter les validations.
---

# Gestion Des Chantiers

Avant tout changement non trivial dans ce depot, appliquer la convention de
`docs/90-plans/README.md`.

## Workflow obligatoire

1. Lire `docs/90-plans/README.md`.
2. Determiner si un plan existant couvre deja le travail.
3. Si aucun plan actif ne couvre le travail, creer
   `docs/90-plans/XXX-nom-du-chantier.md` avec:
   - objectif;
   - decisions;
   - todo list;
   - notes de verification.
4. Ajouter le nouveau plan a l'index de `docs/90-plans/README.md`.
5. Cocher la todo au fil de l'implementation, pas seulement a la fin.
6. Ajouter dans les notes de verification les commandes lancees, les resultats
   et les blocages d'environnement.
7. Si un build genere des artefacts non destines au commit, les supprimer apres
   verification.

## Regles de decision

- Pour une petite reponse sans modification de fichiers, aucun plan n'est requis.
- Pour une modification de code, test, schema, documentation projet ou config,
  utiliser un plan.
- Si le travail continue un plan existant, mettre a jour ce plan plutot que
  creer un doublon.
- Si le comportement public change, mettre a jour les docs sources de verite en
  plus du plan.
- Ne pas marquer une verification comme faite si la commande n'a pas pu etre
  lancee; noter le blocage a la place.

## Format minimal d'un plan

```markdown
# Plan - Nom du chantier

## Objectif

- ...

## Decisions

- ...

## Todo

- [x] Creer ce plan.
- [ ] ...

## Notes de verification

- ...
```
