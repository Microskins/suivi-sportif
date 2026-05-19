# 024 - Duplication de seances depuis le calendrier

## Objectif

Permettre la duplication d'une seance directement depuis la vue calendrier, pour creer une nouvelle seance a partir d'une existante sans tout ressaisir.

## Decisions

- Ajouter un callback `onDuplicate` au composant `WorkoutsCalendar`.
- Ajouter un bouton `Dupliquer` sur chaque carte seance dans le panneau du jour.
- Reutiliser le formulaire `WorkoutForm` avec `prefillWorkout` en mode creation (pas d'update).

## Todo

- [x] Etendre l'interface `WorkoutsCalendarProps` avec `onDuplicate`.
- [x] Ajouter le bouton `Dupliquer` en UI calendrier.
- [x] Brancher `Dashboard` pour ouvrir le formulaire pre-rempli via modal.
- [x] Mettre a jour les tests TS du calendrier (prop obligatoire).

## Verification

- [x] `npm run typecheck -w client` passe.
- [ ] `vitest` client local bloque par version Node/Vitest (`node:util styleText`).
