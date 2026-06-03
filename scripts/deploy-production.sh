#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/suivi-sportif}"
REMOTE_NAME="${REMOTE_NAME:-origin}"
BRANCH_NAME="${BRANCH_NAME:-main}"
HEALTH_RETRIES="${HEALTH_RETRIES:-30}"
HEALTH_SLEEP_SECONDS="${HEALTH_SLEEP_SECONDS:-3}"
DEPLOY_SSH_KEY_PATH="${DEPLOY_SSH_KEY_PATH:-}"

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
require_command sudo

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

PREVIOUS_COMMIT="$(git rev-parse HEAD)"

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
CURRENT_COMMIT="$(git rev-parse HEAD)"
git rev-parse --short HEAD

if ! git diff --quiet "$PREVIOUS_COMMIT" "$CURRENT_COMMIT" -- client/nginx deploy/nginx; then
  log "Validate and reload Nginx"
  git diff --name-only "$PREVIOUS_COMMIT" "$CURRENT_COMMIT" -- client/nginx deploy/nginx
  sudo -n nginx -t
  sudo -n systemctl reload nginx
else
  log "Skip Nginx reload"
fi

log "Build images"
docker compose build

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

log "Recent logs"
docker compose logs api --tail 50
docker compose logs client --tail 30
docker compose logs mcp --tail 30

log "Deploy complete"
