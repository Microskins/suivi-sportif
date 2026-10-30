#!/usr/bin/env sh
# Sauvegarde du volume `voyage-uploads` (traces GPX et photos du site Voyage),
# qui n'est pas en base: postgres-backup.sh ne le couvre pas. Lance a chaque
# deploiement par deploy-production.sh, et utilisable en cron comme lui.
set -eu

API_CONTAINER="${API_CONTAINER:-suivi-sportif-api}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/suivi-sportif/voyage-uploads}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
ALPINE_IMAGE="${ALPINE_IMAGE:-alpine:3.20}"

# Le nom reel du volume est prefixe par le projet Compose: on le lit sur le
# conteneur api plutot que de le deviner.
volume="$(docker inspect "$API_CONTAINER" \
  --format '{{range .Mounts}}{{if eq .Destination "/app/uploads"}}{{.Name}}{{end}}{{end}}' \
  2>/dev/null || true)"

if [ -z "$volume" ]; then
  echo "No voyage-uploads volume on $API_CONTAINER yet: nothing to back up."
  exit 0
fi

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
archive="voyage-uploads_${timestamp}.tar.gz"

# Tout passe par un conteneur root: l'utilisateur du runner n'a pas besoin
# des droits d'ecriture sur /var/backups.
docker run --rm \
  -v "${volume}:/data:ro" \
  -v "${BACKUP_DIR}:/backups" \
  "$ALPINE_IMAGE" \
  sh -c "chmod 700 /backups \
    && tar czf /backups/${archive} -C /data . \
    && chmod 600 /backups/${archive} \
    && ln -sfn ${archive} /backups/latest.tar.gz \
    && find /backups -maxdepth 1 -type f -name 'voyage-uploads_*.tar.gz' -mtime +${RETENTION_DAYS} -delete"

echo "Backup OK: ${BACKUP_DIR}/${archive} (volume ${volume})"
