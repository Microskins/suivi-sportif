# Plan - Arborescence frontend multi-sites

## Objectif

- Separer clairement le portfolio, Suivi Sportif et Trekking dans
  l'arborescence du client.
- Rendre les responsabilites et les imports plus faciles a lire sans modifier
  les URLs publiques ni le comportement metier.
- Ramener tous les fichiers maintenus dans `client/src` sous la limite projet de
  500 lignes et automatiser ce controle.
- Donner a chaque site une identite visuelle et des metadonnees propres tout en
  conservant le socle React/Vite commun.

## Decisions

- Conserver un seul workspace et un seul build React/Vite pour ne pas modifier
  le deploiement Nginx actuel.
- Reserver `client/src/app` au choix du site selon l'URL.
- Ranger chaque site dans `client/src/sites/<site>` avec ses composants, ses
  stores, ses donnees et ses integrations propres.
- Ne placer dans `client/src/shared` que du code reellement utilise par plusieurs
  sites; aucun site ne doit importer les fichiers internes d'un autre site.
- Utiliser des noms de fichiers en kebab-case et conserver les composants React
  en PascalCase.
- Fractionner les API, mocks et composants qui depassent 500 lignes, sans
  changement fonctionnel.
- Lier ce chantier au plan `036-angle-technique-dette-maintenance.md`, qui reste
  la source de la regle des 500 lignes.
- Centraliser les metadonnees de site dans `client/src/app`, sans y placer les
  composants visuels propres a chaque marque.
- Adopter trois directions distinctes:
  - portfolio editorial, ivoire, encre et accent vermillon;
  - Suivi Sportif technique, sombre et energique avec accent citron;
  - Trekking organique, nocturne et inspire des cartes topographiques.
- Utiliser des fontes systeme expressives pour eviter une dependance distante et
  garder un affichage rapide et respectueux de la vie privee.

## Todo

- [x] Creer ce plan et la branche dediee.
- [x] Cartographier les sites, les imports et les fichiers frontend trop longs.
- [x] Creer la nouvelle arborescence `app` et `sites`, et reserver `shared` au
  futur code reellement commun.
- [x] Deplacer et isoler le portfolio, Suivi Sportif et Trekking.
- [x] Fractionner les fichiers frontend qui depassent 500 lignes.
- [x] Ajouter un controle automatise de la limite des 500 lignes.
- [x] Mettre a jour la documentation d'architecture et de structure.
- [x] Verifier les chemins, frontieres de sites, assets et tailles de fichiers.
- [x] Ajouter le registre d'identite et les metadonnees dynamiques par route.
- [x] Ajouter une signature de marque et une typographie propres a chaque site.
- [x] Ajouter un favicon vectoriel distinct par site.
- [x] Documenter et verifier les identites sans depasser 500 lignes.
- [ ] Verifier le typecheck, les tests, le lint et le build client (bloque par
  Node.js absent).

## Notes de verification

- 2026-07-27: branche `refactor/frontend-sites-structure` creee depuis `main`
  propre.
- 2026-07-27: audit initial: trois sites sont melanges dans
  `client/src/components`, les stores de Trekking et de Suivi Sportif partagent
  le meme dossier, et `App.tsx` combine routage, authentification et rendu.
- 2026-07-27: quatre fichiers depassent la limite dans `client/src`:
  `api/client.ts` (768 lignes), `stores/bypassMockData.ts` (619 lignes),
  `components/Dashboard.tsx` (581 lignes) et
  `components/dashboard/MealForm.tsx` (545 lignes).
- 2026-07-27: idees complementaires ajoutees a
  `docs/06-idees/90-ia-idees.md`.
- 2026-07-27: le routeur est reduit au choix du site; les trois sites vivent
  sous `client/src/sites` et leurs assets sous `client/public/sites`.
- 2026-07-27: aucun module partage concret n'a ete identifie. Le dossier
  `client/src/shared` n'est donc pas cree tant que deux sites n'utilisent pas le
  meme contrat.
- 2026-07-27: `api/client.ts` est fractionne avec `api/types.ts`, les donnees
  bypass objectifs/mensurations sont extraites et les helpers du dashboard et
  du formulaire repas ont leurs propres fichiers.
- 2026-07-27: audit PowerShell valide: 82 fichiers dans `client/src`, aucun
  au-dessus de 500 lignes (maximum 494), noms kebab-case hors fichier Vite
  genere, imports relatifs resolus et aucun import direct entre sites.
- 2026-07-27: catalogue public valide apres deplacement: 163 exercices, 63
  images PNG existantes, deux silhouettes et l'image Trekking presentes.
- 2026-07-27: `package.json` expose `npm run check:file-size`; son resultat a
  ete reproduit avec PowerShell car le runtime Node n'est pas disponible.
- 2026-07-27: `git diff --check` valide sans erreur.
- 2026-07-27: `node`, `npm`, `npx`, `bun` et `deno` sont absents du `PATH`.
  Le runtime Node integre a Codex a aussi refuse l'execution avec une erreur de
  metadonnees `sandboxPolicy`; typecheck, tests, lint et build non executes.
- 2026-07-27: extension du chantier demandee pour donner une identite propre a
  chaque site; directions portfolio editorial, sport technique et trekking
  organique retenues.
- 2026-07-27: idees complementaires sur la navigation inter-sites, les pages
  404 contextuelles et les tests de metadonnees ajoutees a
  `docs/06-idees/90-ia-idees.md`.
- 2026-07-27: registre `site-identities.ts` applique avant React le titre, la
  description, la couleur navigateur, l'image sociale, le favicon et
  `data-site` selon la route.
- 2026-07-27: le portfolio recoit une signature editoriale, Trekking un repere
  topographique et Suivi Sportif une interface technique sombre avec accent
  citron. Les signatures restent dans leurs dossiers de site.
- 2026-07-27: les assets d'installation et de partage de Suivi Sportif sont
  ranges sous `client/public/sites/suivi-sportif`; son manifeste est limite au
  scope `/suivi-sportif` et n'est injecte que sur ce site.
- 2026-07-27: audit final statique: 87 fichiers dans `client/src`, aucun
  au-dessus de 500 lignes (maximum 494), aucun import relatif non resolu et
  aucun import direct entre sites.
- 2026-07-27: les huit assets declares par le registre et les trois icones du
  manifeste existent; les SVG et le JSON du manifeste sont valides.
- 2026-07-27: aucune declaration `style` inline ni SVG embarque dans les
  composants; `git diff --check` et le controle des espaces de fin de ligne
  passent sans erreur.
