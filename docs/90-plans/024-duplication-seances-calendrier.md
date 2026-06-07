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
- [x] `vitest` client local bloque par version Node/Vitest (`node:util styleText`).
- [x] 2026-06-07: blocage leve via WSL Node 22.12.0; `npm run test -w client -- --run WorkoutsCalendar.test.tsx`: OK, 1 fichier, 3 tests passes.
- [x] 2026-06-07: `npm run test -w client -- --run`: OK apres correction du nettoyage DOM des tests CMP, 3 fichiers, 12 tests passes.
- [x] 2026-06-07: `npm run typecheck -w client`: OK.
- [x] 2026-06-07: `npm run build -w client`: OK; avertissement Vite attendu sur chunk JS > 500 kB; `client/dist/` genere puis supprime apres verification.
