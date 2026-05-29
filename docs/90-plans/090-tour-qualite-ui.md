# Plan - Tour qualite UI

## Objectif

- Ameliorer la lisibilite et l'ergonomie des ecrans principaux sans refonte fonctionnelle.
- Rendre les actions, etats actifs, listes et calendriers plus faciles a scanner sur desktop et mobile.
- Valider le frontend avec typecheck et build.

## Decisions

- Garder une interface de type outil operationnel: dense, calme, claire.
- Prioriser les ajustements transverses dans `Dashboard`, `DashboardOverview` et `WorkoutsCalendar`.
- Eviter les nouvelles dependances et rester en TailwindCSS.

## Todo

- [x] Creer ce plan.
- [x] Ajouter les idees IA liees a ce chantier.
- [x] Auditer les ecrans principaux et definir les retouches ciblees.
- [x] Ameliorer la navigation, les etats actifs et les groupes d'actions.
- [x] Ameliorer la lisibilite des listes/formulaires/calendrier.
- [x] Verifier le typage et le build frontend.
- [x] Nettoyer les artefacts de build non destines au commit.

## Notes de verification

- 2026-05-29: chantier ouvert pour un tour qualite UI apres validation du build frontend avec Node 22.12.0.
- 2026-05-29: idee IA ajoutee dans `docs/06-idees/90-ia-idees.md` pour un audit accessibilite et parcours critiques.
- 2026-05-29: audit rapide cible sur `Dashboard`, `DashboardOverview` et `WorkoutsCalendar`; retouches retenues: navigation/etat actif, actions de vue, cartes de liste, calendrier mobile/desktop.
- 2026-05-29: `Dashboard` ajuste: boutons avec focus visible, sous-vues en etat actif, navigation laterale sticky desktop, cartes de liste homogenes.
- 2026-05-29: `ExercisesList` corrige pour ne plus appeler les hooks apres un retour conditionnel quand la liste est vide.
- 2026-05-29: `WorkoutsCalendar` ajuste pour le mobile: grille calendarisee dans un scroll horizontal contenu, en-tete repliable, pas de debordement de page.
- 2026-05-29: `npm run typecheck -w client` via WSL : OK.
- 2026-05-29: `npm run build -w client` via WSL : OK; `client/dist/` genere puis supprime.
- 2026-05-29: verification Playwright locale sur `http://localhost:5173/` en mode bypass: navigation Dashboard -> Calendrier -> Seances -> Creer une seance -> Exercices -> Calendrier mobile OK, largeur document mobile 390/390.
