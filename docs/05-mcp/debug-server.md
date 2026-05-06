# Serveur MCP de debug

Le workspace `mcp/` expose un serveur MCP local pour aider un agent a debugger
l'application sans lancer de commandes arbitraires.

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

Si `MCP_AUTH_TOKEN` est defini, le client doit envoyer:

```text
Authorization: Bearer <token>
```

ou:

```text
x-mcp-auth-token: <token>
```

## Production Docker

En production, le service MCP tourne dans Docker Compose et reste publie sur
l'interface locale du serveur:

```text
127.0.0.1:3033 -> suivi-sportif-mcp:3033
```

Nginx expose ensuite le transport MCP sur le meme domaine que l'application:

```text
https://suivi-sportif.fr/mcp
```

Variables recommandees:

```env
MCP_HOST=0.0.0.0
MCP_PORT=3033
MCP_API_BASE_URL=http://api:3001
MCP_ALLOWED_HOSTS=suivi-sportif.fr,www.suivi-sportif.fr,localhost,127.0.0.1
MCP_AUTH_TOKEN="long-secret-token"
MCP_ENABLE_MUTATIONS=false
```

`MCP_AUTH_TOKEN` est obligatoire quand `NODE_ENV=production`.

Commandes:

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

## Configuration client distante

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

- `diagnose_project`: typecheck serveur/client, tests serveur, health API, Docker.
- `run_check`: `typecheck`, `test`, `build`, `lint` sur `server`, `client` ou `all`.
- `check_api_health`: verifie `GET /health` et le format `{ data }`.
- `docker_status`, `docker_logs`: inspectent Docker Compose.
- `db_summary`: compteurs Prisma et derniers elements rediges.
- `maintenance_prisma`, `docker_restart_service`: bloques par defaut.
- CRUD aliments, repas et objectifs nutritionnels via l'API.

Les outils metier appellent l'API Fastify et exigent un `jwtToken` utilisateur
dans l'input. Ils ne lisent pas Prisma directement.

Les outils mutables exigent:

```env
MCP_ENABLE_MUTATIONS=true
```

et un input:

```json
{
  "confirm": "CONFIRM"
}
```

## Prompts agents

- `debug-incident`: workflow de debug.
- `project-context`: architecture actuelle Fastify/React/Prisma.
- `nutrition-future-scope`: historique du scope nutrition.

## Tests

```bash
npm run mcp:typecheck
npm run test -w mcp
```

Le script de test MCP force `TMPDIR=/tmp` pour eviter un probleme WSL/Windows ou
Vitest tente de creer un dossier temporaire dans `AppData/Local/Temp`.
