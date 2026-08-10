# Plan - Integration du projet Voyage

## Objectif

- Ajouter un quatrieme mini-site public accessible sous `/voyage`.
- Presenter un premier carnet concret sous `/voyage/islande-2026`.
- Integrer le projet Voyage au portfolio sans melanger sa direction artistique
  avec celles de Trekking, Suivi Sportif et du portfolio.

## Decisions

- Conserver le client React/Vite et l'architecture multi-sites existants.
- Appliquer la direction artistique Voyage "Boarding Pass": fond clair, encre
  bleu nuit, typographies Space Grotesk et JetBrains Mono, cartes billet avec
  talon sombre et separation perforee.
- Utiliser des donnees locales et publiques pour cette premiere version, sans
  API, compte utilisateur, reference de reservation ni lien prive invente.
- Ajouter une page catalogue `/voyage` et une page detail
  `/voyage/islande-2026` avec trajet, statistiques, carte schematique, etapes
  et cartes de preparation des reservations.
- Garder chaque fichier maintenu sous 500 lignes et tous les styles dans les
  classes Tailwind ou les couches CSS communes.

## Todo

- [x] Creer ce plan et la branche dediee.
- [x] Auditer l'architecture multi-sites, la DA Voyage et les plans proches.
- [x] Ajouter l'identite, les routes et les composants du mini-site Voyage.
- [x] Ajouter Voyage au portfolio et mettre a jour les docs sources de verite.
- [x] Ajouter les tests cibles du routeur et de l'identite du site.
- [x] Verifier le typecheck, les tests frontend, la taille des fichiers et le
  build.
- [ ] Verifier le rendu desktop et mobile dans le navigateur local.

## Notes de verification

- 2026-08-10: branche `feat/projet-voyage` creee depuis `main`; le dossier non
  suivi `.agents/skills/suivi-sportif-voyage-da/` est conserve sans
  modification.
- 2026-08-10: aucun plan ni fichier client existant ne couvre le site Voyage;
  le plan `069` fournit l'architecture multi-sites et le plan `070` les regles
  de separation des directions artistiques.
- 2026-08-10: les fichiers HTML cites par le skill Voyage sont absents; son
  `SKILL.md` sert de source de verite visuelle, comme deja documente par le plan
  `070` pour les autres directions artistiques.
- 2026-08-10: trois idees complementaires non engagees ont ete ajoutees a
  `docs/06-idees/90-ia-idees.md`: catalogue valide, coffre prive de
  reservations et carnet hors ligne.
- 2026-08-10: ajout de `/voyage` et `/voyage/islande-2026`, de l'identite
  navigateur, du favicon, des fontes locales et des composants billet, carte,
  itineraires et reservations conformes a la DA Boarding Pass.
- 2026-08-10: le portfolio presente desormais trois projets; `README.md`, la
  documentation d'architecture, de structure et de deploiement referencent le
  quatrieme mini-site et ses deux routes publiques.
- 2026-08-10: les tests cibles `site-identities.test.ts` et
  `site-router.test.tsx` passent sous Node 22: 2 fichiers et 4 tests valides.
- 2026-08-10: `npm run typecheck -w client`: OK sous Node 22.
- 2026-08-10: `npm run test -w client -- --run`: 9 fichiers et 24 tests
  passent, dont les deux tests DOM des vraies pages Voyage.
- 2026-08-10: `npm run check:file-size`: 101 fichiers controles, aucun au-dessus
  de 500 lignes. Prettier et `git diff --check` passent egalement.
- 2026-08-10: `npm run build -w client`: OK; l'avertissement existant sur le
  chunk JavaScript principal reste present (763,45 kB minifie). Le dossier
  `client/dist` genere a ete supprime apres verification.
- 2026-08-10: `/voyage`, `/voyage/islande-2026` et le favicon Voyage repondent
  tous avec un statut HTTP 200 sur le serveur Vite local.
- 2026-08-10: la verification visuelle desktop/mobile reste bloquee: le skill
  navigateur ne peut pas demarrer car la metadonnee `sandboxPolicy` manque
  dans l'environnement. Aucun moteur alternatif n'a ete utilise conformement
  aux instructions du skill.
