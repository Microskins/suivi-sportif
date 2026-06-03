# Plan - Unites aliments g ou unite

## Objectif

- Autoriser les aliments a etre declares soit en grammes (`g`), soit en unite entiere (`unit`) pour couvrir des cas comme `1 oeuf`.
- Aligner le schema Prisma, les validations API et les tests sur cette regle.

## Decisions

- Restreindre `servingUnit` a une valeur fermee plutot qu'a une chaine libre.
- Conserver `g` comme valeur par defaut pour ne pas casser les aliments existants.
- Utiliser `unit` pour les aliments comptes a l'unite, sans changer le format des macros qui restent en valeurs numeriques.

## Todo

- [x] Creer ce plan.
- [x] Auditer les usages de `servingUnit` dans le schema, les routes et les tests.
- [x] Introduire une contrainte forte sur `servingUnit` dans Prisma et Zod.
- [x] Mettre a jour les tests concernes.
- [ ] Verifier le typecheck ou les tests du serveur si disponibles.

## Notes de verification

- A completer pendant l'implementation.
- 2026-06-03: contrainte appliquee via Zod, schema Prisma et migration SQL `foods_serving_unit_check`.
- 2026-06-03: verification locale bloquee, `npm` n'est pas disponible dans le PATH PowerShell de l'environnement.
