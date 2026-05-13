# Plan - Integration bibliotheque exos complete

## Objectif

- Integrer toute la bibliotheque d'exercices proposee dans le seed dev et prod.
- Garantir une description non vide pour chaque exercice seed.

## Decisions

- Source unique: `docs/06-idees/04-bibliotheque-exercices.md`.
- Generation automatique de la liste d'exercices (dedoublonnage par nom).
- Mapping niveau -> difficulty enum, categorie -> exerciseType (`Cardio` => CARDIO, sinon STRENGTH).

## Todo

- [x] Creer ce plan.
- [x] Generer le catalogue seed complet depuis la table docs.
- [x] Injecter le catalogue dans `server/prisma/seed.ts`.
- [x] Injecter le catalogue dans `server/prisma/prod-seed.mjs`.
- [x] Nettoyer les libelles moisis par l'encodage de la table source.
- [ ] Verifier l'execution du seed et pousser.

## Notes de verification

- Le catalogue est passe de 19 a 154 exercices dedoublonnes.
- La source `docs/06-idees/04-bibliotheque-exercices.md` a ete corrigee pour supprimer les artefacts d'encodage principaux.
- Les deux seeds (`seed.ts` et `prod-seed.mjs`) ont ete aligns sur la meme liste avec noms accentues et descriptions detaillees non vides.
- Reste a valider l'execution seed en environnement cible avant push final.
- Point de vigilance: un ecart d'encodage UTF-8 persiste selon les environnements (Windows/Linux, terminal, conteneur) et doit etre reverifie apres pull/deploiement.
- Extension demandee: ajout de filtres dans l'onglet Exercices (recherche texte, type, difficulte) pour exploiter la bibliotheque etendue.
