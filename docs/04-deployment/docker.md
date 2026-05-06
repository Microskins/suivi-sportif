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
docker compose build
docker compose up -d
docker compose ps
```

Use `docker compose build --no-cache` only when the dependency cache must be
discarded. A cold `npm ci` can take several minutes on a small remote host.

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

Apply production migrations:

```bash
docker compose run --rm api npx prisma migrate deploy --schema server/prisma/schema.prisma
```

Seed the initial production account and base catalog. Do not commit the account
password. Either pass a password explicitly for this one command, or let the
script generate one and store the generated value securely:

```bash
docker compose exec -T api npm run db:seed:prod -w server

# Or with an explicit one-time password.
docker compose exec -T \
  -e SEED_ACCOUNT_PASSWORD='<strong-password>' \
  api npm run db:seed:prod -w server
```

Default seeded account:

```text
Email: admin@suivi-sportif.fr
Name: Admin Test
```

This account is a normal user in the current schema. A real admin role requires
a future Prisma migration.

Verify the seeded account and base data:

```bash
TOKEN="$(curl -sS -X POST https://suivi-sportif.fr/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@suivi-sportif.fr","password":"<password>"}' \
  | node -e 'let body=""; process.stdin.on("data", c => body += c); process.stdin.on("end", () => console.log(JSON.parse(body).data.token));')"

curl -sS https://suivi-sportif.fr/api/users/me \
  -H "Authorization: Bearer $TOKEN"

curl -sS https://suivi-sportif.fr/api/exercises \
  -H "Authorization: Bearer $TOKEN"

curl -sS https://suivi-sportif.fr/api/foods \
  -H "Authorization: Bearer $TOKEN"
```

After this seed, use `docs/03-api/data-entry.md` for quick production data entry
while the frontend creation interface is still being completed.

## 4. Nginx cutover

Use `deploy/nginx/suivi-sportif.fr.conf` as the site config.

```bash
sudo cp deploy/nginx/suivi-sportif.fr.conf /etc/nginx/sites-available/suivi-sportif.fr
sudo ln -sf /etc/nginx/sites-available/suivi-sportif.fr /etc/nginx/sites-enabled/suivi-sportif.fr
sudo nginx -t
sudo systemctl reload nginx
```

If the certificate files referenced by the Nginx config do not exist yet,
generate them first with Certbot:

```bash
sudo certbot certonly --nginx -d suivi-sportif.fr
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

### Automated deployment

Production deployments are automated by GitHub Actions on every push to `main`.
The workflow:

1. installs dependencies with dev tooling;
2. runs server typecheck, server tests, server build, client typecheck and
   client build;
3. connects to the production host over SSH;
4. runs `scripts/deploy-production.sh`.

Required GitHub secrets:

```text
PROD_SSH_HOST=<public SSH host or LAN host reachable from the runner>
PROD_SSH_USER=<deploy user>
PROD_SSH_KEY=<private deploy key>
PROD_SSH_PORT=22
```

Optional GitHub variable:

```text
PROD_PROJECT_DIR=/var/www/suivi-sportif
```

Important: `192.168.1.64` is a private LAN address. A GitHub-hosted runner
cannot reach it directly. For that address, either expose a secure SSH endpoint
through the router/VPN, or run the deploy job from a self-hosted runner inside
the LAN.

The deploy user must be able to:

- read and write `/var/www/suivi-sportif`;
- run `git` in that repository;
- run `docker compose`;
- read the production `.env` already present on the host.

Manual deployment uses the same script:

```bash
cd /var/www/suivi-sportif
bash scripts/deploy-production.sh
```

Rollback:

```bash
docker compose down
git checkout <known-good-commit>
docker compose build
docker compose up -d
```

## 7. PostgreSQL backups

Backups run from the app host and read `DATABASE_URL` from the running API
container. The database remains private; no PostgreSQL port needs to be opened
publicly.

Install the backup scripts on the production host:

```bash
cd /var/www/suivi-sportif
sudo install -m 0750 scripts/postgres-backup.sh /usr/local/bin/suivi-sportif-postgres-backup
sudo install -m 0750 scripts/postgres-restore-test.sh /usr/local/bin/suivi-sportif-postgres-restore-test
sudo mkdir -p /var/backups/suivi-sportif/postgres
sudo chmod 700 /var/backups/suivi-sportif/postgres
```

Run a manual backup:

```bash
sudo PROJECT_DIR=/var/www/suivi-sportif /usr/local/bin/suivi-sportif-postgres-backup
```

Expected result:

```text
Backup OK: /var/backups/suivi-sportif/postgres/suivi_sportif_<timestamp>.dump
```

Test restoring the latest backup into an isolated temporary PostgreSQL
container:

```bash
sudo /usr/local/bin/suivi-sportif-postgres-restore-test
```

Expected result:

```text
Restore test OK: /var/backups/suivi-sportif/postgres/suivi_sportif_<timestamp>.dump
```

Schedule a daily backup at 03:20 with 14-day local retention:

```bash
sudo tee /etc/cron.d/suivi-sportif-postgres-backup >/dev/null <<'EOF'
20 3 * * * root PROJECT_DIR=/var/www/suivi-sportif BACKUP_DIR=/var/backups/suivi-sportif/postgres RETENTION_DAYS=14 /usr/local/bin/suivi-sportif-postgres-backup >> /var/log/suivi-sportif-postgres-backup.log 2>&1
EOF
sudo chmod 644 /etc/cron.d/suivi-sportif-postgres-backup
```

Operational checks:

```bash
sudo ls -lh /var/backups/suivi-sportif/postgres
sudo tail -50 /var/log/suivi-sportif-postgres-backup.log
```

## 8. Home-hosted production notes: Freebox + Cloudflare + Certbot

The May 6, 2026 production install was hosted behind a Freebox with Cloudflare
DNS. These are the required network conditions for HTTPS to work.

### Freebox IPv4

If Freebox only allows port forwards above `49152`, the connection is using a
shared IPv4 range. Request an IPv4 Full Stack from the Free subscriber area,
then restart the Freebox.

After the restart, verify the public IPv4 on the app host:

```bash
curl -4 ifconfig.me
```

Use that public IPv4 in Cloudflare.

### Cloudflare DNS

During Certbot issuance, the root record must point directly to the app host:

```text
Type: A
Name: @
Content: <FREEBOX_FULL_STACK_PUBLIC_IPV4>
Proxy status: DNS only
TTL: Auto
```

Do not leave proxied Cloudflare records active while using the HTTP challenge.
`dig` must return the Freebox public IPv4, not Cloudflare IPs such as
`104.x.x.x`, `172.x.x.x`, or `2606:4700:...`.

```bash
dig +short suivi-sportif.fr
dig +short AAAA suivi-sportif.fr
```

If the app host has no real IPv6 route, remove or disable `AAAA` records for the
domain during certificate issuance.

### Freebox port forwarding

Forward public web ports to the app host LAN address. In the production install,
the app host was `192.168.1.64`:

```text
TCP 80  -> 192.168.1.64:80
TCP 443 -> 192.168.1.64:443
```

If UFW is active on the app host:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

Certbot will time out until port `80` is reachable from the public internet.

## 9. PostgreSQL remote access and Prisma migrations

The API host must be allowed in PostgreSQL `pg_hba.conf`. On the DB host, find
the active file:

```bash
sudo -u postgres psql -c "SHOW hba_file;"
```

Add an entry for the app host IP:

```conf
host    suivi_sportif_v2    suivi_sportif    192.168.1.64/32    scram-sha-256
```

Reload PostgreSQL:

```bash
sudo systemctl reload postgresql
```

Verify from the app host:

```bash
psql "postgresql://suivi_sportif:<PASSWORD>@192.168.1.6:5432/suivi_sportif_v2" -c "select current_user, current_database(), current_schema();"
psql "postgresql://suivi_sportif:<PASSWORD>@192.168.1.6:5432/suivi_sportif_v2" -c "create table test_permissions_from_app(id int); drop table test_permissions_from_app;"
```

If the production database is a new empty install and an earlier failed Prisma
migration was recorded, reset the empty schema and Prisma migration history:

```bash
sudo -u postgres psql -d suivi_sportif_v2
```

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public AUTHORIZATION suivi_sportif;
DROP TABLE IF EXISTS "_prisma_migrations";

ALTER DATABASE suivi_sportif_v2 OWNER TO suivi_sportif;
GRANT CONNECT ON DATABASE suivi_sportif_v2 TO suivi_sportif;
GRANT USAGE, CREATE ON SCHEMA public TO suivi_sportif;
GRANT ALL PRIVILEGES ON SCHEMA public TO suivi_sportif;
```

Then apply migrations from the app host:

```bash
cd /var/www/suivi-sportif
docker compose run --rm api npx prisma migrate deploy --schema server/prisma/schema.prisma
```

Expected migrations on a fresh database:

```text
20260506000000_init_core_schema
20260506074000_add_nutrition_tracking
```

## 10. Incident note: public domain points to API only

Observed from outside on May 5, 2026:

```bash
curl https://suivi-sportif.fr
```

returned the Fastify 404 JSON response:

```json
{"message":"Route GET:/ not found","error":"Not Found","statusCode":404}
```

while:

```bash
curl https://suivi-sportif.fr/health
```

returned the API health payload.

This means the domain is reachable, but public routing currently sends `/` and
`/mcp` to the API instead of routing:

- `/` to the frontend container on `127.0.0.1:5173`;
- `/api/` and `/health` to the API container on `127.0.0.1:3001`;
- `/mcp` to the MCP container on `127.0.0.1:3033`.

When server access is restored, run:

```bash
cd /var/www/suivi-sportif
git pull
docker compose build
docker compose up -d
docker compose ps
```

Then reinstall and reload the Nginx site config from this repository:

```bash
sudo cp deploy/nginx/suivi-sportif.fr.conf /etc/nginx/sites-available/suivi-sportif.fr
sudo ln -sf /etc/nginx/sites-available/suivi-sportif.fr /etc/nginx/sites-enabled/suivi-sportif.fr
sudo nginx -t
sudo systemctl reload nginx
```

Expected local checks on the server:

```bash
curl -I http://127.0.0.1:5173
curl -i http://127.0.0.1:3001/health
curl -i http://127.0.0.1:3033/health
```

Expected public checks:

```bash
curl -I https://suivi-sportif.fr
curl -i https://suivi-sportif.fr/health
curl -i https://suivi-sportif.fr/mcp
```

Expected public result:

- `/` returns the frontend HTML or a `200` frontend response;
- `/health` returns the API health JSON;
- `/mcp` without token returns `401 Unauthorized`, not Fastify `404`.
