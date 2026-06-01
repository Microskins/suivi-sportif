# Plan - Vague 4 qualite, confiance et securite

## Objectif

- Stabiliser les parcours critiques avant d'elargir l'usage.
- Renforcer la confiance dans les donnees, les images et le compte utilisateur.
- Reduire les regressions UI et les risques de securite simples.

## Perimetre

- Audit accessibilite et parcours critiques:
  - clavier;
  - focus visible;
  - contrastes;
  - etats vides / chargement / erreurs;
  - captures desktop/mobile.
- Controle qualite des images d'exercices:
  - manifeste de validation;
  - statut de revue;
  - notes de rejet/regeneration;
  - verification des fichiers references.
- Securite compte:
  - confirmation de mot de passe actuel;
  - verification nouvel email;
  - journal minimal des changements sensibles.
- Conformite cookies:
  - version de politique;
  - invalidation des anciens consentements;
  - trace des changements.

## Hors perimetre

- Audit securite externe complet.
- Systeme de roles avance.
- Monitoring production complet.
- Refonte visuelle globale non liee aux parcours critiques.

## Decisions

- Prioriser les parcours les plus utilises: login, dashboard, seances, repas, mensurations, objectifs.
- Corriger les problemes bloquants avant les raffinements visuels.
- Documenter les limites de validation des images IA.
- Traiter les changements de compte comme des operations sensibles.

## Sous-chantiers

1. Audit UI/accessibilite
   - Definir checklist.
   - Tester desktop/mobile.
   - Corriger focus, contrastes et textes qui debordent.

2. Qualite images exercices
   - Ajouter manifeste.
   - Verifier presence des assets.
   - Ajouter statut de revue.

3. Securite compte
   - Ajouter confirmation mot de passe actuel.
   - Preparer verification email.
   - Journaliser les changements sensibles.

4. Cookies et conformite
   - Versionner la politique.
   - Invalider consentements obsoletes.
   - Documenter le flux.

## Todo

- [x] Creer ce plan.
- [x] Definir checklist audit UI.
- [x] Auditer les parcours critiques.
- [x] Corriger les problemes UI/accessibilite.
- [x] Ajouter controle qualite images.
- [x] Ajouter securite compte.
- [x] Ajouter version de politique cookies.
- [x] Mettre a jour docs sources de verite.
- [x] Valider les controles disponibles et documenter les blocages.
- [x] Pousser la vague avant d'ouvrir la Vague 5.

## Notes de verification

- 2026-06-01: plan cree depuis la roadmap `030-roadmap-idees-ia`.
- 2026-06-01: cette vague doit attendre la fin de la Vague 3.
- 2026-06-01: tranche retenue: checklist UI documentee, securite compte sur changements sensibles, version cookies explicite et manifeste qualite images.
- 2026-06-01: ajout docs qualite `docs/07-qualite/` avec checklist UI/accessibilite et manifeste images exercices.
- 2026-06-01: controle images: 163 exercices, 163 references, 64 fichiers presents, 100 images referencees absentes.
- 2026-06-01: ajout confirmation du mot de passe actuel pour changement email/mot de passe et journalisation serveur des champs sensibles modifies.
- 2026-06-01: version cookies passee a `2026-06-01`; les consentements d'ancienne version sont supprimes du localStorage.
- 2026-06-01: reference API mise a jour pour `currentPassword` sur `PUT /api/users/me`.
- 2026-06-01: `git diff --check` : OK.
- 2026-06-01: `npm run typecheck -w server` bloque localement: `npm` absent du PATH PowerShell.
- 2026-06-01: `npm run typecheck -w client` bloque localement: `npm` absent du PATH PowerShell.
- 2026-06-01: `npm run test -w server -- --run` bloque localement: `npm` absent du PATH PowerShell.
- 2026-06-01: `npm run test -w client -- --run` bloque localement: `npm` absent du PATH PowerShell.
