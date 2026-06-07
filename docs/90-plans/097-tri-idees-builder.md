# Plan - Tri des idees builder

## Objectif

- Clarifier les idees `Builder de seances` et `Builder de repas`.
- Distinguer les parties deja livrees des prolongements encore utiles.
- Eviter d'archiver trop tot des idees qui restent partiellement actionnables.

## Decisions

- Garder les deux idees builder dans l'index actif.
- Ajouter un statut partiel explicite dans chaque idee.
- Lier chaque partie livree aux plans deja termines.
- Reporter les restes non livres comme pistes futures, sans ouvrir de chantier technique maintenant.

## Todo

- [x] Creer ce plan.
- [x] Auditer les plans et composants lies aux builders.
- [x] Mettre a jour `02-builder-seances.md`.
- [x] Mettre a jour `03-builder-repas.md`.
- [x] Ajouter une idee complementaire IA si besoin.
- [x] Noter les validations.

## Notes de verification

- 2026-06-07: branche dediee creee depuis `main`: `codex/tri-idees-builder`.
- 2026-06-07: audit builder seances: modeles, edition de modeles, reordonnancement drag-and-drop, repos par serie, filtres exercices et images UI sont deja couverts par des plans existants.
- 2026-06-07: audit builder repas: recherche aliments, reutilisation quantites, portions recentes, recap macros, duplication et comparaison aux objectifs sont couverts par la Vague 3 nutrition.
- 2026-06-07: idee complementaire ajoutee dans `docs/06-idees/90-ia-idees.md` pour decouper les restes builder en micro-chantiers.
- 2026-06-07: controle des liens des fichiers modifies: liens ajoutes OK; seuls les placeholders historiques `docs/90-plans/XXX-...` de `90-ia-idees.md` ressortent.
- 2026-06-07: `git diff --check`: OK.
