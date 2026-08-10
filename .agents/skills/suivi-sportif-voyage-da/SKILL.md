---
name: voyage-da-boarding
description: Direction artistique validée du site Voyage de Thomas Cochart (référencement de tous ses voyages, avec carte des trajets et réservations Airbnb/GetYourGuide), style "Boarding Pass". Utilise ce skill à chaque fois qu'il faut créer, modifier ou étendre une page front du site Voyage (accueil, page détail d'un voyage, nouveau composant) pour que le rendu reste cohérent avec la DA validée — même si l'utilisateur ne redonne pas les détails de style. Déclenche-toi sur toute mention de "site voyage", "projet voyage", "page voyage" ou "front" liée à ce site. Ne pas confondre avec les autres DA du même auteur (suivi-sportif-portfolio-da, trekking-da-topo, suivi-sportif-app-da) — quatre DA distinctes pour quatre surfaces distinctes.

---

# DA Voyage — Boarding Pass

Direction validée par l'utilisateur parmi 5 propositions ("passeport", "boarding pass", "satellite/carto", "scrapbook", "éditorial minimal"). Toute nouvelle page ou tout nouveau composant du site Voyage doit suivre ces règles.

## Palette

| Rôle | Valeur | Usage |
|---|---|---|
| Fond page | `#f4f6f8` | fond de page |
| Cartes | `#ffffff` | cartes billet, panneaux |
| Encre principale | `#0f1b2b` | texte, header plein, titres |
| Texte secondaire | `#6b7684` | labels, métadonnées |
| Bleu (accent 1) | `#1c4ed8` | statut "réalisé", liens, tracé de carte |
| Ambre (accent 2) | `#e08a1e` | statut "à venir" |
| Ligne | `#dfe4ea` | séparateurs, bordures |

Le header est toujours en encre pleine (`--ink`) avec texte clair — c'est le seul bloc sombre en aplat de cette DA, à l'inverse du reste de la page qui reste clair.

## Typographie

- **Display / titres, codes de trajet** : `Space Grotesk` (500/600/700).
- **Données, labels, codes aéroport, dates** : `JetBrains Mono` (400/500/600), souvent en majuscules avec `letter-spacing`.
- Les codes de trajet (ex. `CDG → KEF`) sont toujours en `JetBrains Mono` gras, jamais en `Space Grotesk` — ils doivent lire comme des données, pas comme un titre.

## Layout — signature : la carte "billet"

Élément le plus caractéristique de cette DA, à reproduire pour toute liste ou tout en-tête de contenu :

- Carte au format billet : `grid-template-columns: 1fr 130-200px`, bordure `1px solid var(--line)`, coins arrondis `10-12px`.
- Entre le contenu principal et le talon latéral, une **ligne perforée** (`background: repeating-linear-gradient(180deg, var(--ink ou line) 0 6-8px, transparent 6-8px 12-16px)`), jamais un simple trait plein.
- Le talon latéral (`.t-side` / `.b-side`) est toujours en encre pleine avec texte clair — c'est le bloc "souche de billet", avec un label mono discret et le lien d'action.
- Le statut (réalisé / à venir) est une pastille pilule (`border-radius:999px`) : fond bleu pâle + texte bleu pour "réalisé", fond ambre pâle + texte ambre pour "à venir" — jamais d'autres couleurs de statut sans raison.
- Le code de trajet utilise systématiquement une flèche horizontale simple (SVG `<path d="M5 12h14M13 6l6 6-6 6"/>`) entre les deux codes, pas d'icône avion ni de tiret.

## Page détail — carte des trajets

- La carte réelle (avec les trajets) est un cadre dédié (`.map-frame`), fond légèrement teinté (`#eef2f6`), avec une légende en bas en `JetBrains Mono` rappelant que c'est un repère de préparation et non une trace GPX officielle.
- Les points d'étape sur la carte : premier point (départ) en encre pleine, points suivants en bleu accent, reliés par un tracé en tirets (`stroke-dasharray`), jamais un trait plein — cohérent avec la ligne perforée du billet.
- Les stats clés du voyage (distance, durée, étapes, période) s'affichent dans une bande à 4 colonnes juste sous le "billet" d'en-tête, séparées par des filets fins.

## Composants — réservations

- Chaque réservation (Airbnb, GetYourGuide, etc.) est une carte compacte : tag source en `JetBrains Mono` majuscule discret, titre en `Space Grotesk` gras, sous-ligne descriptive, lien "Voir →" aligné à droite en bleu accent.
- Toujours nommer la source de la réservation dans le tag (ex. "Airbnb — nuit 1 à 3", "GetYourGuide") — ne jamais génériser en "Hébergement" ou "Activité" seul.
- Grille à 2 colonnes pour les réservations, jamais en liste verticale pleine largeur.

## Ton et écriture

- Français correct avec accents.
- Vocabulaire de voyage réel et daté (villes, dates, distances), jamais de placeholder générique.
- CTA courts et directs : "Ouvrir →", "Voir →" — pas de "En savoir plus".

## Référence de code

`assets/reference-accueil.html` et `assets/reference-detail.html` contiennent l'implémentation complète et validée (tokens CSS, carte billet, carte de trajet SVG, cartes de réservation). Pour toute nouvelle page du site Voyage :
1. Réutiliser les mêmes variables CSS (`:root`) et les classes déjà définies (`.ticket`/`.boarding`, `.map-frame`, `.booking`) plutôt que d'en recréer.
2. Le talon perforé et le bloc encre plein sont réservés aux cartes de type "billet" (liste de voyages, en-tête de détail) — ne pas les généraliser à d'autres composants (ex. une carte de réservation ne doit pas avoir de talon).
3. Toute nouvelle carte de la carte (aéroport, hôtel, point d'intérêt) reprend le même style de point + tracé en tirets que celui déjà utilisé, avec la couleur départ (encre) vs étapes (bleu accent) conservée.