---
name: suivi-sportif-trekking-da
description: Direction artistique validée du site Trekking de Thomas Cochart (carnets de marche / itinérances à pied), style "Carte topo" avec panorama photo plein cadre. Utilise ce skill à chaque fois qu'il faut créer, modifier ou étendre une page front du site Trekking (accueil, page voyage, nouvelle étape, composant) pour que le rendu reste cohérent avec la DA validée — même si l'utilisateur ne redonne pas les détails de style. Déclenche-toi sur toute mention de "trekking", "carnet de marche", "page voyage", "itinéraire" ou "front" liée à ce site. Ne pas confondre avec la DA du portfolio (suivi-sportif-portfolio-da), qui est un style différent (catalogue éditorial).
---

# DA Trekking — Carte topo / panorama

Direction validée par l'utilisateur parmi 3 propositions ("carte topo", "balisage sentier", "carnet de terrain"), puis affinée pour remplacer les aplats sombres par un panorama photo plein cadre. Toute nouvelle page ou tout nouveau composant du site Trekking doit suivre ces règles. Cette DA est indépendante de celle du portfolio (suivi-sportif-portfolio-da) — ne pas les mélanger.

## Palette

| Rôle | Valeur | Usage |
|---|---|---|
| Fond parchemin | `#f1e2c4` | fond de page |
| Encre principale | `#332f26` | texte, titres, traits, bordures |
| Sépia / contour | `#b0794c` | labels secondaires, motif de courbes de niveau, spec |
| Vert forêt | `#5c7350` | accent principal (statuts positifs, liens, anneaux numérotés) |
| Terracotta alerte | `#b1573c` | statut d'alerte ("Reporter", points de vigilance) |
| Ligne | `#e0c99e` | séparateurs fins |

Palette réchauffée volontairement vers des tons sable/ocre proches d'une lumière de panorama (lever/coucher de soleil en montagne) — ne pas revenir à un beige neutre ou un vert sombre en aplat.

## Typographie

- **Display / titres** : `Fraunces` (500/600), casse normale (pas de majuscules forcées), line-height serré (~1–1.02) sur les grands titres.
- **Corps de texte** : `IBM Plex Sans`.
- **Labels / données / navigation** : `IBM Plex Mono` (500), petite taille, `letter-spacing: .08em` à `.16em`, souvent en majuscules pour les eyebrows et tags.

## Layout — signature : le hero panorama

Élément le plus caractéristique de cette DA, à reproduire sur toute nouvelle page d'entrée (accueil, page voyage, page étape) :

- Photo plein cadre (paysage de montagne réel, pas une image générique) en fond de hero, `background-size:cover`.
- Dégradé superposé qui part quasi transparent en haut et se **fond progressivement dans le beige parchemin** (`var(--paper)`) en bas de la photo — pas un aplat noir plat. Exemple de recette : `linear-gradient(180deg, rgba(40,44,30,.15) 0%, rgba(30,34,22,.58) 45%, rgba(30,34,22,.86) 74%, var(--paper) 100%)`.
- Eyebrow en **pilule** (border-radius 999px, fond sépia translucide, bordure claire fine) posée sur la photo, peut inclure un emoji simple (🥾, 🏔) plutôt qu'une icône SVG custom.
- Titre `Fraunces` en clair sur la photo, taille `clamp(38px, 7–8vw, 64–80px)`.
- Les chiffres clés (distance, dénivelé, durée, difficulté) sont des **pastilles arrondies** (`border-radius:14px`, fond sombre translucide, bordure claire fine) posées sur la photo, jamais une grille encadrée à angles droits ni une barre pleine séparée.

Ne jamais revenir à une barre de stats en aplat sombre plein (noir ou vert uni) : la texture photo doit rester visible en dégradé, y compris derrière les pastilles de stats.

Le motif de courbe de niveau ondulée (`.contour-divider`, SVG en `<path>` ondulé, couleur sépia) reste un élément de vocabulaire disponible pour des séparateurs secondaires plus bas dans une page (pas dans le hero), mais n'est plus utilisé comme diviseur principal depuis le passage au hero photo.

## Composants

- **Cartes voyage** (listing) : bordure fine encre, image à gauche/droite, contenu à droite avec tag mono, titre Fraunces, description, mini profil d'élévation en SVG (`polyline`) coloré en vert forêt, ligne de specs + bouton "Ouvrir le carnet" en pastille sombre pleine.
- **Étapes numérotées** : anneau rond fin (bordure verte, pas de fond plein) contenant le numéro en `IBM Plex Mono`, aligné avec le titre de l'étape et ses métriques (distance / dénivelé / durée) en mono à droite.
- **Cartes de décision météo** (Maintenir / Adapter / Reporter) : bordure supérieure épaisse colorée (vert / sépia-jaune / terracotta) qui porte tout le code couleur — le corps reste sobre, fond quasi blanc translucide.
- Zéro `border-radius` sur les blocs de contenu structurés (cartes, steps) — les coins arrondis sont réservés aux éléments qui se posent *sur la photo* (pilules, pastilles).

## Ton et écriture

- Français correct avec accents.
- Vocabulaire de préparation/terrain réel (bivouac, point de vigilance, dénivelé, trace GPX) plutôt que du jargon produit générique.
- Les CTA nomment l'action précise ("Ouvrir le carnet", "Explorer le parcours"), jamais "En savoir plus".

## Référence de code

`assets/reference-accueil.html` et `assets/reference-voyage.html` contiennent l'implémentation complète et validée (tokens CSS, hero panorama, cartes voyage, étapes, cartes de décision). Pour toute nouvelle page Trekking :
1. Réutiliser les mêmes variables CSS (`:root`) et les classes déjà définies (`.hero`, `.hero-inner`, `.pill`, `.voyage`, `.step`, `.decision`) plutôt que d'en recréer.
2. Le hero panorama est le seul endroit avec du texte clair sur fond sombre/photo — tout le reste du site reste en encre sombre sur parchemin clair.
3. Pour une page sans photo de paysage pertinente, ne pas forcer un hero photo — utiliser à la place le motif de courbe de niveau en diviseur et garder le hero sur fond parchemin uni (comme la première itération avant le panorama).