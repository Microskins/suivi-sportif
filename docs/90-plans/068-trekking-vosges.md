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
- [ ] Verifier le typecheck, les tests frontend et le build (bloque par Node.js absent).

## Notes de verification

- 2026-07-27: le modele fourni decrit une boucle de 49 km sur trois jours dans
  les Hautes-Vosges.
- 2026-07-27: image hero generee avec l'outil imagegen et ajoutee dans
  `client/public/trekking/vosges-wild-hero.png`.
- 2026-07-27: `git diff --check` valide sans erreur et aucun style inline,
  gradient ou SVG n'est utilise dans le mini-site.
- 2026-07-27: `node`, `npm` et `npx` sont absents du `PATH`; les verifications
  frontend ne peuvent pas etre lancees dans cet environnement.
