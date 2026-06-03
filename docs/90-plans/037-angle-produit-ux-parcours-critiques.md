# Plan - Angle produit et UX: parcours critiques

## Objectif

- Clarifier les parcours les plus frequents.
- Rendre l'interface plus lisible sur desktop et mobile.
- Rechercher moins de friction sur la navigation, les filtres, les formulaires et les etats.

## Decisions

- Prioriser les ecrans a usage quotidien: dashboard, calendrier, exercices, repas, profil.
- Traiter en premier les etats vide, chargement et erreur, ainsi que les actions repetitives.
- Conserver la base visuelle actuelle; pas de refonte branding.
- Valider les changements sur les parcours reels avant de generaliser.
- Commencer par un audit guide avant toute retouche visuelle.

## Parcours critiques

1. Se connecter puis comprendre le tableau de bord
   - Entrer dans l'application.
   - Lire les indicateurs utiles du jour.
   - Identifier l'action principale suivante.

2. Planifier, creer ou dupliquer une seance
   - Passer du calendrier a la creation.
   - Ajouter des exercices et des series.
   - Reordonner et sauvegarder sans perte de contexte.

3. Suivre une semaine d'entrainement
   - Lire le calendrier.
   - Comprendre planifie, realise et annule.
   - Relier le score hebdomadaire a l'objectif sportif.

4. Creer un repas rapidement
   - Trouver un aliment.
   - Reutiliser une portion recente.
   - Comprendre les ecarts calories/macros avant validation.

5. Mettre a jour son profil, ses mensurations et ses objectifs
   - Modifier les informations sensibles avec confirmation claire.
   - Ajouter une mesure corporelle.
   - Lire la tendance et le lien avec les objectifs actifs.

## Checklist d'audit

| Point | Question |
| --- | --- |
| Entree du parcours | L'action de depart est-elle visible sans chercher ? |
| Charge cognitive | Le formulaire expose-t-il trop de champs en meme temps ? |
| Retour utilisateur | Les etats sauvegarde, erreur, vide et chargement sont-ils explicites ? |
| Navigation | Peut-on revenir a la liste ou au calendrier sans perdre le contexte ? |
| Mobile | Les boutons, filtres et tableaux restent-ils utilisables en largeur etroite ? |
| Accessibilite | Focus, labels, contrastes et ordre clavier sont-ils acceptables ? |
| Action repetitive | L'utilisateur peut-il refaire vite une action frequente ? |

## Retouches candidates

- Ajouter des points d'entree plus directs depuis le dashboard vers les actions quotidiennes.
- Auditer les modales restantes pour seances, aliments et objectifs avant de choisir inline, panneau lateral ou modale conservee.
- Reduire la densite du formulaire de seance par regroupement visuel des series et filtres.
- Clarifier les boutons de retour entre liste, creation et calendrier.
- Rendre les filtres exercices/aliments plus memorables quand l'utilisateur revient dans la section.
- Ajouter des messages d'etat vides plus actionnables sur calendrier, repas et objectifs.

## Checklist de validation UI

Parcours a verifier en desktop puis mobile:

1. Dashboard
   - Les actions rapides ouvrent les bons flux inline.
   - L'utilisateur comprend la prochaine action sans ouvrir la navigation laterale.

2. Seances
   - Depuis le calendrier, "Planifier une seance" ouvre le formulaire avec la date attendue.
   - Le retour liste annule proprement les brouillons.
   - Le resume du formulaire correspond aux exercices et series visibles.

3. Calendrier
   - Les statuts `Prevue`, `Realisee`, `Annulee` sont lisibles.
   - L'etat vide d'un jour renvoie clairement a l'action de planification.

4. Repas
   - Les filtres aliments restent comprehensibles.
   - Le recap calories/macros est visible avant validation.
   - L'etat vide explique quoi faire ensuite.

5. Profil, mensurations et objectifs
   - Le changement email/mot de passe expose clairement la confirmation.
   - Les objectifs et mensurations gardent un retour liste/edit lisible.

Points transverses:

- Aucun texte ne deborde sur mobile.
- Les boutons principaux restent accessibles au clavier.
- Les etats chargement, erreur et vide sont visibles.
- Les filtres peuvent etre remis a zero quand ils cachent tout.

## Todo

- [x] Creer ce plan.
- [x] Lister les 5 parcours UX les plus sensibles.
- [x] Auditer la navigation, les filtres et les formulaires de ces parcours.
- [x] Definir les retouches a impact rapide.
- [ ] Verifier la lisibilite mobile et l'accessibilite de base.
- [x] Produire une checklist de validation UI.

## Notes de verification

- 2026-06-03: plan cree a partir du constat que le frontend est dense et que plusieurs ecrans cles restent a clarifier.
- 2026-06-03: aucune verification de rendu n'a encore ete lancee; le cadrage est en cours.
- 2026-06-03: cinq parcours critiques listes depuis la structure actuelle du dashboard, du calendrier, des repas, des exercices et du profil.
- 2026-06-03: les modales restantes sont traitees comme decision UX a auditer dans ce plan, pas comme bug fonctionnel.
- 2026-06-03: retouches rapides appliquees: actions rapides dashboard vers flux inline, libelles de creation contextuels, planification calendrier vers formulaire seance inline, resume du formulaire seance, filtres exercices plus explicites, legende calendrier, etats vides plus actionnables, confirmation profil mieux exposee.
- 2026-06-03: checklist de validation UI ajoutee; verification visuelle mobile/desktop non cochee car l'outil navigateur n'est pas disponible dans la session courante.
