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

Optional seed is currently a development-only step because the production image
does not ship the `tsx` dev dependency:

```bash
# Do not run in production until the seed script is compiled or made runtime-safe.
# docker compose exec api npm run db:seed -w server
```

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

## 7. Home-hosted production notes: Freebox + Cloudflare + Certbot

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

## 8. PostgreSQL remote access and Prisma migrations

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

## 9. Incident note: public domain points to API only

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
