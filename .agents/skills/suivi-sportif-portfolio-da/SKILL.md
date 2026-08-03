---
name: suivi-sportif-portfolio-da
description: Direction artistique validée du portfolio de Thomas Cochart (suivi-sportif.fr), style "Catalogue éditorial". Utilise ce skill à chaque fois qu'il faut créer, modifier ou étendre une page front du portfolio (accueil, nouvelles pages projet, composants, landing pages) pour que le rendu reste cohérent avec la DA validée — même si l'utilisateur ne redonne pas les détails de style. Déclenche-toi sur toute mention de "portfolio", "suivi-sportif.fr", "page projet", "landing" ou "front" liée à ce site.
---

# DA Portfolio — Catalogue éditorial

Direction validée par l'utilisateur (variante "2 — Catalogue" parmi 3 propositions). Toute nouvelle page ou tout nouveau composant du portfolio doit suivre ces règles, pas repartir d'un style neutre. Ne pas revenir vers les défauts génériques (fond crème + serif + accent terracotta, ou fond noir + vert acide) sauf demande explicite contraire.

## Palette

| Rôle | Valeur | Usage |
|---|---|---|
| Fond papier | `#efe7d8` | fond de page |
| Encre principale | `#1b2a3d` (marine) | texte, titres, traits |
| Encre douce | `#5b6474` | texte secondaire, légendes |
| Accent brique | `#a63d2f` | eyebrows, soulignés de lien, numéros, tags |
| Vert olive | `#4a5a3f` | statuts positifs ("En ligne") |
| Ligne | `#c9bfa8` | séparateurs fins, bordures de cartes |

Ne pas ajouter d'autres couleurs vives. L'accent brique reste réservé aux éléments d'action/état — jamais en fond large.

## Typographie

- **Display / titres** : `Barlow Condensed` (600/700), toujours en majuscules, tracking légèrement négatif sur les très grandes tailles (`letter-spacing:-.01em`), line-height serré (~0.86–0.95).
- **Corps de texte** : `Source Serif 4`, y compris en italique pour les asides/citations. Le premier paragraphe de chaque page (le "lede") a une lettrine (`::first-letter`) en Barlow Condensed brique.
- **Labels/métadonnées** (tags, specs, footer) : `Barlow Condensed` 500/600, petite taille, `letter-spacing: .1em` à `.16em`, majuscules.

Ne jamais mélanger une police monospace ou une serif display classique (type Fraunces/Playfair) — ça casse l'identité "catalogue".

## Layout

- Header : logo + libellé à gauche, mention d'édition ("Édition 2026 — N°02" ou équivalent) à droite, séparés par une règle de 3px.
- Hero en deux colonnes (`1.4fr / 1px / 1fr`) séparées par un trait vertical plein : le lede à gauche, une note ou aside en italique à droite.
- Les listes de contenu (projets, articles, etc.) sont des **entrées de catalogue**, pas des cartes à coins arrondis : `grid-template-columns: 64px 1fr 240px` avec un grand numéro d'index en encre pâle (`--line`), tag + titre + description, puis une colonne latérale avec lien souligné brique et statut.
- Chaque entrée peut porter une **"spec strip"** : ligne de métadonnées réelles séparée par un trait fin au-dessus (ex. distance, durée, modules) — jamais inventée, toujours tirée du contenu réel du projet.
- Zéro `border-radius` significatif ; tout est à angles droits. Séparateurs en traits pleins fins (1px) ou épais (3px) pour les niveaux de hiérarchie majeurs (header, footer).

## Ton et écriture

- Français correct avec accents (à corriger systématiquement si le contenu source en manque).
- Labels d'action à la voix active : "Ouvrir", pas "Voir plus" ou "Cliquez ici".
- Les eyebrows et tags sont de vrais mots de vocabulaire du contenu (ex. "Application web", "Carnets de marche"), jamais des mots creux.

## Référence de code

Le fichier `assets/reference.html` contient l'implémentation complète et validée de la page d'accueil dans cette DA (tokens CSS, structure hero, composant "entry"). Pour toute nouvelle page :
1. Réutiliser les mêmes variables CSS (`:root`) et les mêmes classes de composants (`.entry`, `.spec-strip`, `.eyebrow`, `.section-head`) plutôt que d'en recréer.
2. Adapter uniquement le contenu et, si besoin, le nombre de colonnes de la grille de hero — pas la palette ni les polices.
3. Si une page a besoin d'un élément qui n'existe pas encore dans la référence (ex. une galerie photo), le concevoir dans le même langage visuel : traits fins, numérotation d'index, majuscules condensées pour les labels, plutôt que d'improviser un style différent.