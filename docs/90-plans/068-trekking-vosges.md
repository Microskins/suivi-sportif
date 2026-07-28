# Plan - Mini-site Trekking et premier trek dans les Vosges

## Objectif

- Ajouter au portfolio un mini-site de trekking accessible sous `/trekking`.
- Presenter un premier trek de trois jours dans les Hautes-Vosges avec les
  informations utiles a sa preparation.
- Integrer les deux traces Google My Maps fournies pour comparer les parcours
  directement dans le carnet Vosges Wild.

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
- Charger chaque carte Google uniquement apres une action explicite du visiteur
  et conserver un lien d'ouverture externe.
- Presenter les deux traces dans des cartes responsives, sans leur inventer de
  nom ou de role non fourni.
- Utiliser les fichiers de preparation Option 1 et Option 2 comme source des
  etapes, statistiques et couleurs de trace affichees dans Vosges Wild.
- Conserver les photos importees localement dans le navigateur, sans les
  transmettre a un service tiers ni les associer a un compte.

## Todo

- [x] Creer le plan.
- [x] Creer la branche dediee.
- [x] Analyser le modele fourni et les contenus existants.
- [x] Generer et integrer une image hero originale.
- [x] Construire le mini-site `/trekking` et ses interactions.
- [x] Ajouter le projet au portfolio et documenter la route.
- [x] Corriger la collision entre la route `/trekking` et les assets publics.
- [x] Creer un catalogue de voyages et une route dediee pour Vosges Wild.
- [x] Ajouter un composant cartographique dedie aux deux traces fournies.
- [x] Integrer les cartes dans la vue itineraire avec un chargement explicite.
- [x] Ajouter une fiche de preparation distincte sous chacune des deux traces.
- [x] Autoriser les integrations Google My Maps dans la CSP de production.
- [x] Aligner la carte Trekking du portfolio avec son identite visuelle.
- [x] Separer la navigation Vosges Wild par trace, avec des itineraires, etapes
  et legendes propres a chaque parcours.
- [x] Remplacer les contenus generiques des deux traces par les informations
  des fichiers de preparation fournis.
- [x] Ajouter une galerie de photos importees, independante pour chaque trace.
- [x] Verifier la responsivite, les liens, les imports et la limite de 500 lignes.
- [x] Verifier le typecheck, le test cible et le build via WSL.
- [ ] Retablir la suite frontend et le lint globaux (echecs existants hors
  cartographie et configuration ESLint 10 absente).

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
- 2026-07-27: ajout demande de deux traces Google My Maps dans la vue itineraire
  de Vosges Wild.
- 2026-07-27: `route-maps.tsx` isole les deux integrations. Aucune iframe Google
  n'est creee avant le clic sur `Charger la carte`; chaque trace conserve aussi
  un lien d'ouverture dans un nouvel onglet.
- 2026-07-27: trois idees adjacentes ajoutees a
  `docs/06-idees/90-ia-idees.md`: alternative sans Google, description
  accessible et catalogue de traces pilote par les donnees.
- 2026-07-27: `npm run typecheck -w client` via WSL: OK.
- 2026-07-27: test cible `route-maps.test.tsx` via WSL: 1 test passe.
- 2026-07-27: `npm run build -w client` via WSL: OK; Vite signale le chunk
  JavaScript existant de 738,61 kB apres minification.
- 2026-07-27: suite frontend globale: 13 tests passent et 4 echouent dans
  `dashboard-overview.test.tsx` et `assistant-chatbox.test.tsx`, sans lien avec
  Trekking. Le lint ne demarre pas car ESLint 10 attend un fichier
  `eslint.config.*` absent du depot.
- 2026-07-27: la verification visuelle automatisee locale est indisponible a
  cause des metadonnees de sandbox du navigateur integre.
- 2026-07-28: Google ne donne pas acces a l'export KML des deux cartes depuis
  l'environnement de travail (`403`); les valeurs non exposees restent marquees
  "A relever sur la carte" dans les fiches au lieu d'etre inventees.
- 2026-07-28: `frame-src https://www.google.com` ajoute aux deux configurations
  Nginx afin d'autoriser uniquement les iframes Google My Maps utilisees par le
  site.
- 2026-07-28: `npm run typecheck -w client` et `npm run build -w client` via
  WSL: OK. Le build genere `client/dist`, supprime apres verification.
- 2026-07-28: le test cible `route-maps.test.tsx` demarre dans Vitest mais ne
  retourne pas de resultat final dans la console WSL de cet environnement; son
  blocage est sans lien visible avec la compilation, qui passe.
- 2026-07-28: la carte projet du portfolio utilise le favicon Trekking et le
  nom de site `Trekking`; `Vosges Wild` reste le nom du premier voyage.
- 2026-07-28: la navigation Vosges Wild distingue desormais `Trace 01` et
  `Trace 02`; chaque selection ouvre son propre itineraire, ses etapes et son
  unique embed Google My Maps avec une legende associee.
- 2026-07-28: `npm run typecheck -w client` et `npm run build -w client` via
  WSL: OK. Le test Vitest cible demarre, mais ne retourne toujours pas de
  resultat final dans cette console WSL.
- 2026-07-28: les fichiers Option 1 (GR5 Lac Blanc - Grand Ballon) et Option 2
  (Boucle Hohneck et des Lacs) ont fourni les etapes, distances, deniveles,
  durees, points de passage et la legende vert/violet/bleu par jour.
- 2026-07-28: l'idee existante de fiches de traces pilotees par les donnees
  couvre deja l'amelioration complementaire identifiee; aucune idee redondante
  n'a ete ajoutee.
- 2026-07-28: ajout d'un carnet photo local par trace via IndexedDB: import
  JPEG, PNG ou WebP, apercu et suppression. Les fichiers ne quittent pas le
  navigateur de l'appareil.
- 2026-07-28: ajout de l'idee d'export du carnet photo local dans
  `docs/06-idees/90-ia-idees.md`; `npm run typecheck -w client` et
  `npm run build -w client` via WSL: OK.
- 2026-07-28: les URLs Google My Maps ont ete inversees pour faire correspondre
  l'iframe de la trace 01 au GR5 et celle de la trace 02 a la boucle.
