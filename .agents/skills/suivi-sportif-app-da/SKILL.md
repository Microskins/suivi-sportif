---
name: suivi-sportif-app-da
description: Direction artistique validée de l'application Suivi Sportif de Thomas Cochart (dashboard de suivi entraînements / nutrition / corps sur suivi-sportif.fr), style "Énergie" — chaleureux, arrondi, jauges circulaires. Utilise ce skill à chaque fois qu'il faut créer, modifier ou étendre une page ou un composant de cette application (synthèse, calendrier, séances, nutrition, objectifs, profil, etc.) pour que le rendu reste cohérent avec la DA validée — même si l'utilisateur ne redonne pas les détails de style. Déclenche-toi sur toute mention de "suivi sportif", "l'app", "le dashboard", "tableau de bord sport" ou "front" liée à cette application. Ne pas confondre avec les DA du portfolio (suivi-sportif-portfolio-da, style catalogue éditorial) ni du site Trekking (trekking-da-topo, style carte topo/panorama) — trois DA distinctes pour trois surfaces distinctes du même auteur.

---

# DA Suivi Sportif (app) — Énergie

Direction validée par l'utilisateur parmi 4 propositions ("carnet athlétique", "clinique", "énergie", "performance sombre"). Toute nouvelle page ou tout nouveau composant de l'application doit suivre ces règles. Cette DA est indépendante de celles du portfolio et du site Trekking — ne pas les mélanger, même si c'est le même auteur.

## Palette

| Rôle | Valeur | Usage |
|---|---|---|
| Fond app | `#fff8f2` | fond de page |
| Cartes | `#ffffff` | panneaux, cartes stats |
| Encre principale | `#2b241e` | texte, titres |
| Texte secondaire | `#9c8f83` | labels, métadonnées, sous-titres |
| Corail (accent 1) | `#ff7a54` | accent principal, CTA, actif |
| Ambre (accent 2) | `#ffb648` | second accent, toujours en dégradé avec le corail |
| Vert (positif) | `#5fb894` | statuts positifs, "réalisée" |
| Bleu (info) | `#6a9bd8` | statut "prévue" dans le calendrier |
| Ligne | `#f0e3d6` | séparateurs, bordures discrètes |

L'accent corail/ambre s'utilise presque toujours en **dégradé diagonal** (`linear-gradient(135deg, corail, ambre)`), jamais en aplat plat — c'est la signature couleur de cette DA. Le panneau "Actions rapides" est le seul bloc en fond sombre (dégradé brun `#2b241e → #3a2f26`), pour créer un point d'ancrage visuel fort en bas de page ; ne pas généraliser le fond sombre ailleurs.

## Typographie

- **Display / titres, valeurs chiffrées, marque** : `Quicksand` (500/600/700) — toujours arrondi, jamais anguleux.
- **Corps de texte, UI courante** : `Inter`.
- Pas de police monospace dans cette DA (à la différence des deux autres sites) — tout reste en sans-serif rond, y compris les chiffres.

## Layout

- Structure app classique : sidebar fixe à gauche (`230px`, fond blanc, bordure droite fine), contenu principal à droite avec padding généreux (`32px 40px`).
- **Rien n'a d'angle droit** : `border-radius` systématique — 20px sur les cartes/panneaux principaux, 12–14px sur les boutons et petits blocs, 999px (pilule) sur les filtres, toggles et boutons d'action.
- Cartes sur fond blanc avec une ombre douce très légère (`box-shadow: 0 2px 8px rgba(43,36,30,.05)`), jamais de bordure dure.
- Item de nav actif dans la sidebar : fond dégradé pastel clair (`#fff0e6 → #ffe8d6`) + texte corail, pas juste une couleur de texte changée.
- Filtres de période (3j/7j/1mois/1an) et toggle Semaine/Mois : groupe de boutons en pilule sur fond blanc avec ombre, le bouton actif reçoit le dégradé corail/ambre plein.

## Composants signature

- **Stats à jauge circulaire** : les indicateurs qui ont une progression vers un objectif (séances, calories, protéines) affichent un anneau SVG (`stroke-dasharray`) coloré au-dessus de la valeur, plutôt qu'une simple barre. Les stats sans notion de progression (objectif actif, poids) restent en simple bloc chiffré, sans anneau.
- **Barres de progression** (régularité, objectif nutrition) : hauteur fine (`8–10px`), fond `#f4e9de`, remplissage en dégradé corail/ambre, coins arrondis `999px`.
- **Boutons d'ajout** ("Ajouter", "Planifier une séance") : toujours en dégradé corail/ambre, texte blanc, jamais en aplat uni.
- **États vides** ("Aucune séance...", "Aucun repas...") : fond légèrement teinté (`#fdf6ef`) avec coins arrondis, jamais un simple cadre en pointillés austère.
- **Calendrier** : cellule du jour courant surlignée d'un dégradé pastel corail très doux ; légende Prévue/Réalisée/Annulée avec puces de couleur rondes (bleu/vert/corail).

## Ton et écriture

- Français correct avec accents.
- Ton encourageant mais factuel : les libellés restent ceux de l'app existante (Séances, Objectif actif, Régularité hebdomadaire) — ne pas les rendre plus "marketing" que l'original, la DA porte la chaleur, pas le texte.
- CTA à l'impératif clair : "Planifier une séance", "Saisir un repas", "Associer à ce jour".

## Référence de code

`assets/reference-synthese.html` (tableau de bord) et `assets/reference-calendrier.html` (calendrier des séances) contiennent l'implémentation complète et validée. Pour toute nouvelle page de l'app (Séances, Objectifs, Aliments, Repas, Mensurations, Profil...) :
1. Réutiliser la structure `.app` (sidebar + `.main`), les variables CSS (`:root`) et les classes déjà définies (`.panel`, `.stat`, `.pill-btn`, `.bar`, `.quick`) plutôt que d'en recréer.
2. Garder la sidebar identique (mêmes groupes de nav, même item actif mis à jour selon la page) sur toutes les pages de l'app.
3. Pour une nouvelle métrique avec objectif/progression, reprendre le pattern d'anneau SVG plutôt que d'inventer un autre type de jauge.