# Plan - Comparateur de prix alimentaires

## Objectif

- Ajouter un nouveau mini-site public accessible sous `/prix-aliments`.
- Permettre de rechercher un aliment et de comparer rapidement ses prix chez
  Carrefour, Intermarche, ALDI et Colruyt.
- Livrer un MVP honnete et testable avec des donnees de demonstration, pret a
  recevoir ensuite des releves reels par magasin et par zone geographique.
- Ancrer la comparaison sur la zone utilisateur `59278` et les quatre points de
  vente choisis autour d'Escautpont.

## Decisions

- Conserver le client React/Vite et l'architecture multi-sites existants.
- Appliquer la direction visuelle validee "Ticket de caisse": un recu central
  de 640 px maximum sur fond comptoir, une seule police JetBrains Mono, des
  separateurs pointilles et des listes de lignes sans cartes.
- Reserver strictement le vert `#3f7d52` au signal "meilleur prix"; utiliser
  l'encre noire, le gris et le rouge pour tous les autres etats.
- Utiliser un catalogue TypeScript local normalise pour cette premiere version,
  sans scraping fragile ni prix presentes comme des donnees temps reel.
- Afficher pour chaque offre le prix total, le prix unitaire, la promotion
  eventuelle, le magasin le moins cher et la date de releve.
- Gerer la recherche et le filtre de categorie dans un store Zustand dedie.
- Garder chaque fichier maintenu sous 500 lignes et tous les styles dans les
  classes Tailwind ou les couches CSS communes.
- Conserver les points de vente dans un catalogue local dedie, avec un lien vers
  chaque fiche officielle et une mention explicite lorsque la ville demandee
  differe de l'adresse officielle trouvee.

## Todo

- [x] Creer ce plan et la branche dediee.
- [x] Auditer l'architecture multi-sites et les plans proches.
- [x] Ajouter le catalogue de demonstration et l'etat de recherche.
- [x] Construire l'interface responsive du comparateur.
- [x] Ajouter l'identite, la route et le favicon du mini-site.
- [x] Mettre a jour les docs sources de verite.
- [x] Ajouter les tests cibles de recherche, routeur et identite.
- [x] Verifier le typecheck, les tests, la taille des fichiers et le build.
- [x] Ajouter la zone 59278 et les quatre points de vente verifies.
- [x] Afficher les magasins selectionnes dans l'interface et dans chaque offre.
- [x] Tester et documenter la configuration locale.
- [x] Corriger le nom du nouveau fichier de skill en `SKILL.md`.
- [x] Refaire la coque, la recherche et les magasins dans la DA Ticket de caisse.
- [x] Refaire les resultats comme des lignes de recu avec meilleur prix exclusif.
- [x] Mettre a jour les tests et les docs de direction artistique.
- [x] Revalider le typecheck, les tests, la taille et le build apres la refonte.
- [ ] Verifier visuellement le rendu desktop et mobile dans le navigateur local.

## Notes de verification

- 2026-08-17: branche `feat/comparateur-prix-aliments` creee depuis
  `feat/projet-voyage`; le worktree etait propre avant le changement.
- 2026-08-17: aucun plan ni fichier client existant ne couvre la comparaison de
  prix; le plan `069` fournit l'architecture multi-sites a conserver.
- 2026-08-17: quatre idees complementaires non engagees ont ete ajoutees a
  `docs/06-idees/90-ia-idees.md`: collecte planifiee, localisation, scan de
  code-barres et optimisation de panier.
- 2026-08-17: ajout de `/prix-aliments`, de l'identite navigateur, du favicon,
  du catalogue local de 8 produits, du store de recherche Zustand et de
  l'interface responsive Prix Frais. Chaque offre affiche le prix total, le prix
  unitaire, la promotion, le meilleur tarif et la date du releve.
- 2026-08-17: le portfolio reference Prix Frais comme quatrieme entree, dans sa
  DA editoriale existante. Le fichier `assets/reference.html` mentionne par le
  skill portfolio est absent; la page validee existante a servi de reference.
- 2026-08-17: `README.md`, les docs d'architecture, de structure et de
  deploiement documentent la nouvelle route publique et le statut de donnees de
  demonstration.
- 2026-08-17: typecheck client OK avec TypeScript sous Node 24.
- 2026-08-17: tests cibles OK (3 fichiers, 9 tests), puis suite frontend complete
  OK (10 fichiers, 29 tests).
- 2026-08-17: controle de taille OK (109 fichiers, aucun au-dessus de 500
  lignes) et `git diff --check` OK.
- 2026-08-17: build client Vite OK apres ajout local des binaires Windows
  Rolldown et Lightning CSS manquants dans `node_modules`; avertissement
  preexistant sur le chunk principal de 787,01 kB minifie. Le dossier
  `client/dist` genere a ete supprime apres verification.
- 2026-08-17: la route `/prix-aliments` repond avec un statut HTTP 200 sur le
  serveur Vite local.
- 2026-08-17: le lint ne peut pas etre execute: ESLint 8.57.1 ne trouve aucune
  configuration dans le depot; le typecheck, les tests et le build restent
  valides.
- 2026-08-17: verification visuelle desktop/mobile bloquee: le navigateur
  integre refuse de demarrer car la metadonnee `sandboxPolicy` manque. Aucun
  moteur externe n'a ete utilise conformement au skill navigateur.
- 2026-08-17: l'utilisateur a choisi la zone `59278`, Intermarche Escautpont,
  Carrefour Conde-sur-l'Escaut, Colruyt Peruwelz et ALDI secteur Escautpont.
  Les fiches officielles confirment les trois premiers points de vente; le
  localisateur ALDI situe le magasin voisin a Fresnes-sur-Escaut et non dans la
  commune d'Escautpont.
- 2026-08-17: trois idees complementaires ont ete ajoutees a
  `docs/06-idees/90-ia-idees.md`: comparaison transfrontaliere, score
  d'equivalence produit et controle de validite des points de vente.
- 2026-08-17: ajout d'un catalogue local de magasins avec les fiches officielles
  Intermarche Super Escautpont (10 rue Jean Jaures), Carrefour
  Conde-sur-l'Escaut (avenue de la Liberte, Le Tourniquet), ALDI
  Fresnes-sur-Escaut (260 rue Jean Jaures) et Colruyt Peruwelz New (rue Neuve
  Chaussee 157). L'interface explique la correction de commune pour ALDI et le
  caractere transfrontalier de Colruyt.
- 2026-08-17: les cartes magasin affichent le pays, l'adresse, le lien vers la
  fiche officielle et la zone 59278. Chaque ligne de prix mentionne maintenant
  la ville exacte du point de vente.
- 2026-08-17: recherche de faisabilite des catalogues reels: Carrefour publie un
  prix dependant du magasin et du mode de retrait, ALDI publie des prix produit
  nationaux, Intermarche expose les fiches produit sans prix directement lisible
  et Colruyt indique que ses prix peuvent varier plusieurs fois par jour. Une
  collecte serveur par connecteur reste necessaire avant de supprimer le statut
  de demonstration.
- 2026-08-17: typecheck client, suite frontend complete (10 fichiers, 30 tests)
  et controle de taille (111 fichiers sous 500 lignes) OK.
- 2026-08-17: build Vite OK (722 modules); avertissement existant sur le chunk
  principal de 791,87 kB minifie. Le dossier `client/dist` a ete supprime apres
  verification.
- 2026-08-17: `/prix-aliments` repond HTTP 200 sur le serveur de preview local.
  La verification visuelle reste bloquee par l'absence de la metadonnee
  `sandboxPolicy` du navigateur integre; le serveur local a ete arrete.
- 2026-08-17: le skill utilisateur `comparateur-da-ticket` a ete lu puis son
  fichier `SKIL.md` renomme en `SKILL.md` pour permettre sa detection future.
  Les references `assets/reference-accueil.html` et
  `assets/reference-resultat.html` citees par le skill sont absentes; les regles
  detaillees du `SKILL.md` servent de source de verite pour la refonte.
- 2026-08-17: trois idees complementaires ont ete ajoutees a la roadmap IA:
  impression du ticket, recherche partageable et controle du signal meilleur
  prix en monochrome.
- 2026-08-17: refonte complete appliquee selon le skill
  `comparateur-da-ticket`: recu unique centre de 640 px, fond comptoir, papier
  clair, JetBrains Mono pour toute l'interface, bordures externes en tirets,
  separateurs internes pointilles, recherche rectangulaire et code-barres
  decoratif en pied de ticket.
- 2026-08-17: les points de vente et le mode d'emploi sont des listes de lignes,
  sans cartes. Les offres produit utilisent aussi des lignes de recu; seul le
  meilleur prix emploie `#3f7d52` et `#eaf3ec`, avec etoile, libelle et bordure
  pour que le statut ne depende pas uniquement de la couleur.
- 2026-08-17: favicon, couleur navigateur et documentation d'architecture
  alignes sur la DA Ticket de caisse.
- 2026-08-17: typecheck client, 30 tests frontend et controle de taille (111
  fichiers sous 500 lignes) OK apres refonte. Les tests verifient la presence du
  recu et d'une seule ligne meilleur prix par produit affiche.
- 2026-08-17: build Vite OK (722 modules, chunk principal 783,00 kB minifie avec
  l'avertissement de taille existant). `/prix-aliments` repond HTTP 200 en
  preview; `client/dist` a ete supprime et le serveur arrete.
- 2026-08-17: la verification visuelle reste bloquee par la metadonnee
  `sandboxPolicy` manquante du navigateur integre; aucun moteur externe n'a ete
  utilise conformement au skill navigateur.
- 2026-08-17: publication preparee sur la branche
  `feat/comparateur-prix-aliments` apres validation de l'authentification
  GitHub, du perimetre des fichiers et de l'absence de secret detecte.
