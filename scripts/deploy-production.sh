#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/suivi-sportif}"
REMOTE_NAME="${REMOTE_NAME:-origin}"
BRANCH_NAME="${BRANCH_NAME:-main}"
HEALTH_RETRIES="${HEALTH_RETRIES:-30}"
HEALTH_SLEEP_SECONDS="${HEALTH_SLEEP_SECONDS:-3}"
DEPLOY_SSH_KEY_PATH="${DEPLOY_SSH_KEY_PATH:-}"
COMPOSE_BUILD_SERVICES="${COMPOSE_BUILD_SERVICES:-api client mcp}"

log() {
  printf '\n== %s ==\n' "$*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

health_check() {
  local name="$1"
  local url="$2"

  for _ in $(seq 1 "$HEALTH_RETRIES"); do
    if curl -fsS "$url" >/dev/null; then
      echo "$name OK: $url"
      return 0
    fi

    sleep "$HEALTH_SLEEP_SECONDS"
  done

  echo "$name failed: $url" >&2
  return 1
}

require_command git
require_command docker
require_command curl

if [ -z "${GIT_SSH_COMMAND:-}" ]; then
  if [ -z "$DEPLOY_SSH_KEY_PATH" ]; then
    if [ -f "/home/deploy/.ssh/id_ed25519" ]; then
      DEPLOY_SSH_KEY_PATH="/home/deploy/.ssh/id_ed25519"
    elif [ -f "/home/deploy/.ssh/github_deploy" ]; then
      DEPLOY_SSH_KEY_PATH="/home/deploy/.ssh/github_deploy"
    fi
  fi

  if [ -n "$DEPLOY_SSH_KEY_PATH" ] && [ -f "$DEPLOY_SSH_KEY_PATH" ]; then
    export GIT_SSH_COMMAND="ssh -i $DEPLOY_SSH_KEY_PATH -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
  fi
fi

PRISMA_SCHEMA_PATH="server/prisma/schema.prisma"
FAILED_MIGRATION_NAME="20260511170754_exercise_relations_refactor"

log "Enter project"
cd "$PROJECT_DIR"
pwd

log "Check repository state"
if [ -n "$(git status --porcelain)" ]; then
  git status --short
  echo "Refusing deploy because the production working tree is not clean." >&2
  exit 1
fi

log "Fetch and update"
git fetch "$REMOTE_NAME" "$BRANCH_NAME"
git checkout "$BRANCH_NAME"
git pull --ff-only "$REMOTE_NAME" "$BRANCH_NAME"
git rev-parse --short HEAD

# On compare au site actif plutot qu'au commit precedent: une synchro sautee
# (sudo absent) est retentee a chaque deploiement au lieu d'etre oubliee.
# client/nginx n'est pas concerne: il est copie dans l'image client.
NGINX_SITE="/etc/nginx/sites-available/suivi-sportif.fr"
NGINX_SYNC_HELPER="/usr/local/sbin/suivi-sportif-nginx-sync"
if ! cmp -s deploy/nginx/suivi-sportif.fr.conf "$NGINX_SITE"; then
  log "Sync and reload Nginx"
  if sudo -n -l "$NGINX_SYNC_HELPER" >/dev/null 2>&1; then
    sudo -n "$NGINX_SYNC_HELPER"
  elif sudo -n true >/dev/null 2>&1; then
    sudo -n env PROJECT_DIR="$PWD" bash scripts/nginx-sync.sh
  else
    # Annotation visible dans le resume du run GitHub: sans elle, la conf
    # active derive en silence (CSP perimee, limite d'envoi trop basse).
    echo "::warning title=Nginx non synchronise::$NGINX_SITE differe de deploy/nginx/suivi-sportif.fr.conf et le compte $(id -un) n'a pas le droit sudo pour $NGINX_SYNC_HELPER (voir docs/04-deployment/docker.md, section 6)."
  fi
else
  log "Nginx config up to date"
fi

# Avant toute reconstruction: si la migration ou le redemarrage tourne mal,
# les traces GPX et photos du site Voyage restent recuperables.
log "Back up Voyage uploads"
if ! bash scripts/voyage-uploads-backup.sh; then
  echo "Voyage uploads backup failed; deploy continues." >&2
fi

log "Build images"
log "Prune unused Docker data"
docker system prune -af

for service in $COMPOSE_BUILD_SERVICES; do
  log "Build image: $service"
  docker compose build "$service"
done

log "Apply migrations"
set +e
MIGRATE_STATUS_OUTPUT="$(docker compose run --rm api npx prisma migrate status --schema "$PRISMA_SCHEMA_PATH" 2>&1)"
MIGRATE_STATUS_EXIT_CODE="$?"
set -e

# Prisma blocks `migrate deploy` if any migration previously failed. In production, we want a
# deterministic recovery path for known failed migrations so deploys can proceed.
if [ "$MIGRATE_STATUS_EXIT_CODE" -ne 0 ] && printf '%s' "$MIGRATE_STATUS_OUTPUT" | grep -q "$FAILED_MIGRATION_NAME"; then
  log "Recover failed prisma migration"
  docker compose run --rm api npx prisma migrate resolve --rolled-back "$FAILED_MIGRATION_NAME" --schema "$PRISMA_SCHEMA_PATH"
fi

docker compose run --rm api npx prisma migrate deploy --schema "$PRISMA_SCHEMA_PATH"

log "Restart services"
docker compose up -d
docker compose ps

log "Health checks"
health_check "API" "http://127.0.0.1:3001/health"
health_check "Client" "http://127.0.0.1:5173"
health_check "MCP" "http://127.0.0.1:3033/health"

# Reprise des voyages: relancable, elle ne touche jamais un voyage deja en
# base (modifie depuis l'admin). Non bloquante: elle echoue tant que le compte
# de VOYAGE_ADMIN_EMAILS n'est pas inscrit, sans que le site soit en cause.
log "Seed Voyage trips"
if ! docker compose exec -T api npm run db:seed:voyages -w server; then
  echo "Voyage seed skipped (VOYAGE_ADMIN_EMAILS empty or account not registered yet)." >&2
fi

log "Recent logs"
docker compose logs api --tail 50
docker compose logs client --tail 30
docker compose logs mcp --tail 30

log "Deploy complete"
