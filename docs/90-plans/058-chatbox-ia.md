# Plan - Assistant IA MCP

## Objectif

- Ajouter une chatbox IA capable de transformer une demande en brouillon d'action sur les donnees du compte connecte.
- Couvrir progressivement le profil, les repas, les seances, les mensurations et les objectifs.
- Reutiliser les API metier existantes et leurs regles de validation, d'ownership et de securite.
- S'appuyer sur le serveur MCP existant quand il sert de couche d'outils pour l'assistant.
- Garder la main utilisateur avec une confirmation explicite avant chaque creation, modification ou suppression.

## Decisions

- La chatbox vit dans le dashboard et peut proposer des actions selon le contexte courant.
- L'assistant ne cible que l'utilisateur authentifie et ne peut modifier que son propre profil.
- Le serveur porte la cle IA via variable d'environnement et ne l'expose jamais au client.
- Le MCP expose les outils metier de l'assistant, mais ces outils doivent continuer a passer par l'API Fastify.
- Le navigateur n'appelle pas directement le MCP: la chatbox parle au backend, qui orchestre l'IA et les outils.
- Les reponses IA sont normalisees en brouillons d'action structures avant application.
- Les repas, aliments et objectifs nutrition peuvent s'appuyer sur les outils MCP deja presents.
- Les seances, mensurations, objectifs corps/sport et profil necessitent des outils MCP dedies.
- Les changements sensibles comme l'email ou le mot de passe conservent la confirmation du mot de passe actuel.
- En cas d'echec IA, l'utilisateur conserve les formulaires manuels classiques.

## Exemples cibles

- "Tu peux rajouter mon repas de ce midi ? Riz, poulet, banane."
- "Ajoute ma pesee du jour a 82,4 kg."
- "Planifie une seance push demain a 18h avec developpe couche et dips."
- "Change mon email de profil."
- "Cree un objectif corps pour descendre a 80 kg avant septembre."

## Todo

- [x] Creer ce plan.
- [x] Recrire l'idee 06 avec le nouveau cadrage.
- [x] Ajouter le plan a l'index.
- [x] Elargir le cadrage de la chatbox au-dela du profil.
- [x] Inventorier les outils MCP existants et manquants par domaine.
- [x] Ajouter ou adapter les outils MCP profil, seances, mensurations et objectifs via l'API.
- [x] Definir le contrat backend de brouillon assistant et la validation de sortie.
- [x] Brancher l'orchestration MCP pour enrichir les brouillons depuis les outils.
- [x] Ajouter le branchement IA cote serveur avec cle d'environnement.
- [x] Ajouter la chatbox dans le dashboard cote frontend.
- [x] Reutiliser les stores existants pour appliquer ou rafraichir les changements confirmes.
- [x] Ajouter les tests API, composants et validations utiles.
- [x] Mettre a jour les notes de verification et les docs si le comportement public evolue.
- [x] Ajouter un historique de conversation assistant sans donnees sommeil.
- [x] Etendre les brouillons aux modifications/suppressions repas, seances et mensurations avec confirmation.
- [x] Valider backend/frontend et documenter le comportement public.

## Notes de verification

- 2026-06-08: chantier cadre et docs only a ce stade; aucune validation applicative lancee encore.
- 2026-06-08: idee complementaire ajoutee dans `docs/06-idees/90-ia-idees.md` pour le diff avant application, les raccourcis de commandes et le journal leger des actions.
- 2026-06-08: `git diff --check` OK; `docs/90-plans/README.md` reference bien `058-chatbox-ia.md`; les chemins d'idee et de plan existent.
- 2026-06-08: decision ajoutee apres revue du workspace `mcp/`: le MCP peut porter les outils IA profil, mais les mutations passent toujours par l'API Fastify.
- 2026-06-08: cadrage elargi: la chatbox devient un assistant IA MCP multi-domaines, avec repas/aliments/objectifs nutrition deja proches des outils MCP existants et seances/mensurations/profil a completer.
- 2026-06-08: premiere tranche dev MCP ajoutee: outils profil, exercices, seances, objectifs utilisateur et mensurations, tous branches via l'API Fastify.
- 2026-06-08: `npm` indisponible dans PowerShell local; validations lancees via WSL.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run mcp:typecheck"` OK.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w mcp"` OK, 7 fichiers et 20 tests passes.
- 2026-06-08: outils MCP metier separes dans `domain-tools.ts` et `domain-tool-schemas.ts` pour garder `mcp-server.ts` sous la limite de maintenance.
- 2026-06-08: endpoint protege `POST /api/assistant/draft` ajoute pour produire des brouillons confirmables sans mutation immediate.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w server"` OK.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w server -- --run src/routes/api.test.ts"` OK, 142 tests passes.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run build -w server"` OK; `server/dist/` supprime apres verification.
- 2026-06-08: provider Anthropic optionnel ajoute via `ANTHROPIC_API_KEY` et `ANTHROPIC_MODEL`; fallback local conserve si la cle manque, l'appel echoue ou la sortie IA est invalide.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w server"` OK apres branchement Anthropic.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w server -- --run src/routes/api.test.ts"` OK, 143 tests passes.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run build -w server"` OK; `server/dist/` supprime apres verification.
- 2026-06-08: orchestration en lecture seule ajoutee cote assistant: resolution des aliments et exercices connus dans les brouillons, sans mutation avant confirmation.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w server"` OK apres orchestration.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w server -- --run src/routes/api.test.ts"` OK, 145 tests passes.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run build -w server"` OK; `server/dist/` supprime apres verification.
- 2026-06-08: chatbox assistant ajoutee dans le dashboard frontend avec appel `POST /api/assistant/draft`, exemples rapides et affichage du brouillon structure.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w client"` OK.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w client -- --run src/components/dashboard/AssistantChatbox.test.tsx"` OK, 2 tests passes.
- 2026-06-08: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run build -w client"` OK avec avertissement bundle Vite > 500 kB deja non bloquant; `client/dist/` supprime apres verification.
- 2026-06-08: verification visuelle Browser non lancee car le navigateur integre `iab` est indisponible dans cette session; demarrage Vite verifie via `timeout 12s env VITE_BYPASS_AUTH=true npm run dev -w client -- --host 127.0.0.1`, serveur pret sur `http://127.0.0.1:5173/` avant arret volontaire par timeout.
- 2026-06-09: confirmation des brouillons branchee cote dashboard: application via stores existants pour repas, mensurations, seances, objectifs utilisateur et profil; les brouillons incomplets restent bloques par `missingFields`.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w client"` OK apres confirmation.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w client -- --run src/components/dashboard/AssistantChatbox.test.tsx"` OK, 3 tests passes.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run build -w client"` OK avec avertissement bundle Vite > 500 kB deja non bloquant; `client/dist/` supprime apres verification.
- 2026-06-09: historique local assistant ajoute dans la chatbox et transmis au backend via `history`; le prompt exclut explicitement toute action sommeil.
- 2026-06-09: actions assistant etendues aux brouillons `update_*` et `delete_*` pour repas, seances et mensurations; les actions sensibles restent bloquees par `missingFields` tant que `id` manque.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w server"` OK.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run typecheck -w client"` OK.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w server -- --run src/routes/api.test.ts"` OK, 146 tests passes.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run test -w client -- --run src/components/dashboard/AssistantChatbox.test.tsx"` OK, 4 tests passes.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run build -w server"` OK; `server/dist/` supprime apres verification.
- 2026-06-09: `wsl bash -lc "cd /mnt/g/suivi-sportif && npm run build -w client"` OK avec avertissement bundle Vite > 500 kB deja non bloquant; `client/dist/` supprime apres verification.
- 2026-06-09: correction du parsing repas assistant pour extraire les quantites `g/gr` et normaliser les sorties IA imparfaites avant enrichissement.
- 2026-06-09: l'orchestration repas conserve maintenant `quantityGrams` quand un aliment est reconnu, tolere les variantes singulier/pluriel comme `fruit rouge` / `Fruits rouges` et recalcule `reply` apres enrichissement.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run test -w server -- --run src/routes/api.test.ts -t "breakfast draft"'` OK, cas exact petit dejeuner avec 3 aliments.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run typecheck -w server'` OK.
- 2026-06-09: `wsl bash -lc 'cd /mnt/g/suivi-sportif && npm run test -w server -- --run'` OK, 184 tests passes.
