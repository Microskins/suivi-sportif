# Plan - Skill gestion chantiers

## Objectif

Rendre obligatoire et reutilisable la convention de suivi des chantiers du
projet:

- creation ou reutilisation d'un plan dans `docs/90-plans`;
- ajout du plan dans l'index;
- suivi de la todo pendant l'implementation;
- notes de verification explicites.

## Decisions

- Le skill est un skill projet, stocke dans `.agents/skills/gestion-chantiers`.
- Le skill s'applique a tout changement non trivial dans ce depot.
- Aucun script ou asset n'est necessaire.
- `python` n'est pas disponible dans le shell local; le template du skill est
  donc cree manuellement au lieu d'utiliser `init_skill.py`.

## Todo

- [x] Creer ce plan.
- [x] Ajouter le plan dans `docs/90-plans/README.md`.
- [x] Creer le skill `.agents/skills/gestion-chantiers/SKILL.md`.
- [x] Verifier le contenu du skill.
- [x] Noter les limites de validation.

## Notes de verification

- Le skill doit contenir un frontmatter YAML avec `name` et `description`.
- Le workflow doit demander explicitement de lire `docs/90-plans/README.md`.
- Le workflow doit imposer creation/indexation/todo/notes de verification pour
  les changements non triviaux.
- Verification statique faite par lecture du `SKILL.md` et recherche `rg`.
- `python` n'est pas disponible; `quick_validate.py` n'a pas pu etre lance.
