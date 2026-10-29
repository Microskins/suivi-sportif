# Plan - Carnet Ecosse et carte 3D

## Objectif

- Ajouter le voyage en Ecosse du 19 au 27 octobre 2026 au site Voyage, sous
  `/voyage/ecosse-2026`.
- Retracer le trajet sur une carte interactive avec les infos de chaque etape
  et des photos.
- Tester plusieurs modeles de carte de l'Ecosse, dont des rendus 3D.

## Decisions

- MapLibre GL JS (`~6.13.0`, open source, sans cle d'API) plutot que Mapbox ou
  Cesium, qui exigent un compte et un jeton.
- Trois modeles comparables depuis la page:
  - Plan 2D: style vectoriel OpenFreeMap `positron`;
  - Relief 3D: style OpenFreeMap `liberty`, terrain AWS Terrain Tiles
    (encodage terrarium, exageration 1,6) et ombrage;
  - Satellite 3D: imagerie Esri World Imagery drapee sur le meme terrain.
- MapLibre est charge par `import()` dans `trip-map-engine.ts`: le bundle
  principal des autres sites n'embarque pas la carte. Le worker est servi
  depuis notre origine (`?url` + `setWorkerUrl`), la CSP garde donc
  `worker-src 'self'`.
- La CSP Nginx autorise en `connect-src` les trois fournisseurs de tuiles et
  `blob:` en `img-src`.
- Toutes les donnees du carnet (etapes, trace, photos) vivent dans
  `ecosse-2026-data.ts`; distances et statistiques en sont derivees.
- Sans WebGL ou si le style ne charge pas, la carte affiche un repli textuel;
  la feuille de route reste consultable. `prefers-reduced-motion` remplace le
  rejeu anime par une vue d'ensemble.
- Marqueurs d'etape en boutons HTML (clavier), depart en encre, etapes en bleu,
  trace en tirets: regles de la DA Boarding Pass.

## Todo

- [x] Donnees, page, carte, routes, billet sur l'accueil Voyage.
- [x] Tests (routeur, page, continuite du trace), typecheck, lint, build,
  controles taille / frontieres / contraste.
- [x] Verification navigateur desktop et mobile avec la CSP de production.
- [x] Support des traces GPS (GPX Strava, Garmin, Komoot...), en deux types:
  - `trajet` (route de A a B): trait plein bleu qui remplace le trace
    reconstitue de l'etape; seule la distance reelle est affichee, et elle
    alimente la distance de l'etape et du voyage;
  - `randonnee`: trait plein colore par altitude (sarcelle -> orange),
    cadrage sur la boucle, distance, D+, duree et profil altimetrique.
  Les etapes sans trajet GPS gardent le trace reconstitue en tirets.
- [ ] Deposer les GPX dans `client/public/sites/voyage/ecosse-2026/traces/`
  et les referencer dans `gpx` de l'etape concernee. Les fichiers sont
  publies tels quels (pas de depart depuis le domicile a masquer).
- [ ] Remplacer l'itineraire provisoire par le trajet reel (etapes, dates).
- [ ] Deposer les photos dans `client/public/sites/voyage/ecosse-2026/` et les
  referencer dans `photos`.
- [ ] Choisir le modele de carte par defaut apres comparaison.

## Notes de verification

- 2026-10-29: l'itineraire est une proposition plausible (Edimbourg, Glencoe,
  Skye, Loch Ness, Cairngorms) en attendant le trajet reel.
- 2026-10-29: rendu verifie dans Chromium (SwiftShader) avec la CSP de
  production: relief 3D, zoom sur etape, rejeu anime et cadrage mobile OK.
  Le bac a sable bloquait OpenFreeMap et Esri: le fond vectoriel et
  l'imagerie satellite n'ont pas pu etre vus, le terrain AWS si.
- 2026-10-29: traces GPS ajoutees. Les services de calcul d'itineraire
  (OSRM, Valhalla) sont bloques dans le bac a sable: impossible d'y caler le
  trace sur les routes, d'ou le choix des GPX reels. Rendu verifie avec deux
  GPX de demonstration non commites (trajet et randonnee).
- 2026-10-29: depuis le plan 080, les donnees du carnet sont en base et non
  plus dans `ecosse-2026-data.ts` (supprime; ses calculs de distance vivent
  dans `trip-geometry.ts`). GPX et photos s'envoient depuis `/voyage/admin`, plus
  dans `client/public/sites/voyage/ecosse-2026/`: les points du Todo qui
  citent ces dossiers sont remplaces par cet envoi.

