# Plans

Index chronologique des chantiers planifies et executes.

## Chantiers

1. [Compte initial et donnees de base](./001-compte-initial-data.md)
2. [API helpers](./002-api-helpers.md)
3. [API tests ownership update delete](./003-api-tests-ownership-update-delete.md)
4. [Tests API OpenAPI robustesse](./004-tests-api-openapi-robustesse.md)
5. [Skill gestion chantiers](./005-skill-gestion-chantiers.md)
6. [Frontend CRUD ecrans](./006-frontend-crud-ecrans.md)
7. [Dashboard suivi frontend](./007-dashboard-suivi-frontend.md)
8. [Automatisation deploiement](./008-automatisation-deploiement.md)
9. [Optimisation du deploiement production npm](./009-Optimisation-deploiement-npm.md)
10. [Docs idees: structure et index](./010-docs-idees-index.md)
11. [Skill IA idees pendant creation de plan](./011-skill-ia-idees-plan.md)
12. [Fix 500 API apres changements Prisma (exercises)](./012-fix-api-500-prisma-exercises.md)
13. [GitHub Actions: opt-in Node 24 (deprecation Node 20)](./013-github-actions-node24.md)

## Convention

Chaque nouveau chantier doit avoir une doc `XXX-nom-du-chantier.md`, avec:

- objectif;
- decisions;
- todo list;
- notes de verification.

La todo est cochee au fil de l'implementation. Un commit est fait a la fin de
chaque sous-tache quand le chantier le demande, puis un push a la fin du
chantier.

## Statuts

- Un plan reste dans `docs/90-plans/` meme une fois termine.
- Les docs actives sont mises a jour quand le plan change le comportement du projet.
- Les plans ne remplacent pas `README.md`, `01-getting-started/quick-start.md`,
  `03-api/reference.md` ou `02-architecture/overview.md`; ils expliquent
  l'historique des decisions.
