# Serveur MCP de debug

Le workspace `mcp/` expose un serveur MCP local pour aider un agent a debugger
l'application Suivi Sportif sans lancer de commandes arbitraires.

## Demarrage

```bash
npm run mcp:build
npm run mcp:start
```

Endpoint local:

```text
http://127.0.0.1:3033/mcp
```

Health check:

```bash
curl http://127.0.0.1:3033/health
```

## Variables

```env
MCP_HOST=127.0.0.1
MCP_PORT=3033
MCP_API_BASE_URL=http://127.0.0.1:3001
MCP_ALLOWED_HOSTS=localhost,127.0.0.1
MCP_ENABLE_MUTATIONS=false
MCP_AUTH_TOKEN=
```

Si `MCP_AUTH_TOKEN` est defini, le client doit envoyer soit:

```text
Authorization: Bearer <token>
```

soit:

```text
x-mcp-auth-token: <token>
```

## Exposition distante Docker

En production, le service MCP tourne dans Docker Compose et reste publie
uniquement sur l'interface locale du serveur:

```text
127.0.0.1:3033 -> suivi-sportif-mcp:3033
```

Nginx expose ensuite le transport MCP sur le meme domaine que l'application:

```text
https://suivi-sportif.fr/mcp
```

Variables recommandees dans le `.env` du serveur:

```env
MCP_HOST=0.0.0.0
MCP_PORT=3033
MCP_API_BASE_URL=http://api:3001
MCP_ALLOWED_HOSTS=suivi-sportif.fr,www.suivi-sportif.fr,localhost,127.0.0.1
MCP_AUTH_TOKEN="long-secret-token"
MCP_ENABLE_MUTATIONS=false
```

`MCP_AUTH_TOKEN` est obligatoire quand `NODE_ENV=production`. Sans token,
le container MCP refuse de demarrer.

Commandes de deploiement:

```bash
docker compose build mcp
docker compose up -d mcp
docker compose ps mcp
curl http://127.0.0.1:3033/health
```

Test attendu via Nginx sans token:

```bash
curl -i https://suivi-sportif.fr/mcp
```

La reponse doit etre `401 Unauthorized`.

Exemple de configuration client MCP distant:

```json
{
  "mcpServers": {
    "suivi-sportif-debug": {
      "url": "https://suivi-sportif.fr/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_AUTH_TOKEN>"
      }
    }
  }
}
```

## Outils exposes

- `diagnose_project`: typecheck serveur/client, tests serveur avec `TMPDIR=/tmp`,
  health API et disponibilite Docker.
- `run_check`: `typecheck`, `test`, `build`, `lint` sur `server`, `client` ou
  `all`.
- `check_api_health`: verifie `GET /health` et le format `{ data }`.
- `docker_status`, `docker_logs`: inspectent Docker Compose si Docker existe dans
  le shell.
- `db_summary`: compteurs Prisma et derniers elements rediges.
- `maintenance_prisma`, `docker_restart_service`: bloques par defaut.
- `list_foods`, `create_food`, `update_food`, `delete_food`: CRUD aliments
  via l'API, avec calories et macros pour 100g.
- `list_meals`, `create_meal`, `update_meal`, `delete_meal`: CRUD repas via
  l'API, avec aliments et quantites en grammes.
- `list_nutrition_goals`, `get_active_nutrition_goal`,
  `create_nutrition_goal`, `update_nutrition_goal`,
  `delete_nutrition_goal`: objectifs calories/macros via l'API.

Les outils metier appellent l'API Fastify et exigent un `jwtToken` utilisateur
dans l'input. Ils ne lisent pas Prisma directement et ne contournent donc pas
les permissions API.

Les outils mutables exigent:

```env
MCP_ENABLE_MUTATIONS=true
```

et un input:

```json
{ "confirm": "CONFIRM" }
```

## Prompts agents

- `debug-incident`: workflow de debug.
- `project-context`: architecture actuelle Fastify/React/Prisma.
- `nutrition-future-scope`: historique du scope nutrition; depuis la v1 backend,
  l'app stocke les aliments, repas et objectifs nutritionnels, mais pas encore
  de recommandations nutritionnelles automatiques.

## Schema nutrition

Apres deploiement du code backend, appliquer le schema Prisma sur la base:

```bash
npm run db:push -w server
npm run db:generate -w server
```

Pour une migration versionnee durable, utiliser plutot:

```bash
npm run db:migrate -w server
```

## Tests

```bash
npm run mcp:typecheck
npm run test -w mcp
```

Le script de test MCP force `TMPDIR=/tmp` pour eviter le probleme WSL/Windows ou
Vitest tente de creer un dossier temporaire dans `AppData/Local/Temp`.
