# Plan - Refonte architecture serveur et client

## Objectif

- Premier des trois chantiers d'une refonte demandee par l'utilisateur:
  architecture, puis UX/UI, puis documentation. Ce plan couvre uniquement
  l'architecture.
- Centraliser la reponse API (auth, erreurs, pagination) sans changer le
  contrat public existant, en s'appuyant sur la convention reellement en
  usage plutot que sur celle documentee mais jamais appliquee dans
  `.agents/skills/structure-des-reponses-api/SKILL.md`.
- Corriger deux codes HTTP incorrects trouves pendant l'audit.
- Reduire la duplication frontend ciblee (formatage fr-FR, tokens CSS) sans
  toucher a la logique metier des sites.
- Debloquer `npm run lint` cote serveur et client (casse depuis les plans
  070/072, jamais corrige).

## Decisions

- Ne pas migrer les codes d'erreur vers le catalogue generique documente
  par le skill (`NOT_FOUND`/`INTERNAL_ERROR`); au contraire, mettre a jour
  le skill pour refleter la convention reelle (codes prefixes par
  ressource, `INTERNAL_SERVER_ERROR`) afin de ne rien casser cote
  consommateurs existants et d'arreter une documentation qui n'a jamais
  correspondu au code.
- Corriger uniquement les 2 vraies incoherences de statut HTTP trouvees
  (`EMAIL_ALREADY_EXISTS` -> 409, `FOOD_NOT_FOUND` a la creation d'un repas
  -> 404), pas de refonte plus large des codes metier.
- Laisser hors scope l'extraction service/controller de `routes/workouts.ts`
  et `services/assistant-drafts.ts`, et le decoupage de
  `server/src/schemas/index.ts` — gain cosmetique, risque de regression
  plus eleve, meilleur candidat pour un chantier dedie.
- Laisser hors scope la reorganisation des fichiers `dashboard*.tsx` de
  `suivi-sportif` et le renommage du skill `suivi-sportif-app-da` —
  repousses a la phase UX/UI ou documentation.
- `client/src/shared/` n'est **pas** cree. L'intention initiale reposait sur
  une premisse fausse (un formatage `fr-FR` suppose partage entre sites);
  verification faite, chaque site a des besoins de formatage differents et
  seule la locale est commune. Le creer aurait couple des sites sans raison,
  a rebours de la regle de `docs/02-architecture/project-structure.md` et de
  la tache de garde-fou de ce meme chantier. La duplication reellement
  trouvee etait interne a suivi-sportif et a ete traitee sur place.
- Pagination: choix valide par l'utilisateur d'une pagination **par defaut**
  (`limit=20`, plafonne a 100) cote API, avec adaptation du frontend, plutot
  qu'une pagination opt-in retro-compatible. C'est un changement de contrat
  public assume: sans ce choix, le frontend actuel (qui n'envoie jamais
  `page`/`limit`) perdrait silencieusement des donnees, par exemple la
  bibliotheque d'exercices qui n'afficherait que 20 entrees sur 163.
- Adaptation du frontend a la pagination: **pas** de pagination visible dans
  l'interface (boutons "page suivante" / "charger plus"), mais un parcours
  transparent des pages dans `api/client.ts` (`requestList`). Raison: les
  ecrans ne se contentent pas d'afficher les listes, ils calculent des
  agregats dessus (graphique de poids, regularite hebdomadaire, totaux
  nutritionnels, calendrier). Une pagination d'affichage classique aurait
  produit des statistiques *fausses* sur des donnees tronquees, sans aucune
  erreur visible: un resultat pire que le bug initial. Le serveur conserve
  sa protection contre les requetes non bornees (100 lignes par requete au
  maximum), et une vraie pagination d'affichage reste possible plus tard
  pour les ecrans qui ne font que lister.
- ESLint: une config flat **par workspace** (`server/eslint.config.js` et
  `client/eslint.config.js`) plutot qu'une seule a la racine comme prevu
  initialement. Raison: `@typescript-eslint/eslint-plugin` et `parser` sont
  installes dans `server/node_modules` et `client/node_modules`, pas a la
  racine; une config racine ne pourrait pas les resoudre. Node remonte en
  revanche jusqu'a la racine pour `@eslint/js` et `globals`, qui y sont
  hoistes.
- `@typescript-eslint/no-explicit-any` est en `warn` et non en `error`: le
  code existant utilise `catch (error: any)` de facon systematique (48
  occurrences). Le passer en erreur aurait transforme la mise en place du
  lint en chantier de typage. Le lint est ainsi exploitable des maintenant,
  et les occurrences restent visibles.
- Pas de regles React dans la config client: `eslint-plugin-react` et
  `eslint-plugin-react-hooks` ne sont pas installes dans le depot, et les
  ajouter serait un choix de dependances hors perimetre de ce chantier.
- Le parametre `pagination` des queries est **optionnel**: les routes le
  passent toujours, mais les services internes l'omettent volontairement.
  L'assistant (`services/assistant-orchestrator.ts`) fait du rapprochement
  par nom sur les aliments et les exercices: il a besoin du catalogue
  complet, le paginer casserait la reconnaissance.

## Todo

- [x] Creer ce plan et la branche dediee `refactor/architecture-serveur-client`.
- [x] Backend: creer `server/src/lib/api-response.ts` (helpers adaptes a la
      convention reelle).
- [x] Backend: cabler les helpers dans les 9 fichiers de routes et
      remplacer le hook d'auth duplique par une fonction `authenticate`
      partagee (voir notes: le decorateur `fastify.authenticate` ne se
      propage pas sans `fastify-plugin`).
- [x] Backend: corriger `EMAIL_ALREADY_EXISTS` (409) et `FOOD_NOT_FOUND` a
      la creation de repas (404).
- [x] Backend: implementer une vraie pagination (page/limit, skip/take
      Prisma) sur les listes.
- [x] Frontend: adapter la couche API a la pagination par defaut. Choix
      retenu: parcours transparent des pages dans `api/client.ts`, sans
      toucher aux stores ni aux ecrans (voir decisions).
- [x] Backend: ajouter `DELETE /api/workout-templates/:id`.
- [x] Backend: investiguer les 3 `catch {}` muets dans
      `db/queries/{exercises,users,workouts}.ts` - aucun bug trouve: ce sont
      des `delete*` qui utilisent l'idiome Prisma "supprimer et rattraper
      l'erreur P2025" pour renvoyer `false` (donc 404 en amont) quand
      l'enregistrement n'existe pas. Les autres domaines font un `findFirst`
      prealable a la place; les deux patterns sont valides, rien a corriger.
- [x] Backend: mettre a jour le skill `structure-des-reponses-api` et ses
      assets pour refleter la convention reelle.
- [x] Frontend: dedupliquer le formatage de dates. **`client/src/shared/`
      n'a finalement pas ete cree**: l'analyse initiale etait fausse (voir
      notes de verification).
- [x] Frontend: dedupliquer les tokens CSS en dur dans `client/src/styles.css`
      (uniquement la ou le remplacement est prouve equivalent, voir notes).
- [x] Frontend: polices par site — **mesure puis ecarte volontairement**, la
      premisse etant fausse (voir notes). `main.tsx` est inchange.
- [x] Frontend: ajouter un script de garde-fou anti cross-import entre
      sites (`npm run check:site-boundaries`).
- [x] Tooling: ajouter `eslint.config.js` (flat config) et simplifier les
      scripts `lint`. Ecart au plan: une config **par workspace** et non une
      seule a la racine (voir decisions).
- [x] Mettre a jour les docs sources de verite si le comportement visible
      change (`docs/02-architecture/overview.md` si pagination reelle
      change la forme de `meta`).
- [x] Verifier typecheck, tests, lint, build (ou noter le blocage
      environnement si impossible a lancer).

## Notes de verification

- 2026-08-18: plan cree, branche `refactor/architecture-serveur-client`
  creee depuis `main` (a jour avec `origin/main`, commit `6f8d747`).
- 2026-08-18: le decorateur `fastify.authenticate` existait dans
  `plugins/auth.ts` mais n'etait utilise nulle part. En essayant de le
  cabler, constat: `authPlugin` est enregistre sans `fastify-plugin`, donc
  son `decorate()` reste encapsule dans le scope du plugin et n'est pas
  visible depuis les routes enregistrees a cote. C'est probablement pour ca
  qu'il n'avait jamais servi. Solution retenue: exporter une fonction
  `authenticate` importable directement par chaque fichier de routes, et
  garder le `decorate()` pour compatibilite.
- 2026-08-18: pagination cablee sur les 8 domaines de liste. Le parametre
  est optionnel cote queries: `services/assistant-orchestrator.ts` appelle
  `getFoods`/`getExercises` sans pagination pour conserver le catalogue
  complet necessaire au rapprochement par nom.
- 2026-08-18: tests mis a jour en consequence: 15 mocks de listes dans
  `routes/api.test.ts` passent de `[x]` a `{ items: [x], total: n }`, les
  assertions `meta` passent de `limit: 1` a `limit: 20`, et les mocks Prisma
  de `db/queries/{foods,workouts}.test.ts` recoivent un `count` (le
  `Promise.all` de comptage l'appelle desormais).
- 2026-08-19: `npm run dev` echouait avec `spawn EINVAL`. Cause:
  `scripts/dev.mjs` spawnait `npm.cmd` avec `shell: false`; depuis le
  correctif de la CVE-2024-27980, Node refuse de spawner un `.cmd` sans
  shell. Corrige en passant `shell: true` uniquement sur Windows (les args
  du script sont des constantes, pas des entrees utilisateur).
- 2026-08-19: second blocage, distinct: `tsx` et `vite` introuvables au
  lancement. `node_modules/.bin/` ne contient que des symlinks POSIX
  (`tsx -> ../tsx/dist/cli.mjs`) et **aucun** shim Windows `.cmd` (0 fichier
  `.cmd` sur tout le dossier). Le `node_modules` a donc ete installe depuis
  un environnement POSIX (WSL ou git-bash), ou npm ne genere pas les shims
  Windows. Correction: relancer `npm install` depuis Windows.
  Ce constat explique tres probablement le blocage ESLint traine depuis les
  plans 070 et 072 (`eslint` introuvable / lint non fonctionnel): le meme
  dossier `.bin` n'a pas de `eslint.cmd`. A verifier apres reinstallation
  avant de conclure qu'il manque aussi un `eslint.config.js`.
- 2026-08-19: cause racine confirmee, plus profonde que les shims. Le
  `node_modules` du depot est une installation **Linux** utilisee depuis
  Windows: `node_modules/@esbuild/` ne contient que `linux-x64`, sans
  `win32-x64`, d'ou l'echec de `tsx` ("You installed esbuild for another
  platform than the one you're currently using"). `bcrypt` n'a aucun binding
  compile. `lightningcss` et `rolldown` embarquent par chance les deux
  plateformes, ce qui masquait partiellement le probleme.
  Regenerer les shims `.cmd` ne suffit donc pas: il faut telecharger les
  paquets natifs win32 depuis le registre, donc relancer `npm install`
  depuis Windows. C'est le prerequis a toute verification
  (typecheck/tests/lint/build) de ce chantier.
- 2026-08-19: apres `npm install` + `prisma generate`, l'outillage fonctionne
  enfin et les verifications ont pu etre lancees pour de vrai:
  - `vitest run` cote server: **188 tests passent sur 188** (5 fichiers).
  - `tsc --noEmit` cote server: OK. Cote client: OK.
  - Un seul test avait echoue au premier passage: "rate limits repeated
    public register attempts" attendait 400 alors que le chemin
    "email deja pris" renvoie desormais 409. Corrige: l'assertion porte sur
    "la requete n'est pas encore bloquee par le rate limit", 409 est la
    bonne valeur. Ce test avait echappe a la recherche initiale car il
    n'assertait que `statusCode`, sans citer `EMAIL_ALREADY_EXISTS`.
  - Attention: le typecheck client qui passe ne prouve **rien** sur la
    regression de pagination. La couche API declare `Exercise[]`,
    `Workout[]`, etc., et l'API renvoie toujours un tableau dans `data`,
    juste tronque a 20. Le systeme de types ne peut pas voir ce probleme;
    seule l'adaptation du frontend le reglera.
- 2026-08-19: hypothese ESLint precisee (elle etait incomplete). Il y avait
  **deux** problemes cumules, pas un:
  1. le shim `eslint.cmd` manquait (d'ou "eslint n'est pas reconnu"), corrige
     par `npm install`;
  2. il n'existe reellement aucun fichier de configuration dans le depot.
  A noter aussi une incoherence de versions: `server/` et `client/` ont bien
  ESLint 10.4.0 (comme declare), mais la racine a ESLint 8.57.1. Or 8.x
  attend `.eslintrc` et 9+ attend le flat config `eslint.config.js`. La
  config a ecrire doit viser 10.x et l'invocation doit resoudre le bon
  binaire, sinon on relancera l'erreur sous une autre forme.
- 2026-08-19: frontend adapte. Les 12 methodes de liste de
  `api/client.ts` passent par `requestList`, qui demande `limit=100` (le
  plafond serveur) et enchaine les pages jusqu'a atteindre `meta.total`.
  Stores et composants inchanges: ils continuent de recevoir des listes
  completes. Deux garde-fous contre la boucle infinie: arret sur page vide,
  et arret sur page incomplete quand `meta` est absent.
- 2026-08-19: 7 tests ajoutes dans `api/client.test.ts`, dont le cas concret
  des 163 exercices servis en 2 pages, l'URL qui porte deja une query
  (`/range/...`), le `total` incoherent et la propagation d'erreur.
- 2026-08-19: bug d'outillage preexistant corrige au passage (introduit par
  la PR #34, commit `6f8d747`): `vitest run` cote client collectait
  `client/e2e/price-comparison.visual.spec.ts`, qui est une suite Playwright,
  et echouait sur "Playwright Test did not expect test.describe() to be
  called here". `client/vite.config.ts` exclut desormais `e2e/**` des tests
  Vitest. Effet de bord appreciable: la suite passe de 19,5 s a 2,4 s.
- 2026-08-19: verifications apres adaptation frontend: client 45 tests sur
  45 (12 fichiers), typecheck client OK, `check-client-file-size.mjs` OK
  (116 fichiers sous 500 lignes).
- 2026-08-19: `npm run lint` fonctionne enfin, apres le blocage traine
  depuis les plans 070 et 072. Sortie 0 sur les deux workspaces: 0 erreur,
  48 avertissements `any` preexistants. Les scripts perdent le flag `--ext`,
  vestige de l'ancienne configuration `.eslintrc` et sans effet en flat
  config.
- 2026-08-19: 5 problemes reels remontes par le premier passage du lint,
  tous corriges:
  - 2 `catch (err)` ou la variable n'etait pas utilisee (dans du code de ce
    chantier), remplaces par `catch {}`;
  - 3 faux positifs `no-undef` sur des types DOM (`RequestInit`,
    `HeadersInit`): la regle ne connait pas les types TypeScript, elle est
    desactivee cote client conformement a la recommandation de
    typescript-eslint (le compilateur couvre deja ce controle);
  - un import mort de `labelFromOptions` dans `components/dashboard.tsx`;
  - `onApplyDraft` non utilise dans `AssistantChatbox`. **Pas** supprime:
    les tests verifient explicitement que ce callback n'est jamais appele,
    conformement au plan 066 ("chat box classique sans mutations"). Retire
    seulement du destructuring, le contrat de props est conserve et
    documente sur place.
- 2026-08-19: constat au passage, non traite (hors perimetre): la fonction
  `labelFromOptions` est definie trois fois dans le client
  (`dashboard/exercises-list.tsx`, `dashboard/meals-list.tsx`, et exportee
  par `dashboard/workout-form-utils.ts`). Bon candidat pour la tache
  d'extraction vers `client/src/shared/`.
- 2026-08-19: validation complete apres ces changements: server 188/188 et
  typecheck OK, client 45/45 et typecheck OK, `npm run lint` sortie 0.
- 2026-08-19: skill `structure-des-reponses-api` remis en accord avec le
  code. Ecarts corriges dans la doc:
  - codes 404 prefixes par ressource (`USER_NOT_FOUND`, ...) au lieu d'un
    `NOT_FOUND` generique, et `INTERNAL_SERVER_ERROR` au lieu de
    `INTERNAL_ERROR`;
  - `details` contient `error.errors` (tableau de `ZodIssue`) et **pas**
    `zodError.flatten()` comme le skill le recommandait. Point important:
    les schemas de reponse declarent `details: { type: "array" }`, or
    `flatten()` renvoie un objet; suivre l'ancienne consigne aurait fait
    disparaitre le champ a la serialisation;
  - documentation du hook `authenticate` partage et de la raison pour
    laquelle `fastify.authenticate` ne fonctionne pas ici;
  - documentation de la pagination reelle, y compris le `pagination`
    optionnel cote queries et la traduction `page`/`limit` -> `skip`/`take`.
- 2026-08-19: les assets du skill ont ete **executes**, pas seulement relus:
  copies temporairement dans `server/src` avec un stub de queries, ils
  echouaient d'abord sur 3 tests (500 au lieu de 200/201). Cause: les
  fixtures de test omettaient des champs `required` du schema de reponse
  (`userId`, `notes`) et utilisaient un `id` non-uuid, ce qui fait echouer
  la serialisation Fastify. Corrige, l'exemple passe 11 tests sur 11. Le
  piege est desormais explique en commentaire dans l'asset, car c'est une
  erreur facile a reproduire dans une vraie route.
- 2026-08-19: la premisse de ce plan sur le formatage `fr-FR` etait
  **inexacte**, et l'inspection du code l'a invalidee. Il n'existe pas de
  fonction partagee entre >= 2 sites: seule la locale `"fr-FR"` est commune.
  prix-aliments formate une devise EUR et une date `dateStyle: "long"`,
  suivi-sportif formate des dates courtes et des nombres. Ce sont des
  besoins differents, pas une duplication.
  `client/src/shared/` n'a donc **pas** ete cree: le faire aurait introduit
  un couplage entre sites la ou il n'y en a pas, en contradiction avec la
  regle de `docs/02-architecture/project-structure.md` (n'extraire dans
  `shared/` qu'un code reellement utilise par au moins deux sites), et avec
  la tache de garde-fou anti cross-import de ce meme chantier.
- 2026-08-19: la vraie duplication etait **interne a suivi-sportif**:
  `meals-list.tsx` et `workouts-list.tsx` redefinissaient chacun un
  `formatDate` identique alors que `dashboard/dashboard-helpers.ts` exportait
  deja un `formatDate`. Les copies locales sont supprimees au profit d'un
  `formatDateMedium` unique dans `dashboard-helpers.ts`.
- 2026-08-19: attention, les deux fonctions ne sont **pas** interchangeables
  et n'ont volontairement pas ete fusionnees. Verifie en les executant:
  - `formatDate` -> `18/08/2026 20:05`
  - `formatDateMedium` -> `18 aout 2026, 20:05`
  L'application affiche donc deux formats de date selon les ecrans. Les
  unifier changerait l'affichage: c'est une decision d'interface, qui releve
  de la phase UX/UI et non de ce chantier technique. Les deux fonctions sont
  documentees sur place pour que le choix se fasse en connaissance de cause.
- 2026-08-19: la note du 2026-08-18 sur l'absence de `node`/`npm` est
  **caduque**. L'outillage fonctionne desormais dans cette session (voir les
  notes du 2026-08-19 sur `npm install`, `prisma generate` et les shims
  Windows), et toutes les verifications de ce chantier ont pu etre lancees
  reellement: tests, typecheck, lint et controle de taille des fichiers.
- 2026-08-19: garde-fou anti cross-import ajoute
  (`scripts/check-site-boundaries.mjs`, `npm run check:site-boundaries`),
  calque sur le script de controle de taille existant. La regle "un site
  n'importe jamais un autre site" etait documentee depuis le plan 069 mais
  ne reposait que sur la discipline; elle est desormais verifiable.
  Le controle resout les chemins reels plutot que de filtrer du texte, pour
  attraper aussi bien `../autre-site/x` qu'une remontee profonde
  `../../sites/autre-site/x`. Le sens `app` -> `sites/*` reste autorise.
- 2026-08-19: le garde-fou a ete verifie **en le faisant echouer**, et pas
  seulement en le voyant passer: deux fichiers sondes temporaires ont ete
  introduits (import relatif direct et remontee profonde), tous deux
  detectes avec sortie 1 et message actionnable, puis supprimes. Un
  controle qui n'a jamais echoue ne prouve rien.
- 2026-08-19: tokens CSS dedupliques dans `client/src/styles.css`, mais
  seulement la ou le remplacement est **prouve equivalent**. Les `--site-*`
  sont scopes par `html[data-site="..."]`: remplacer un hex par
  `var(--site-x)` dans une regle non scopee changerait le rendu des autres
  sites. Neuf occurrences situees dans des blocs deja scopes ont donc ete
  converties (leur valeur litterale etait exactement celle du token du meme
  site), et les utilitaires non scopes (`.site-sport-grid`, `.price-barcode`,
  `.voyage-ticket-stub`) ont ete laisses tels quels.
- 2026-08-19: ajout de `--site-accent-2` (ambre) dans le bloc suivi-sportif.
  Le degrade corail -> ambre est la signature de cette DA et etait recopie
  en dur quatre fois; il s'ecrit desormais
  `linear-gradient(135deg, var(--site-accent), var(--site-accent-2))`. Le
  token n'existe que pour ce site, ce qui est sans risque puisque les quatre
  regles concernees sont scopees sur suivi-sportif.
- 2026-08-19: deux valeurs restent volontairement litterales, faute de
  pouvoir faire autrement:
  - `focus:ring-[#ff7a54]/10` dans `.sport-input`: Tailwind ne sait pas
    deriver une opacite depuis une variable CSS;
  - les couleurs de `components/auth/auth-screen.tsx`, qui recopie les
    couleurs de la DA une dizaine de fois, souvent avec un modificateur
    d'opacite (`bg-[#ffb648]/15`) ou dans un `<stop stopColor>` SVG. Ce
    fichier est un candidat pour la phase UX/UI, pas pour ce chantier.
- 2026-08-19: verifie par un vrai build Vite (sortie 0) et en controlant le
  CSS produit: les `var(--site-*)` y sont bien presents et le degrade n'y
  apparait plus en dur (hors `auth-screen.tsx`). Tests client 45/45, lint
  sortie 0, controle de taille OK. Artefacts `client/dist` supprimes apres
  verification.
- 2026-08-19: chargement des polices par site **mesure puis ecarte**, et
  `main.tsx` laisse inchange. La premisse de cette tache (reprise d'une idee
  du plan 070) etait fausse: un visiteur ne telecharge pas les polices des
  autres sites. `@fontsource/*` se contente de declarer des `@font-face`, et
  un navigateur ne recupere un fichier de police que si la famille sert
  reellement a afficher du texte.
  Verifie sur un build reel: aucun `rel="preload"` de police n'est genere et
  les 24 declarations portent toutes `font-display: swap`. Le cout reel sur
  le chemin critique est de 5 644 octets de regles `@font-face`, soit 8,2 %
  d'un CSS de 68 ko, environ 1 ko gzippe.
  Le decoupage imposerait un chargement asynchrone des polices, donc un
  risque de FOUT la ou il n'y en a aucun, pour un gain d'environ 1 ko. La
  mesure a ete reportee dans `docs/06-idees/90-ia-idees.md` pour que
  l'analyse ne soit pas refaite.
- 2026-08-19: constat lie, non traite: `client/src/app/site-router.tsx`
  importe les 5 sites statiquement, donc tout se retrouve dans un seul
  bundle (chunk principal de ~789 ko minifie, deja signale par Vite). Un
  decoupage par route aurait un impact bien superieur a celui des polices,
  mais c'est un chantier a part entiere.
- 2026-08-19: docs sources de verite mises a jour dans
  `docs/03-api/reference.md`, la pagination changeant le contrat public:
  - parametres `page`/`limit` documentes avec leurs defauts et le plafond de
    100, et precision que `meta.total` compte les elements filtres et non la
    page renvoyee (c'est lui qui indique s'il reste des pages);
  - codes `409 EMAIL_ALREADY_EXISTS`, `429 RATE_LIMIT_EXCEEDED` et
    `500 INTERNAL_SERVER_ERROR` ajoutes a la liste des erreurs, avec la
    regle des `404` prefixes par ressource et l'absence de `NOT_FOUND`
    generique;
  - endpoints `POST` et `DELETE /api/workout-templates/:id` ajoutes, le
    DELETE etant nouveau et le POST simplement absent de la doc.

## Verification finale du 2026-08-19

Toutes les commandes ont ete lancees reellement depuis le depot, apres
reparation de l'outillage:

| Verification | Resultat |
| --- | --- |
| `npm test` (server) | 188 tests sur 188, 5 fichiers |
| `npm test` (client) | 45 tests sur 45, 12 fichiers |
| `npm run lint` | sortie 0 (0 erreur, 48 avertissements `any` preexistants) |
| `npm run build` | sortie 0 (typecheck server + client, puis build Vite) |
| `npm run check:file-size` | 116 fichiers sous 500 lignes |
| `npm run check:site-boundaries` | 109 fichiers, aucune frontiere franchie |

Les artefacts `client/dist` et `server/dist` ont ete supprimes apres
verification.

### Limite connue

La base PostgreSQL n'a pas pu etre demarree pendant ce chantier (port 5432
ferme). Les chemins qui touchent reellement la base n'ont donc ete verifies
que par les tests unitaires, qui mockent Prisma. Restent a valider contre une
vraie base avant mise en production, en priorite:

- la pagination `skip`/`take` et le `count()` sur les 8 domaines de liste;
- le passage de `EMAIL_ALREADY_EXISTS` a 409 sur `/register` et sur le
  changement d'email;
- le nouveau `DELETE /api/workout-templates/:id`, en particulier la cascade
  sur `workout_template_exercises`.
