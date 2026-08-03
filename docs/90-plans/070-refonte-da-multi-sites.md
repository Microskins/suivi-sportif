# Plan - Refonte DA multi-sites

## Objectif

- Refaire les interfaces du portfolio, de Trekking et de Suivi Sportif en
  appliquant les trois nouvelles directions artistiques du depot.
- Conserver les parcours, donnees, routes et comportements existants.
- Assurer une identite nettement differenciee, responsive et accessible pour
  chaque surface.

## Decisions

- Appliquer `suivi-sportif-portfolio-da` au portfolio racine, dans le langage
  visuel "Catalogue editorial".
- Appliquer `suivi-sportif-trekking-da` a `/trekking` et a ses pages voyage,
  dans le langage visuel "Carte topo / panorama".
- Appliquer `suivi-sportif-app-da` a `/suivi-sportif`, dans le langage visuel
  chaleureux "Energie".
- Les nouvelles directions artistiques remplacent les choix visuels sombres du
  plan `069-arborescence-frontend-multi-sites`; son architecture reste valide.
- Centraliser les tokens et composants visuels partages par une meme surface
  dans les couches Tailwind du client, sans coupler les trois sites.
- Ne pas modifier les contrats API, les stores Zustand ni les donnees metier.
- Conserver les noms de fichiers en kebab-case et la limite de 500 lignes par
  fichier maintenu.

## Todo

- [x] Creer ce plan et la branche dediee.
- [x] Auditer les nouvelles DA, les ecrans existants et les plans proches.
- [x] Aligner les tokens globaux, les polices et les metadonnees de couleur.
- [x] Refaire le portfolio dans la DA catalogue editorial.
- [x] Refaire l'accueil et la page voyage Trekking dans la DA carte topo.
- [x] Refaire le shell et les ecrans principaux de Suivi Sportif dans la DA
  Energie.
- [x] Harmoniser les ecrans secondaires, formulaires et etats interactifs de
  Suivi Sportif.
- [x] Verifier statiquement le responsive, l'accessibilite, les frontieres de
  sites et la limite de taille des fichiers.
- [ ] Verifier visuellement les trois sites en desktop et mobile (bloque par
  les metadonnees de sandbox du navigateur integre).
- [x] Lancer le typecheck, les tests frontend et le build.

## Notes de verification

- 2026-07-31: branche `feat/refonte-da-multi-sites` creee depuis `main` en
  conservant les modifications de skills deja presentes dans le worktree.
- 2026-07-31: le plan `069` couvre l'architecture multi-sites mais ses choix de
  DA sont remplaces par les nouveaux skills; un plan distinct evite de
  reecrire l'historique.
- 2026-07-31: les fichiers de reference HTML cites dans les trois skills ne
  sont pas presents dans leurs dossiers; les regles detaillees des `SKILL.md`
  servent donc de source de verite.
- 2026-07-31: trois idees complementaires et non engagees ont ete ajoutees a
  `docs/06-idees/90-ia-idees.md`.
- 2026-07-31: les sept familles typographiques sont chargees localement via
  Fontsource; les tokens et couleurs de navigateur suivent desormais chaque DA.
- 2026-07-31: le portfolio adopte une grille de catalogue sans cartes
  arrondies, avec header d'edition, hero editorial, lede a lettrine et entrees
  numerotees.
- 2026-07-31: Trekking adopte un panorama fondu dans le parchemin, des
  metriques superposees en pastilles, des etapes numerotees, des contenus sans
  angles arrondis et les cartes de decision prescrites par la DA.
- 2026-07-31: Suivi Sportif adopte la DA Energie sur l'authentification, le
  shell a sidebar, la synthese, le calendrier, les primitives de formulaire,
  les ecrans secondaires, le chat IA et les ecrans cookies.
- 2026-07-31: les metriques avec objectif utilisent des anneaux SVG en
  degrade; les progressions lineaires, CTA, etats vides et actions rapides
  suivent les composants signature du skill.
- 2026-07-31: `npm run typecheck -w client`: OK.
- 2026-07-31: `npm run test -w client -- --run`: 6 fichiers et 18 tests
  passent. Le nettoyage DOM a ete ajoute aux tests modifies pour supprimer
  l'empilement deja documente.
- 2026-07-31: `npm run check:file-size`: 93 fichiers controles, aucun au-dessus
  de 500 lignes.
- 2026-07-31: `npm run build -w client`: OK. Le build conserve l'avertissement
  existant sur le chunk JavaScript principal de 746,53 kB; les fontes sont
  auto-hebergees et limitees aux sous-ensembles latins.
- 2026-07-31: `npm run lint -w client` reste bloque avant analyse du code car
  ESLint 10 ne trouve pas de fichier `eslint.config.*`, probleme deja signale
  par les plans precedents.
- 2026-07-31: la verification visuelle via le skill navigateur est bloquee par
  l'absence de la metadonnee `sandboxPolicy` dans cet environnement; aucun
  moteur alternatif n'a ete utilise conformement aux instructions du skill.
- 2026-07-31: `git diff --check` passe sans erreur et `client/dist` a ete
  supprime apres le build.
