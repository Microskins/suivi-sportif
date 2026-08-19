# Plan - Mise a jour des docs sources de verite

## Objectif

- Troisieme et dernier chantier de la refonte demandee: architecture
  (plan 074), UX/UI (plan 075), puis **documentation**.
- Remettre les docs actives en accord avec le depot, apres deux chantiers qui
  ont ajoute des fichiers, des scripts et des conventions.
- Ne pas reecrire ce qui est deja juste: l'audit ci-dessous liste precisement
  ce qui est decale, le reste n'est pas touche.

## Audit du 2026-08-19

Verifie contre le depot, pas contre les souvenirs des chantiers precedents.

### `docs/INDEX.md` — le plus decale

- L'arborescence omet `06-idees/` et `07-qualite/`, qui existent pourtant et
  sont references depuis d'autres docs.
- Elle annonce deux plans alors que `90-plans/` en contient **76**.
- « Etat du projet » decrit encore un frontend unique: aucune mention du
  decoupage en cinq sites, pourtant en place depuis le plan 069.
- « Source de verite » omet `06-idees/` et `07-qualite/`.

### `docs/02-architecture/` — a jour sur le multi-sites, pas sur les phases 1 et 2

Ces deux fichiers documentent correctement le decoupage en sites, mais aucun
ne mentionne ce que les plans 074 et 075 ont ajoute:

- `server/src/lib/api-response.ts` et la fonction `authenticate` partagee;
- la pagination des routes de liste;
- `client/src/tokens.css` et `client/src/app/skip-link.tsx`;
- `eslint.config.js` par workspace.

### `docs/01-getting-started/quick-start.md`

- Liste les commandes de verification mais ignore les trois controles du
  depot (`check:file-size`, `check:site-boundaries`, `check:contrast`).
- Ne mentionne pas `npm run lint`, qui etait casse et fonctionne depuis le
  plan 074.

### Deja a jour, non touche

- `README.md`, verifie pendant le plan 074.
- `docs/03-api/reference.md`, mis a jour par le plan 074 (pagination, codes
  d'erreur, endpoints workout-templates).
- `docs/07-qualite/checklist-ui-accessibilite.md`, etendu aux cinq sites par
  le plan 075.
- `docs/90-plans/README.md`, dont l'index suit les chantiers.

## Decisions

- Corriger les documents decales, sans reecrire ceux qui sont justes: la
  valeur est dans l'exactitude, pas dans le volume.
- Ne pas recopier dans `INDEX.md` la liste des 76 plans: elle vivrait mal et
  redoublerait `90-plans/README.md`. L'arborescence indiquera le dossier et
  renverra vers son index.
- Documenter les trois controles au meme endroit et de la meme facon, pour
  qu'ils soient lances ensemble plutot qu'oublies un par un.

## Todo

- [x] Creer ce plan et la branche dediee `docs/mise-a-jour-sources-verite`.
- [x] Mettre a jour `docs/INDEX.md` (arborescence, etat du projet, sources).
- [x] Completer `docs/02-architecture/` avec les apports des plans 074 et 075.
- [x] Completer `docs/01-getting-started/quick-start.md` (lint et controles).
- [x] Verifier: liens internes valides, commandes citees reellement
      existantes, et controles du depot au vert.

## Notes de verification

- 2026-08-19: plan cree, branche `docs/mise-a-jour-sources-verite` creee
  depuis `main` a jour (commit `573f845`, merge de la PR #36).
- 2026-08-19: `docs/INDEX.md` corrige. L'arborescence declare desormais
  `06-idees/` et `07-qualite/`, et renvoie vers l'index des chantiers au lieu
  d'annoncer deux plans quand le dossier en contient 76. « Etat du projet »
  decrit le decoupage en cinq sites, la pagination et la centralisation des
  reponses API. Une section liste les trois controles du depot, pour qu'ils
  soient lances ensemble plutot qu'oublies un par un.
- 2026-08-19: la regle de maintenance gagne un point sur les skills de
  `.agents/skills/`. Les plans 074 et 075 ont tous deux du corriger des skills
  qui documentaient un projet disparu; autant l'inscrire dans la regle plutot
  que de le redecouvrir.
- 2026-08-19: `02-architecture/overview.md` complete avec les apports des deux
  chantiers precedents: helpers de `lib/api-response.ts`, pagination et son
  parametre optionnel cote queries, hook `authenticate` et la raison pour
  laquelle `fastify.authenticate` ne peut pas servir, `skip-link.tsx` et
  `tokens.css` avec la distinction fond/texte des couleurs de signature.
- 2026-08-19: `02-architecture/project-structure.md` complete: `lib/` et
  `services/` dans l'arborescence serveur, les trois nouveaux fichiers client,
  et `npm run check:contrast` avec sa limite explicite — il ne voit que les
  tokens, pas le rendu.
- 2026-08-19: `01-getting-started/quick-start.md` complete avec `npm run lint`
  (casse jusqu'au plan 074) et les trois controles du depot.
- 2026-08-19: verification des liens internes de toutes les docs actives.
  Un seul cas signale, `./06-%20chatbox-ia.md`, s'est revele **valide**:
  `%20` est l'encodage correct d'un espace. Le controle avait produit un faux
  positif faute de decoder l'URL.
  Le fichier a tout de meme ete renomme `06-chatbox-ia.md` (via `git mv`,
  historique conserve) et son lien mis a jour: il etait le seul du dossier a
  porter un espace, a rebours de la convention des autres fichiers d'idees.
- 2026-08-19: verification que **toutes** les commandes `npm run` citees dans
  les docs existent reellement dans un `package.json` du depot. Aucune
  introuvable.
- 2026-08-19: verification finale: 188 et 45 tests, lint sortie 0, build OK,
  les trois controles au vert. Artefacts `dist` supprimes apres verification.
