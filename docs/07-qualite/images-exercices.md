# Controle qualite des images d'exercices

## Objectif

Suivre la presence et la revue des images referencees par la bibliotheque
d'exercices.

## Verification du 2026-06-01

- Source: `client/public/sites/suivi-sportif/exercises/exercices.json`
- Exercices declares: 163
- Images referencees: 163
- Images PNG presentes dans
  `client/public/sites/suivi-sportif/exercises/images`: 63
- Images referencees absentes: 100
- Statut global: `A_COMPLETER`

## Echantillon d'images absentes

- `images/abduction-hanche-machine.png`
- `images/ab-wheel-rollout.png`
- `images/assault-bike.png`
- `images/barre-au-front.png`
- `images/battle-rope.png`
- `images/bear-crawl.png`
- `images/burpees-cardio-hiit.png`
- `images/burpees-full-body-fonctionnel.png`
- `images/clean-and-press.png`
- `images/corde-a-sauter.png`
- `images/course-tapis.png`
- `images/crunch.png`

## Statuts de revue

- `A_COMPLETER`: asset reference absent ou non genere.
- `A_REVOIR`: asset present mais posture, texte ou rendu a verifier.
- `VALIDE`: asset present et controle visuel accepte.
- `REGENERATION`: asset rejete et a regenerer.

## Regles

- Une image referencee doit exister dans le dossier public avant validation de
  l'exercice.
- Les pages publiques ne doivent pas transformer un asset absent en faux `200`
  HTML.
- Les images IA doivent rester pedagogiques et ne pas etre presentees comme un
  avis medical.
