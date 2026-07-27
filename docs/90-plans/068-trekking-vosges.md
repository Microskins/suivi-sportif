# Plan - Mini-site Trekking et premier trek dans les Vosges

## Objectif

- Ajouter au portfolio un mini-site de trekking accessible sous `/trekking`.
- Presenter un premier trek de trois jours dans les Hautes-Vosges avec les
  informations utiles a sa preparation.

## Decisions

- Reprendre la direction "Vosges Wild" du modele fourni: un carnet de
  preparation sombre, inspire du terrain et lisible en exterieur.
- Conserver le mini-site dans le client React existant, sans nouvelle API ni
  nouveau domaine.
- Utiliser `/trekking` comme catalogue et un chemin dedie par voyage, en
  commencant par `/trekking/vosges-wild`.
- Inclure une vue d'itineraire, les trois etapes, une liste de materiel
  interactive locale et les rappels de securite.
- Presenter les distances et conditions comme indicatives: elles devront etre
  verifiees avant un depart reel.

## Todo

- [x] Creer le plan.
- [x] Creer la branche dediee.
- [x] Analyser le modele fourni et les contenus existants.
- [x] Generer et integrer une image hero originale.
- [x] Construire le mini-site `/trekking` et ses interactions.
- [x] Ajouter le projet au portfolio et documenter la route.
- [x] Corriger la collision entre la route `/trekking` et les assets publics.
- [x] Creer un catalogue de voyages et une route dediee pour Vosges Wild.
- [ ] Verifier le typecheck, les tests frontend et le build (bloque par Node.js absent).

## Notes de verification

- 2026-07-27: le modele fourni decrit une boucle de 49 km sur trois jours dans
  les Hautes-Vosges.
- 2026-07-27: image hero generee avec l'outil imagegen et ajoutee dans
  `client/public/media/trekking/vosges-wild-hero.png`.
- 2026-07-27: `git diff --check` valide sans erreur et aucun style inline,
  gradient ou SVG n'est utilise dans le mini-site.
- 2026-07-27: `node`, `npm` et `npx` sont absents du `PATH`; les verifications
  frontend ne peuvent pas etre lancees dans cet environnement.
- 2026-07-27: correction Nginx: le dossier public `/trekking` entrait en
  collision avec la route React et retournait `403`. L'image est deplacee sous
  `/media/trekking` pour liberer la route.
- 2026-07-27: `/trekking` est desormais le catalogue des voyages et Vosges Wild
  est accessible sous `/trekking/vosges-wild`.
- 2026-07-27: `git diff --check` valide la mise a jour des routes; le build local
  reste bloque par l'absence de Node.js dans l'environnement.
