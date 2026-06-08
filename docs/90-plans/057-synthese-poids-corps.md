# Plan - Synthese poids corporel

## Objectif

- Ajouter dans la synthese du dashboard un resume du poids corporel issu des mensurations.
- Donner un acces rapide aux donnees corporelles sans ouvrir l'onglet Mensurations.
- Reutiliser les donnees existantes sans ajouter de nouvelle persistance.

## Decisions

- Utiliser la derniere mesure avec `weightKg` renseigne comme source principale.
- Afficher le poids courant, la variation par rapport a la mesure precedente et la date de derniere pesee.
- Ajouter un raccourci vers l'onglet Mensurations pour completer ou creer une nouvelle mesure.
- Ne pas ajouter de nouvel endpoint ni de nouvelle table: tout reste derive de `bodyMeasurements`.
- Si aucune pesee n'existe, afficher un etat vide explicite dans la synthese.

## Todo

- [x] Creer ce plan.
- [x] Brancher les mensurations au composant de synthese.
- [x] Ajouter la carte poids corporel et les etats vides/variation.
- [x] Ajouter le raccourci de saisie vers les mensurations depuis la synthese.
- [x] Ajouter une couverture de test frontend pour le resume poids.
- [x] Mettre a jour les notes de validation et les idees voisines.

## Notes de verification

- 2026-06-08: idee complementaire ajoutee dans `docs/06-idees/90-ia-idees.md` pour l'anciennete de la pesee, la comparaison a un objectif corps et le raccourci contextuel.
- 2026-06-08: `npm run typecheck -w client` indisponible dans ce shell car `npm` n'est pas present dans le PATH PowerShell; verification remplacee par l'API TypeScript du projet, qui retourne 0 diagnostic.
- 2026-06-08: rendu serveur du composant `DashboardOverview` verifie via `react-dom/server`: carte `Poids corporel`, valeur actuelle, delta et raccourci rapide visibles dans le markup.
