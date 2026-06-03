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
14. [Fusion idees seances](./014-fusion-idees-seances.md)
15. [Modeles de seances par defaut](./015-modeles-seances-defaut.md)
16. [Correction seed prod modeles seances](./016-fix-seances-defaut-seed-prod.md)
17. [CMP cookies frontend](./017-cmp-cookies-frontend.md)
18. [Calendrier suivi et statut seances](./018-calendrier-suivi-statut-seances.md)
19. [Integration bibliotheque exos complete](./019-integration-bibliotheque-exos.md)
20. [Edition modeles de seances](./020-edition-modeles-seances.md)
21. [Suivi cardio dans les seances](./021-suivi-cardio-dans-seances.md)
22. [Reordonner les exercices dans seances et modeles](./022-reordonner-exercices-seances-modeles.md)
23. [Duplication de seances](./023-duplication-seances.md)
24. [Duplication de seances depuis le calendrier](./024-duplication-seances-calendrier.md)
25. [Base exercices IA gpt-image-2](./025-base-exercices-ia-gpt-image-2.md)
26. [Images exercices dans UI](./026-images-exercices-ui.md)
27. [Mensurations corporelles](./027-mensurations-corporelles.md)
28. [Onglet profil](./028-onglet-profil.md)
29. [Objectifs sport et corps](./029-objectifs-sport-corps.md)
30. [Roadmap idees IA](./030-roadmap-idees-ia.md)
31. [Vague 1 feedback et motivation](./031-vague-1-feedback-motivation.md)
32. [Vague 2 progression sportive](./032-vague-2-progression-sportive.md)
33. [Vague 3 nutrition et saisie rapide](./033-vague-3-nutrition-saisie-rapide.md)
34. [Vague 4 qualite confiance securite](./034-vague-4-qualite-confiance-securite.md)
35. [Vague 5 mobile ops industrialisation](./035-vague-5-mobile-ops-industrialisation.md)
88. [Remediation securite npm audit](./088-remediation-securite-npm-audit.md)
89. [Mobile Android/iOS via Capacitor](./089-mobile-capacitor.md)
90. [Tour qualite UI](./090-tour-qualite-ui.md)
91. [Assets identite app](./091-assets-identite-app.md)
92. [Suppression des popups exercices et repas](./092-suppression-popups-exercices-repas.md)
93. [Nginx proxy Home Assistant](./093-nginx-proxy-home-assistant.md)
94. [Reload Nginx conditionnel](./094-nginx-reload-conditionnel.md)

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
