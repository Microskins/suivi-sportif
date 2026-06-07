# Plan - Assets identite app

## Objectif

- Ajouter un petit kit d'assets d'identite pour le frontend: favicon, favicon ICO, icones web app et image sociale.
- Brancher les metadonnees HTML utiles sans changer le comportement applicatif.

## Decisions

- Utiliser une marque vectorielle simple, lisible aux petites tailles, plutot qu'une image illustrative.
- Placer les assets publics sous `client/public`.
- Conserver une palette proche de l'UI actuelle: emerald, slate, accent amber.

## Todo

- [x] Creer ce plan.
- [x] Ajouter les assets d'identite dans `client/public`.
- [x] Declarer les favicons, manifest et balises sociales dans `client/index.html`.
- [x] Verifier le build frontend.

## Notes de verification

- Idee annexe ajoutee dans `docs/06-idees/90-ia-idees.md`.
- Verification visuelle des PNG `client/public/og-image.png` et `client/public/app-icon-512.png`: rendu net et lisible.
- Dimensions verifiees via PowerShell/System.Drawing:
  - `favicon-16.png`: 16x16;
  - `favicon-32.png`: 32x32;
  - `apple-touch-icon.png`: 180x180;
  - `app-icon-192.png`: 192x192;
  - `app-icon-512.png`: 512x512;
  - `app-icon-512-maskable.png`: 512x512;
  - `og-image.png`: 1200x630.
- `favicon.ico` genere avec les PNG 16x16 et 32x32 integres.
- References de `client/index.html` vers les assets publics verifiees: tous les fichiers existent.
- `client/public/site.webmanifest` parse correctement avec `ConvertFrom-Json`.
- `npm run build -w client` non lance: `npm` et `node` absents du PATH dans ce shell.
- 2026-06-07: `npm run typecheck -w client` via WSL Node 22.12.0: OK.
- 2026-06-07: `npm run build -w client` via WSL Node 22.12.0: OK; avertissement Vite attendu sur chunk JS > 500 kB.
- 2026-06-07: `client/dist/` genere par le build puis supprime apres verification.
