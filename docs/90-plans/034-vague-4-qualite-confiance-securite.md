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
- [ ] Definir checklist audit UI.
- [ ] Auditer les parcours critiques.
- [ ] Corriger les problemes UI/accessibilite.
- [ ] Ajouter controle qualite images.
- [ ] Ajouter securite compte.
- [ ] Ajouter version de politique cookies.
- [ ] Mettre a jour docs sources de verite.
- [ ] Valider typecheck/tests/build pertinents.
- [ ] Pousser la vague avant d'ouvrir la Vague 5.

## Notes de verification

- 2026-06-01: plan cree depuis la roadmap `030-roadmap-idees-ia`.
- 2026-06-01: cette vague doit attendre la fin de la Vague 3.
