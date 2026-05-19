# Plan - Reordonner les exercices dans seances et modeles

## Objectif

- Permettre de deplacer l'ordre des exercices dans une seance.
- Permettre de deplacer l'ordre des exercices dans un modele.

## Decisions

- Ajout de controles UI "Monter"/"Descendre" par exercice.
- Ajout du drag-and-drop natif HTML5 pour reordonner les exercices.
- Le backend reste inchange: l'ordre est derive de la position dans le tableau envoye.
- Aucun drag-and-drop en v1 (boutons explicites uniquement).

## Todo

- [x] Creer ce plan.
- [x] Ajouter les controles de reordonnancement dans le formulaire de seance.
- [x] Ajouter les controles de reordonnancement dans le formulaire de modele.
- [x] Verifier la coherence visuelle et les cas limite (premier/dernier element).
- [x] Noter les verifications.

## Notes de verification

- Verification manuelle du code:
  - boutons `Monter` desactives en premiere position;
  - boutons `Descendre` desactives en derniere position;
  - drag-and-drop actif sur les lignes d'exercices (seance + modele);
  - l'ordre envoye reste derive de la position du tableau (`order: index`) lors du submit.
- Verifications automatiques non lancees ici (npm indisponible dans ce shell local).
