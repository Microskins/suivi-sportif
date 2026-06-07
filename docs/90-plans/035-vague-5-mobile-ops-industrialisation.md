# Plan - Vague 5 mobile, ops et industrialisation

## Objectif

- Preparer l'application a un usage mobile et plus durable.
- Renforcer les checks, la documentation et les signaux de production.
- Eviter que la vitesse feature degrade la maintenabilite.

## Perimetre

- Checklist pre-release Capacitor:
  - assets offline;
  - ecran d'erreur reseau;
  - stockage token adapte mobile;
  - base URL API par environnement;
  - verification HTTPS/CORS.
- Verification des idees et plans:
  - doublons numeriques;
  - liens morts;
  - idees transformees en plans;
  - plans non indexes.
- Observabilite minimale:
  - erreurs API plus lisibles;
  - journal des echecs critiques;
  - checks deploy/health plus explicites.
- Industrialisation:
  - scripts de verification doc;
  - runbook de release;
  - controle des artefacts generes.

## Hors perimetre

- Publication App Store / Play Store complete.
- Observabilite payante ou stack complexe.
- Infrastructure multi-region.
- Refonte CI/CD complete si les besoins restent simples.

## Decisions

- Reporter l'execution de cette vague au moment ou le chantier
  `040-mobile-capacitor` sera repris.
- Prioriser les checks simples et automatisables.
- Ne pas introduire une stack ops lourde sans signal production concret.
- Rendre les erreurs comprehensibles avant de multiplier les alertes.
- Garder le mobile compatible avec l'API existante et les environnements.

## Sous-chantiers

1. Readiness mobile
   - Checklist Capacitor.
   - Configuration environnements.
   - Gestion offline/erreur reseau.

2. Checks docs et plans
   - Detecter doublons.
   - Detecter liens morts.
   - Verifier index plans/idees.

3. Observabilite API
   - Standardiser logs utiles.
   - Ameliorer health checks.
   - Documenter incidents simples.

4. Release et maintenance
   - Ajouter checklist de release.
   - Nettoyer artefacts.
   - Documenter rollback minimal.

## Todo

- [x] Creer ce plan.
- [ ] Reprendre cette vague avec le plan `040-mobile-capacitor`.
- [ ] Auditer la cible mobile actuelle.
- [ ] Ajouter checklist Capacitor.
- [ ] Ajouter checks docs/plans.
- [ ] Ajouter observabilite minimale.
- [ ] Ajouter runbook release/maintenance.
- [ ] Mettre a jour docs deployment/mobile.
- [ ] Valider typecheck/tests/build pertinents.
- [ ] Pousser la vague finale.

## Notes de verification

- 2026-06-01: plan cree depuis la roadmap `030-roadmap-idees-ia`.
- 2026-06-01: cette vague doit attendre la fin de la Vague 4.
- 2026-06-01: decision utilisateur: ne pas lancer la Vague 5 maintenant;
  elle sera executee quand le chantier `040-mobile-capacitor` sera repris.
