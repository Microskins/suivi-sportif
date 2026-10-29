# Plan - Accueil Voyage en globe 3D

## Objectif

- Refondre l'accueil `/voyage`: un globe terrestre avec l'arc de chaque vol.
- Cliquer un arc ouvre le detail du voyage et la carte du pays.

## Decisions

- Globe MapLibre (projection `globe`), deja utilise par les carnets: aucune
  dependance supplementaire ni nouvelle origine dans la CSP. Le moteur est
  charge par `import()` comme la carte des carnets.
- Catalogue `voyage-trips.ts`: chaque voyage declare ses vols (aeroport de
  depart et d'arrivee), car le depart change selon le voyage; un retour depuis
  une autre ville se declare comme un second vol.
- Arcs en grand cercle (`great-circle.ts`): la trajectoire reelle d'un avion.
  Bleu pour un voyage realise, ambre pour un voyage a venir.
- Un avion parcourt chaque arc en boucle; il reste immobile a mi-parcours avec
  `prefers-reduced-motion`.
- Clic sur un arc (zone de clic elargie) ou sur le badge de destination (vrai
  lien, accessible au clavier): plongee vers le pays puis ouverture du carnet.
- Survoler un billet surligne son arc, et inversement.
- Sans WebGL ou si le style ne charge pas: message de repli, billets intacts.
- Les styles des marqueurs vivent dans `voyage-map-markers.css`, charge avec
  les moteurs de carte.
- La maquette 3D en bloc (three.js) a ete abandonnee avant d'etre commitee.

## Todo

- [x] Catalogue, arcs, globe, accueil, tests, verification navigateur.
- [ ] Ajouter les voyages passes (pays, dates, aeroports aller et retour).
- [ ] Confirmer l'aeroport de depart de l'Ecosse (CDG provisoire).
- [ ] Statut de l'Islande (encore "a venir" alors que la date est passee).

## Notes de verification

- 2026-10-29: verifie dans Chromium avec la CSP de production, desktop et
  mobile: globe, arcs, avions, survol, et clic EDI qui plonge puis ouvre
  `/voyage/ecosse-2026`. OpenFreeMap etant bloque dans le bac a sable, la
  capture utilisait un fond de substitution (ombrage du relief AWS).
- Corrige au passage: un echec de tuile avant la fin du chargement faisait
  basculer la carte des carnets sur son repli; seul l'echec du style compte.
- 2026-10-29: `voyage-trips.ts` est supprime (plan 080). Le globe lit
  desormais le catalogue depuis `GET /api/voyages`; les voyages passes
  (Albanie, Roumanie, Grande Canarie) et le depart reel de l'Ecosse (CRL)
  sont repris en base par `npm run db:seed:voyages -w server`. Il n'y a pas
  eu de voyage en Islande: il est retire, la question de son statut ne se
  pose plus. Les trois derniers points du Todo sont traites par le plan 080.
