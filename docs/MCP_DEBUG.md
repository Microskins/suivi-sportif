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
- `nutrition-future-scope`: rappelle que l'app ne stocke pas encore repas,
  calories ou objectifs nutritionnels.

## Tests

```bash
npm run mcp:typecheck
npm run test -w mcp
```

Le script de test MCP force `TMPDIR=/tmp` pour eviter le probleme WSL/Windows ou
Vitest tente de creer un dossier temporaire dans `AppData/Local/Temp`.

