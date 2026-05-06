#!/usr/bin/env sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-/var/backups/suivi-sportif/postgres}"
BACKUP_FILE="${1:-${BACKUP_DIR}/latest.dump}"
POSTGRES_IMAGE="${POSTGRES_IMAGE:-postgres:16-alpine}"
CONTAINER_NAME="suivi-sportif-restore-test-$$"
RESTORE_DB="restore_test"
RESTORE_USER="restore_user"
RESTORE_PASSWORD="restore_password"

cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

BACKUP_FILE="$(readlink -f "$BACKUP_FILE")"

docker run -d --name "$CONTAINER_NAME" \
  -e POSTGRES_DB="$RESTORE_DB" \
  -e POSTGRES_USER="$RESTORE_USER" \
  -e POSTGRES_PASSWORD="$RESTORE_PASSWORD" \
  "$POSTGRES_IMAGE" >/dev/null

until docker exec "$CONTAINER_NAME" pg_isready -U "$RESTORE_USER" -d "$RESTORE_DB" >/dev/null 2>&1; do
  sleep 1
done

docker cp "$BACKUP_FILE" "${CONTAINER_NAME}:/tmp/restore.dump"

docker exec "$CONTAINER_NAME" pg_restore \
  --dbname="$RESTORE_DB" \
  --username="$RESTORE_USER" \
  --no-owner \
  --no-privileges \
  --exit-on-error \
  /tmp/restore.dump

docker exec "$CONTAINER_NAME" psql \
  --username="$RESTORE_USER" \
  --dbname="$RESTORE_DB" \
  --tuples-only \
  --command="select count(*) from information_schema.tables where table_schema = 'public';"

echo "Restore test OK: $BACKUP_FILE"
