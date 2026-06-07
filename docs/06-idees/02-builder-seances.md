# Builder de seances

## Statut

- Partielle: plusieurs fondations sont livrees, mais l'idee contient encore des
  prolongements utiles.

## Contexte

- Construire une seance peut etre repetitif si on doit recreer la liste d'exercices a chaque fois.
- Pour certains exercices, un rappel visuel (video) aide a garder une bonne execution.

## Deja fait

- Modeles de seances preconstruits et instanciables.
- Edition des modeles de seances.
- Reordonnancement des exercices dans une seance et dans un modele, avec drag-and-drop natif.
- Champs de repos par serie dans les seances et modeles.
- Filtres/recherche pour trouver plus vite un exercice dans le formulaire de seance.
- Images d'exercices affichees dans l'UI quand l'asset existe.

## Reste a faire

- Dans l'editeur de seance:
  - permettre le drag and drop d'un exercice depuis une bibliotheque/listing vers la seance;
- Sur la fiche exercice:
  - ajouter un ou plusieurs liens YouTube (ou autres) vers des tutoriels;
  - afficher un bouton "ouvrir le tuto" depuis l'editeur de seance.
- Dans la structure d'une seance:
  - pre-remplir un temps de repos conseille selon le type d'exercice;
  - ajouter des blocs d'echauffement;
  - proposer un mode Tabata pour les seances ou blocs chronometres.

## Regles de repos par defaut

| Type | Repos conseille |
| --- | ---: |
| Cardio leger | 60 sec |
| HIIT | 20 a 30 sec |
| Abdos / gainage | 30 a 45 sec |
| Exercice isolation muscu | 45 a 60 sec |
| Exercice polyarticulaire muscu | 90 a 150 sec |
| Force lourde | 120 a 180 sec |

## Impact

- Creation de seances plus rapide.
- Moins d'erreurs (execution plus simple a verifier).

## Complexite

- M

## Liens

- Plan: docs/90-plans/014-fusion-idees-seances.md
- Plan: docs/90-plans/015-modeles-seances-defaut.md
- Plan: docs/90-plans/020-edition-modeles-seances.md
- Plan: docs/90-plans/022-reordonner-exercices-seances-modeles.md
- Plan: docs/90-plans/026-images-exercices-ui.md
- Plan: docs/90-plans/097-tri-idees-builder.md
