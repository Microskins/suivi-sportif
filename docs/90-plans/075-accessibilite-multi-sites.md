# Plan - Accessibilite des cinq sites

## Objectif

- Deuxieme des trois chantiers de refonte demandes: architecture (plan 074),
  puis **UX/UI**, puis documentation. Cette phase porte en priorite sur
  l'accessibilite, choix de l'utilisateur.
- Rendre les cinq sites conformes au niveau WCAG 2.1 AA sur les points
  mesures pendant l'audit: contraste des textes, nom accessible des titres,
  navigation au clavier.
- Empecher la regression en automatisant le controle de contraste, comme le
  plan 074 l'a fait pour l'isolation entre sites.

## Audit realise le 2026-08-19

Premier audit visuel reellement execute sur les cinq sites: les plans 069 a
072 avaient tous laisse leur verification visuelle non cochee, faute
d'environnement fonctionnel. L'outillage repare par le plan 074 l'a permis.

Methode: application lancee en local, puis mesure dans le navigateur de
l'arbre d'accessibilite et des ratios de contraste calcules selon la formule
WCAG. Les elements poses sur un degrade ont ete **exclus** des resultats: leur
fond n'est pas calculable de facon fiable, et les inclure aurait produit de
faux positifs.

### Contraste: ce sont les tokens de DA qui echouent

| Site | Couleur | Role | Ratio mesure |
|---|---|---|---|
| suivi-sportif | `#ff7a54` | `--site-accent` | 2,45 |
| voyage | `#e08a1e` | ambre de statut | 2,48 |
| trekking | `#b0794c` | `--site-muted` | 2,89 |
| suivi-sportif | `#9c8f83` | `--site-muted` | 2,99 |
| prix-aliments | `#858585` | gris hors DA | 3,38 |
| trekking | `#5c7350` | `--site-accent` | 4,08 |
| voyage | `#6b7684` | `--site-muted` | 4,26 |
| prix-aliments | `#3f7d52` | vert sur encadre vert | 4,34 |

Le seuil AA est de 4,5 pour du texte courant. `--site-muted`, qui porte
**tout le texte secondaire**, echoue sur trois sites sur cinq. Ce n'est pas
une negligence ponctuelle mais une propriete des palettes validees.

Portfolio est conforme sur ses deux tokens (`--site-muted` 4,86 et
`--site-accent` 5,13). Son seul echec est le grand numero d'index en encre
pale (1,49), qui est un choix assume de la DA.

### Autres constats

- Le nom accessible des `h1` est incorrect sur les cinq sites: `Faire<br>utile.`
  est restitue « Faireutile. » par un lecteur d'ecran. Meme defaut pour
  « Marcher loin,regarder mieux. », « Partir avecun plan clair. », « Avance
  aton rythme. » et « Le meme panier.Pas le meme prix. ».
- Lien d'evitement absent sur **les cinq** sites (le constat initial disait
  quatre, voir notes de verification: faux positif du detecteur).
- Deja conformes partout: `lang="fr"`, hierarchie des titres, etiquettes de
  champs, noms accessibles des liens et boutons.

## Decisions

- **Assombrir les tokens fautifs** plutot que de documenter l'ecart, en ne
  touchant qu'a la luminosite HSL pour conserver teinte et saturation.
- **Sauf le corail de suivi-sportif et l'ambre de voyage.** Les amener a 4,5
  donnerait `#db3100` et `#a06315`, soit un rouge brique et un brun: ces deux
  couleurs sont les signatures de leurs DA et changeraient de nature. Elles
  gardent donc leur valeur pour les fonds, degrades et elements decoratifs,
  ou WCAG n'exige que 3:1, et un token dedie `--site-accent-text` assombri
  sert uniquement quand la couleur porte du texte.
- Le gris `#858585` de prix-aliments n'a pas besoin d'etre invente: le token
  de sa DA, `#6b6b6b`, est deja conforme (4,89). C'est une derive a corriger,
  pas une couleur a creer.
- Le numero d'index pale du portfolio n'est pas assombri: il est decoratif et
  n'apporte rien a un lecteur d'ecran. Il sera masque aux technologies
  d'assistance plutot que de casser un parti pris graphique.
- Les cinq skills de DA doivent etre mis a jour avec les nouvelles valeurs,
  faute de quoi ils documenteront des couleurs absentes du code — l'erreur
  exacte corrigee par le plan 074 sur `structure-des-reponses-api`.

## Todo

- [x] Creer ce plan et la branche dediee `feat/accessibilite-multi-sites`.
- [x] Corriger le nom accessible des `h1` sur les cinq sites.
- [x] Ajouter un lien d'evitement (les cinq en manquaient, voir notes).
- [x] Corriger les tokens de contraste simples et moderes.
- [x] Ajouter `--site-accent-text` pour le corail et l'ambre.
- [ ] Verifier la navigation au clavier et la visibilite du focus.
- [ ] Mettre a jour les cinq skills de DA avec les nouvelles couleurs.
- [ ] Automatiser le controle de contraste des tokens.
- [ ] Etendre `docs/07-qualite` aux cinq sites.
- [ ] Verifier: tests, lint, build, controles, et nouvelle mesure de contraste.

## Notes de verification

- 2026-08-19: plan cree, branche `feat/accessibilite-multi-sites` creee depuis
  `main` a jour (commit `187ed7e`, merge de la PR #35).
- 2026-08-19: couleurs corrigees calculees par script plutot qu'a l'oeil, en
  cherchant la variante la plus proche atteignant le ratio cible par
  ajustement de la seule luminosite HSL.
- 2026-08-19: nom accessible des `h1` corrige sur les cinq sites en inserant
  un espace explicite (`{" "}`) avant le saut de ligne. JSX supprime les
  espaces autour de `<br />`, d'ou la concatenation. Le rendu visuel est
  inchange, verifie site par site: `innerText` conserve le saut de ligne
  tandis que `textContent` contient desormais l'espace.
- 2026-08-19: correction d'un constat errone de l'audit initial. Le detecteur
  cherchait `a[href^="#"]`, ce qui capturait la navigation par ancres de
  prix-aliments; ce site n'avait donc pas plus de lien d'evitement que les
  autres. **Aucun des cinq n'en avait.**
- 2026-08-19: lien d'evitement place dans `client/src/app/skip-link.tsx`,
  rendu par le routeur avant le site. Il vit dans la couche `app` et non
  dans les sites: c'est le seul endroit commun aux cinq identites, ce qui
  evite de le recopier cinq fois. Ses couleurs passent par les tokens
  `--site-*`, donc il adopte la DA du site affiche.
- 2026-08-19: les `<main>` recoivent `id="contenu-principal"` et
  `tabIndex={-1}`. Sans ce `tabindex`, verification faite dans le navigateur,
  le focus **restait sur le lien** apres activation: la tabulation suivante
  serait repartie du lien, ce qui annule l'interet du dispositif. Une regle
  CSS neutralise le contour de focus sur cette cible, qui n'est pas un
  element actionnable.
- 2026-08-19: verifie au clavier reel: la premiere tabulation revele le lien
  (207x44 px, contraste 11,83:1) et l'activation deplace le focus sur le
  `<main>`. Limite: l'activation par la touche Entree n'a pas pu etre
  reproduite avec les evenements synthetiques de cet environnement; le
  mecanisme a ete valide par un clic. A confirmer par un test humain.
- 2026-08-19: le calcul des couleurs corrigees comportait un defaut. La
  premiere version evaluait le ratio **avant** l'arrondi hexadecimal, et
  retenait des valeurs qui repassaient sous le seuil une fois ecrites dans
  le CSS (`#db3100` a 4,48 au lieu de 4,50). Le script corrige arrondit
  d'abord, puis verifie sur **tous** les fonds ou la couleur est employee.
  Ce point a resurgi deux fois: le fond `#fdf6ef` d'une pastille et le fond
  `#fff2df` d'un badge de statut avaient ete oublies.
- 2026-08-19: les tokens ne suffisaient pas: 96 occurrences de couleurs de DA
  etaient recopiees en dur dans les composants, ce qui neutralisait leur
  correction. Les couleurs de **texte** ont ete migrees vers les tokens sur
  les cinq sites; les fonds et bordures sont laisses tels quels, le seuil
  WCAG y etant de 3:1 et le risque de regression visuelle plus eleve.
- 2026-08-19: la pastille du hero Trekking (texte blanc sur photo) est le
  seul cas ou la DA et le contraste s'opposaient vraiment. Le sepia d'origine
  a 55 % tombe a 1,93:1 sur une zone claire de photo, et meme opaque il
  plafonne a 3,69:1. Retenu: le sepia assombri a 90 %, qui tient dans tous
  les cas (4,68:1 au pire, 6,48:1 sur photo sombre) en conservant la teinte.
- 2026-08-19: le numero d'index pale du portfolio passe en `aria-hidden`
  plutot que d'etre assombri: c'est un parti pris editorial de la DA, et
  l'ordre qu'il exprime est deja porte par l'ordre de la liste.
- 2026-08-19: mesure finale dans le navigateur, les cinq sites sont a
  **zero echec de contraste**. Le detecteur exclut desormais le contenu
  marque `aria-hidden`, et continue d'exclure les elements poses sur un
  degrade, dont le fond n'est pas calculable de facon fiable.
- 2026-08-19: verifie apres ces changements: typecheck client OK, 45 tests
  sur 45, lint sortie 0.
