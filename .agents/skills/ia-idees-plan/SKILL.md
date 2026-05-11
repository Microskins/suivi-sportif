---
name: ia-idees-plan
description: Pendant la creation ou mise a jour d'un plan, chercher des ameliorations complementaires non encore notees et les ajouter dans docs/06-idees/90-ia-idees.md (section datee).
---

# Skill - IA idees pendant creation de plan

Ce skill s'utilise quand un plan (`docs/90-plans/XXX-...`) est en cours de
creation ou de modification et qu'on veut enrichir la liste d'ameliorations
potentielles (non engagees) dans `docs/06-idees/90-ia-idees.md`.

## Objectif

- Produire des idees actionnables sans perturber le chantier en cours.
- Eviter les doublons avec les plans existants et les idees deja notees.

## Entrees attendues

- Le numero/nom du plan en cours (ex: `009-...`).
- Le perimetre (deploy, auth, UX, data, etc.) si le plan est large.

## Workflow

1. Lire le plan en cours et l'index `docs/90-plans/README.md`.
2. Scanner l'existant pour idees et plans proches:
   - `docs/06-idees/` (idees existantes)
   - `docs/90-plans/` (plans proches)
   - `README.md` et docs d'architecture/deploiement selon le perimetre
3. Identifier 3 a 8 ameliorations "a cote" (non indispensables au plan) qui
   pourraient apporter un gain net:
   - perf, DX, securite, observabilite, UX, qualite, tests, ops
4. Dedoublonner:
   - ne pas ajouter si deja present (titre similaire, meme solution)
   - sinon, ajouter en indiquant la reference du plan source
5. Ecrire les idees dans `docs/06-idees/90-ia-idees.md` sous une section datee:
   - titre unique
   - Contexte / Proposition / Impact / Complexite / Liens
6. Mettre a jour `docs/06-idees/README.md` si un nouveau fichier est cree (en
   general on n'en cree pas: on centralise dans `90-ia-idees.md`).

## Heuristiques (checklist)

- Plan "deploiement/CI":
  - cache buildx persistant, cache registry/gha, paths filters, telemetry logs
  - rollback, healthchecks durables, alerting
- Plan "API":
  - ownership, pagination, erreurs standardisees, rate limit, audit log
- Plan "frontend":
  - loading states, offline/errors, accessibilite, perf bundle, tests e2e
- Plan "DB":
  - index, contraintes, migrations safe, sauvegarde/restore documentes

## Definition of done

- `docs/06-idees/90-ia-idees.md` enrichi avec une section datee et des idees non
  redondantes.
- Une note dans le plan (Notes de verification) mentionne l'ajout des idees.

