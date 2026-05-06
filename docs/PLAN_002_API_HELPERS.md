# Plan - API helpers

## Objectif

Ajouter des helpers PowerShell pour creer les donnees via l'API production sans
retaper les headers JWT et sans manipuler le token a la main.

## Decisions

- Les helpers ciblent par defaut `https://suivi-sportif.fr`.
- Le compte de reference est `admin@suivi-sportif.fr`.
- Le token JWT est stocke localement dans `scripts/api/.token.json`.
- Le fichier de token est ignore par Git et ne doit pas etre partage.
- Les scripts utilisent `curl.exe` et des fichiers JSON temporaires pour eviter
  les problemes d'echappement PowerShell.
- Aucun endpoint backend n'est modifie dans ce chantier.
- Aucune interface frontend n'est modifiee dans ce chantier.

## Todo

- [x] Creer `docs/PLAN_002_API_HELPERS.md`.
- [x] Ajouter la regle de stockage local du token.
- [x] Creer `scripts/api/login.ps1`.
- [x] Creer les scripts de lecture catalogue.
- [x] Creer les scripts de creation sport.
- [x] Creer les scripts de creation nutrition.
- [x] Creer `docs/API_DATA_ENTRY.md`.
- [x] Tester login admin.
- [x] Tester creation exercice.
- [x] Tester creation seance.
- [x] Tester creation aliment.
- [x] Tester creation repas.
- [x] Tester creation objectif nutrition.
- [x] Relancer le smoke test prod.
- [x] Nettoyer les eventuelles donnees de test.
- [x] Cocher toutes les todos terminees.

## Notes de verification

- Les scripts doivent echouer clairement si le token local est absent.
- Les creations doivent etre visibles via les endpoints `GET`.
- Le smoke test production doit rester vert apres ce chantier.
