# Plan - Fusion idees seances

## Objectif

- Fusionner les fichiers d'idees en doublon pour le numero 02.
- Garder un seul fichier source pour les idees de seances et exercices.
- Repasser sur toutes les idees pour clarifier les fichiers, les titres et l'index.

## Decisions

- Conserver l'idee de seances dans `docs/06-idees/02-builder-seances.md`.
- Integrer les idees brutes de l'ancien doublon de seances dans le fichier canonique.
- Supprimer le fichier doublon une fois le contenu fusionne.
- Renommer les idees avec une numerotation continue et des noms plus explicites.
- Transformer les fichiers de donnees par defaut en idees documentees.

## Todo

- [x] Creer ce plan.
- [x] Fusionner les contenus des deux fichiers 02.
- [x] Supprimer le doublon.
- [x] Verifier les index et l'etat git.
- [x] Renommer et restructurer tous les fichiers d'idees.
- [x] Verifier la numerotation finale et les liens.

## Notes de verification

- Ajout d'une idee IA annexe dans `docs/06-idees/90-ia-idees.md` pour signaler automatiquement les doublons de fichiers d'idees.
- Verification des doublons numeriques dans `docs/06-idees`: aucun doublon restant.
- Verification par `rg` des references vers le fichier canonique et le plan.
- Verification par `git diff -- docs/06-idees docs/90-plans` et `git status --short`.
- Renommage final des idees: `01-calendrier-suivi`, `02-builder-seances`, `03-builder-repas`, `04-bibliotheque-exercices`, `05-modeles-seances`.
- Verification des anciens noms, anciennes fautes et anciens chemins: aucune reference active restante hors notes de chantier.
