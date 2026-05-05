# Docker Deployment

This runbook migrates production from PM2 to Docker Compose while keeping the same Nginx entrypoint.

## 1. Preconditions

- Docker engine and Docker Compose plugin installed on the host.
- A valid `.env` at repo root with at least:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `API_PUBLIC_BASE_URL` (recommended: `https://suivi-sportif.fr`)
  - `MCP_AUTH_TOKEN`
- Nginx installed on host machine.

## 2. Build and start containers

Run on the API/frontend host:

```bash
cd /var/www/suivi-sportif
docker compose build --no-cache
docker compose up -d
docker compose ps
```

Container ports are bound locally:

- API: `127.0.0.1:3001`
- Frontend: `127.0.0.1:5173`
- MCP: `127.0.0.1:3033`

## 3. Verify runtime

```bash
curl -i http://127.0.0.1:3001/health
curl -I http://127.0.0.1:5173
curl -i http://127.0.0.1:3033/health
docker compose logs api --tail 100
docker compose logs client --tail 100
docker compose logs mcp --tail 100
```

Optional schema sync and seed:

```bash
docker compose exec api npm run db:push -w server
docker compose exec api npm run db:seed -w server
```

## 4. Nginx cutover

Use `deploy/nginx/suivi-sportif.fr.conf` as the site config.

```bash
sudo cp deploy/nginx/suivi-sportif.fr.conf /etc/nginx/sites-available/suivi-sportif.fr
sudo ln -sf /etc/nginx/sites-available/suivi-sportif.fr /etc/nginx/sites-enabled/suivi-sportif.fr
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Decommission PM2

Only after Docker + Nginx checks are green:

```bash
pm2 list
pm2 stop all
pm2 delete all
pm2 save
```

## 6. Operations

Update deployment:

```bash
git pull
docker compose build
docker compose up -d
```

Rollback:

```bash
docker compose down
git checkout <known-good-commit>
docker compose up -d
```
