# Plan - Angle technique: dette et maintenance

## Objectif

- Reperer et reduire les points de friction structurels qui ralentissent les evolutions.
- Diminuer la taille des zones trop monolithiques et du code a fort couplage.
- Remettre a niveau les scripts et la documentation de base quand un ecart est detecte.

## Decisions

- Commencer par les hotspots les plus couteux a lire et tester: `Dashboard`, `api.test.ts`, scripts racine, docs de demarrage.
- Privilegier des extractions progressives et verifiables plutot qu'une refonte globale.
- Ne pas changer le metier tant que la structure n'est pas plus lisible.
- S'appuyer sur les tests existants pour securiser chaque etape.

## Todo

- [x] Creer ce plan.
- [ ] Cartographier les hotspots techniques du repo.
- [ ] Identifier les extractions a plus fort retour sur effort.
- [ ] Decouper les zones trop monolithiques sans casser les APIs internes.
- [x] Regler les ecarts de scripts ou de documentation reveles par l'audit.
- [x] Repasser les verifications de base pertinentes.

## Notes de verification

- 2026-06-03: plan cree a partir du constat de dette de maintenance autour du frontend, des tests API et des scripts racine.
- 2026-06-03: aucune verification d'execution lancee a ce stade; chantier de cadrage uniquement.
- 2026-06-03: ecarts corriges: script `setup` manquant, script racine `dev` fragile, versions README Fastify/Vite/Node, mention Swagger, structure d'architecture, CORS production et `JWT_SECRET` production.
- 2026-06-03: validations lancees via binaires locaux: typecheck server/client/mcp, tests server/client, lint server/client.
