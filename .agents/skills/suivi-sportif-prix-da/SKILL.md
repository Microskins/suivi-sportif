---
name: suivi-sportif-prix-da
description: Direction artistique validée du comparateur de prix alimentaires de Thomas Cochart, style "Ticket de caisse". Utilise ce skill à chaque fois qu'il faut créer, modifier ou étendre une page front de ce projet (recherche, résultat de comparaison, historique de prix, nouveau composant) pour que le rendu reste cohérent avec la DA validée — même si l'utilisateur ne redonne pas les détails de style. Déclenche-toi sur toute mention de "comparateur", "comparateur de prix", "prix alimentaires" ou "front" liée à ce projet. Ne pas confondre avec les autres DA du même auteur (suivi-sportif-portfolio-da, suivi-sportif-trekking-da, suivi-sportif-app-da, suivi-sportif-voyage-da) — cinq DA distinctes pour cinq projets distincts.
---

# DA Comparateur de prix — Ticket de caisse

Direction validée par l'utilisateur parmi 5 propositions ("ticket de caisse", "étiquette de rayon", "tableur", "marché frais", "app budget"). Toute nouvelle page ou tout nouveau composant du comparateur doit suivre ces règles.

## Palette

| Rôle                    | Valeur    | Usage                                                               |
| ----------------------- | --------- | ------------------------------------------------------------------- |
| Fond page (hors ticket) | `#e9e6dc` | fond derrière le ticket, jamais le fond du contenu lui-même         |
| Papier du ticket        | `#f7f5ef` | fond du bloc ticket                                                 |
| Encre principale        | `#1c1c1c` | texte, titres, bordures dures                                       |
| Texte secondaire        | `#6b6b6b` | labels, métadonnées                                                 |
| Vert (meilleur prix)    | `#3e7a50` | UNIQUEMENT pour signaler le meilleur prix — jamais utilisé ailleurs |
| Rouge (accent)          | `#c1362b` | accent ponctuel, pas de rôle fixe imposé                            |
| Ligne                   | `#d8d4c8` | pointillés/tirets de séparation                                     |

Le vert `--green` est un signal exclusif : dès qu'un prix ou une ligne est en vert, ça veut dire "c'est le meilleur prix trouvé" — ne jamais l'utiliser pour un autre usage décoratif, sous peine de casser ce repère visuel.

Le vert a été très légèrement assombri (depuis `#3f7d52`) : il passait sur le papier du ticket mais pas sur l'encadré vert clair du meilleur prix (4,34:1). L'écart est imperceptible et la valeur actuelle est conforme dans les deux contextes.

Attention au gris : le texte secondaire est `#6b6b6b`, pas un gris plus clair. Un `#858585` s'était glissé dans les composants et échouait au contraste ; utiliser `var(--site-muted)` plutôt qu'une valeur en dur. `npm run check:contrast` vérifie ces seuils.

## Typographie

- **Toute la DA est en une seule police** : `JetBrains Mono` (400/500/600/700), y compris les titres. Ne pas introduire de police d'affichage séparée — c'est la texture "ticket imprimé" qui porte l'identité, pas un contraste de polices.
- Les titres restent en `JetBrains Mono` gras, centrés, pas de grande taille display comme dans les autres DA du même auteur.

## Layout — signature : le bloc "ticket"

Élément caractéristique de toute page de ce projet :

- Un seul bloc central façon reçu de caisse (`max-width: 640px`, centré), fond `--paper`, posé sur un fond légèrement plus sombre (`--bg` de la page, `#e9e6dc`) qui simule la table/le comptoir.
- Bordures haute et basse en **tirets épais** (`border-top/bottom: 3px dashed #b8b3a0`) — jamais de bordure pleine sur le bloc ticket lui-même.
- Séparateurs internes entre sections : simple trait fin en pointillés (`border-top: 1px dashed var(--line)`), pas les mêmes tirets épais que le contour extérieur (hiérarchie à deux niveaux de pointillés).
- Toute liste de données (résultats, recherches récentes, historique) est une succession de lignes `justify-content: space-between` avec bordure `1px dotted` — jamais un tableau à cellules ni des cartes séparées.
- Un motif de code-barres (SVG de rectangles verticaux) peut apparaître en pied de ticket comme clin d'œil, mais reste optionnel et décoratif — ne pas le rendre interactif ni essentiel à la lecture.

## Composants

- **Ligne "meilleur prix"** : mise en avant avec un encadré vert clair (`background:#eaf3ec; border:2px solid var(--green)`), badge "★ Meilleur prix" en vert, prix en vert gras — c'est la seule ligne qui sort du style "liste de ticket" plate.
- **Barre de recherche** : bordure épaisse pleine (`2px solid var(--ink)`), pas de coins arrondis, bouton plein en encre avec texte clair — cohérent avec l'esthétique "caisse", pas un champ de recherche web classique arrondi.
- **Prix au kilo/litre** : toujours affiché en sous-ligne discrète sous le nom du magasin (`font-size:10-11px; color:var(--sub)`), jamais mis en avant autant que le prix affiché.

## Ton et écriture

- Français correct avec accents.
- Vocabulaire de caisse/reçu assumé : "Ticket N°", "Merci de votre visite", plutôt que du vocabulaire d'app générique.
- Toujours mentionner que les prix sont indicatifs et peuvent varier en magasin (mention en pied de page ou de ticket) — c'est une info produit à conserver sur toute page affichant des prix.

## Référence de code

`assets/reference-accueil.html` (recherche) et `assets/reference-resultat.html` (comparaison par magasin) contiennent l'implémentation complète et validée. Pour toute nouvelle page (historique de prix, liste de favoris, page magasin...) :

1. Réutiliser la structure `.receipt` (bloc ticket centré sur fond `--bg`) et les classes déjà définies (`.line`, `.divider`, `.section-label`, `.best-row`/`.best-tag`) plutôt que d'en recréer.
2. Garder une seule police sur toute nouvelle page — ne pas introduire de police d'affichage même pour un gros titre.
3. Le vert reste réservé au signal "meilleur prix" — pour toute autre mise en avant (nouveauté, promo, alerte), utiliser le rouge ou un badge neutre, jamais le vert.
