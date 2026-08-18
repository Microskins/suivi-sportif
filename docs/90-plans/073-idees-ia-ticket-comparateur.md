# Plan - Idees IA ticket comparateur

## Objectif

- Realiser le lot d'idees IA court qui prolonge le comparateur de prix.
- Rendre une recherche partageable et identifiable par un numero de ticket
  stable.
- Proposer le partage natif sur mobile avec une copie de lien fiable en repli.
- Produire une version papier compacte, monochrome et reutilisable via QR code.
- Automatiser les controles des rendus desktop, mobile et impression.

## Decisions

- Synchroniser le terme, la categorie et la zone dans les parametres d'URL.
- Ignorer les parametres inconnus ou invalides et conserver 59278 comme zone
  locale de reference.
- Deriver le numero de ticket uniquement des filtres publics, sans identifiant
  personnel ni stockage serveur.
- Utiliser history.replaceState pendant la saisie pour ne pas saturer
  l'historique du navigateur.
- Utiliser navigator.share lorsqu'il est disponible et conserver la copie du
  lien comme repli desktop.
- Generer le QR code cote client a partir de l'URL publique, sans service tiers.
- Dedicacer une feuille media print au recu: controles caches, recherche, date,
  magasins, offres, sources et mentions de prudence conserves.
- Conserver simultanement l'etoile, le libelle, la premiere position et une
  bordure double pour que le meilleur prix reste identifiable en monochrome.
- Garder les tests visuels deterministes et independants d'un service externe.
- Respecter la DA Ticket de caisse, le store Zustand existant et la limite de
  500 lignes par fichier maintenu.

## Todo

- [x] Creer ce plan et la branche dediee.
- [x] Auditer les idees IA, le comparateur et l'outillage de test existants.
- [x] Ajouter les helpers de parametres et le numero de ticket stable.
- [x] Synchroniser le store avec l'URL.
- [x] Ajouter le partage natif avec copie du lien en repli.
- [x] Ajouter la mise en page papier et renforcer le signal monochrome.
- [x] Ajouter le QR code local a la version imprimee.
- [x] Completer les tests unitaires et composants.
- [x] Ajouter les controles visuels desktop, mobile et print.
- [x] Archiver les idees realisees et enrichir les idees adjacentes.
- [x] Mettre a jour les docs sources de verite.
- [x] Verifier typecheck, tests, taille des fichiers et build.
- [x] Rebaser la branche sur la derniere reference `main` sans perdre les
  modifications non commitees.
- [x] Verifier l'etat Git et l'integrite du diff apres le rebase.

## Notes de verification

- 2026-08-18: branche feat/idees-ia-ticket-comparateur recreee depuis main
  dans un worktree dedie; le chantier chore/skills-cleanup et ses modifications
  non commitees restent isoles dans le worktree principal.
- 2026-08-18: le plan 072 a livre le comparateur initial. Les idees URL,
  impression, monochrome, partage natif, QR code et regression visuelle forment
  un meme lot frontend coherent.
- 2026-08-18: ajout de qrcode 1.5.4 et de ses types 1.5.5 pour produire un SVG
  local, sans requete vers un generateur tiers.
- 2026-08-18: ajout des parametres zone, q et categorie, du numero stable, du
  partage Web Share avec copie en repli, de la vue papier monochrome et du QR
  code reserve a l'impression.
- 2026-08-18: typecheck client OK et tests cibles OK (2 fichiers, 12 tests).
- 2026-08-18: navigateur integre bloque par la metadonnee sandboxPolicy absente.
  La suite Playwright du depot a ete executee avec le moteur Chromium local
  d'Opera: 3 tests sur 3 passent pour desktop 1440 px, mobile 390 px et media
  print. Les captures ont aussi ete relues visuellement; aucun debordement et QR
  lisible avec zone calme conservee.
- 2026-08-18: six idees realisees ont ete archivees. Trois prolongements non
  engages et non redondants ont ete ajoutes au registre IA: fraicheur des liens
  partages, format thermique 80 mm et test de decodage du QR code.
- 2026-08-18: README, overview d'architecture et structure du projet mis a jour
  pour documenter l'URL, Web Share, le QR local et la suite Playwright.
- 2026-08-18: validation finale OK: typecheck client, 11 fichiers et 38 tests
  Vitest, 3 tests Playwright, controle de 115 fichiers sous 500 lignes et
  `git diff --check`.
- 2026-08-18: build Vite OK (754 modules). Le QR code est charge dans un chunk
  dynamique de 23,46 kB au lieu d'alourdir le chemin initial. L'avertissement
  existant sur le chunk principal de 789,30 kB minifie reste present.
- 2026-08-18: `npm audit --omit=dev` signale 11 vulnerabilites existantes dans
  Fastify/Hono/Axios et leurs dependances, sans alerte dans la chaine qrcode.
  Aucun `audit fix --force` potentiellement cassant n'a ete applique hors scope.
- 2026-08-18: les artefacts `client/dist`, `client/test-results`, les captures
  temporaires et le serveur Vite local ont ete nettoyes apres verification.
- 2026-08-18: reprise du plan pour synchroniser la branche avec `main`. Le
  registre IA contient deja trois prolongements dedoublonnes lies a ce plan;
  ce rebase purement technique ne justifie pas d'ajouter une idee artificielle.
- 2026-08-18: `git fetch origin main` confirme `main` et `origin/main` sur
  `aacf179`. `git rebase --autostash main` termine sans conflit; l'auto-stash a
  ete reapplique et supprime, les modifications suivies et non suivies sont
  conservees. `HEAD`, `main` et `origin/main` pointent sur le meme commit,
  aucun etat de rebase ne subsiste et `git diff --check` passe.
