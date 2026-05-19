# 023 - Duplication de seances

## Objectif

Permettre de dupliquer rapidement une seance existante pour choisir une nouvelle date et ajuster les exercices sans tout ressaisir.

## Decisions

- UI: ajouter une action `Dupliquer` dans la liste des seances.
- UX: la duplication ouvre le formulaire en mode creation pre-rempli avec les donnees de la seance source.
- Compatibilite: aucune modification API/DB, uniquement frontend.

## Todo

- [x] Ajouter le bouton `Dupliquer` dans la liste des seances.
- [x] Ajouter un etat frontend de pre-remplissage distinct de l'edition.
- [x] Reutiliser `WorkoutForm` pour pre-remplir les champs et creer une nouvelle seance.

## Verification

- [x] Depuis la liste des seances, cliquer `Dupliquer` ouvre le formulaire avec les champs existants.
- [x] La soumission cree une nouvelle seance (et ne modifie pas la seance source).
