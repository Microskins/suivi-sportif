# Plan - Repos conseilles builder

## Objectif

- Ajouter des repos conseilles automatiques dans le builder de seances.
- Pre-remplir les nouvelles lignes/series avec un repos coherent selon l'exercice.
- Permettre d'appliquer rapidement le repos conseille sans changer le schema API.

## Decisions

- Rester cote frontend: les champs `rest` existent deja dans les seances et modeles.
- Calculer une recommandation simple depuis `exerciseType`, `difficulty` et les zones corporelles.
- Ne pas modifier automatiquement les repos deja saisis lors d'un changement d'exercice; proposer une action explicite.
- Appliquer aussi la suggestion aux modeles de seances, pour garder une experience coherente.

## Todo

- [x] Creer ce plan.
- [x] Ajouter les helpers de repos conseille.
- [x] Brancher les repos conseilles dans le formulaire de seance.
- [x] Brancher les repos conseilles dans le formulaire de modele.
- [x] Mettre a jour les idees builder.
- [x] Lancer les validations et noter les resultats.

## Notes de verification

- 2026-06-07: chantier ouvert depuis l'idee `Builder de seances`.
- 2026-06-07: helpers ajoutes dans `workoutFormUtils.ts`: repos cardio 60s, mobilite 45s, gainage/abdos 45s, musculation debutant 60s, intermediaire 90s, avance 120s.
- 2026-06-07: formulaire de seance: nouvelles lignes/series pre-remplies avec le repos conseille et bouton d'application aux series existantes.
- 2026-06-07: formulaire de modele: lignes par defaut et action rapide de repos conseille alignees sur le meme helper.
- 2026-06-07: `npm run typecheck -w client` via WSL Node 22.12.0: OK.
- 2026-06-07: `npm run test -w client -- --run` via WSL Node 22.12.0: OK, 3 fichiers, 12 tests passes.
- 2026-06-07: `npm run build -w client` via WSL Node 22.12.0: OK; avertissement Vite attendu sur chunk JS > 500 kB; `client/dist/` genere puis supprime apres verification.
- 2026-06-07: `npm run lint -w client` via WSL bloque par la configuration ESLint actuelle: ESLint 10 attend `eslint.config.js`, absent du repo.
