#!/usr/bin/env bash
# Copie la conf Nginx versionnee vers le site actif, la valide et recharge
# Nginx; restaure la conf precedente si `nginx -t` echoue. Tourne en root:
# installe dans /usr/local/sbin et autorise au seul compte deploy via sudoers
# (voir docs/04-deployment/docker.md), il ne prend aucun argument.
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/suivi-sportif}"
SOURCE="$PROJECT_DIR/deploy/nginx/suivi-sportif.fr.conf"
NGINX_SITE="/etc/nginx/sites-available/suivi-sportif.fr"

BACKUP="$(mktemp)"
trap 'rm -f "$BACKUP"' EXIT
cat "$NGINX_SITE" >"$BACKUP" 2>/dev/null || : >"$BACKUP"

cp "$SOURCE" "$NGINX_SITE"
ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/suivi-sportif.fr
# Une conf invalide ne doit pas rester en place: le prochain reload/reboot
# ferait tomber tous les sites servis par ce Nginx.
if ! nginx -t; then
  if [ -s "$BACKUP" ]; then
    cp "$BACKUP" "$NGINX_SITE"
    echo "nginx -t failed, previous config restored." >&2
  fi
  exit 1
fi
systemctl reload nginx
echo "Nginx OK: $NGINX_SITE synced from $SOURCE"
