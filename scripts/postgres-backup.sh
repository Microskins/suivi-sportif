#!/usr/bin/env sh
set -eu

PROJECT_DIR="${PROJECT_DIR:-/var/www/suivi-sportif}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/suivi-sportif/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
POSTGRES_IMAGE="${POSTGRES_IMAGE:-postgres:16-alpine}"

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_name="suivi_sportif_${timestamp}.dump"
backup_path="${BACKUP_DIR}/${backup_name}"
lock_dir="/tmp/suivi-sportif-postgres-backup.lock"

cleanup() {
  rmdir "$lock_dir" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

if ! mkdir "$lock_dir" 2>/dev/null; then
  echo "Backup already running: $lock_dir" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

database_url="$(
  cd "$PROJECT_DIR"
  docker compose exec -T api printenv DATABASE_URL | tr -d '\r'
)"

if [ -z "$database_url" ]; then
  echo "DATABASE_URL is empty; is the api container running?" >&2
  exit 1
fi

docker run --rm \
  --network host \
  -e DATABASE_URL="$database_url" \
  -v "${BACKUP_DIR}:/backups" \
  "$POSTGRES_IMAGE" \
  pg_dump \
    --dbname="$database_url" \
    --format=custom \
    --compress=9 \
    --no-owner \
    --no-privileges \
    --file="/backups/${backup_name}"

chmod 600 "$backup_path"
ln -sfn "$backup_path" "${BACKUP_DIR}/latest.dump"

find "$BACKUP_DIR" -maxdepth 1 -type f -name "suivi_sportif_*.dump" -mtime "+${RETENTION_DAYS}" -delete

bytes="$(wc -c < "$backup_path" | tr -d ' ')"
echo "Backup OK: $backup_path (${bytes} bytes)"
