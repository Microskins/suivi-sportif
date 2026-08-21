# Plan - Fix 502 proxy Home Assistant (ha-come.fr)

## Objectif

- Corriger le `502 Bad Gateway` sur `https://ha-come.fr` qui empechait la
  connexion MCP Home Assistant depuis Claude Desktop.
- Documenter les deux causes racines trouvees pour eviter qu'elles se
  reproduisent.

## Decisions

- Ne pas modifier le contenu de `deploy/nginx/suivi-sportif.fr.conf`: il
  contenait deja la bonne IP (`192.168.1.7`), c'est la conf reellement chargee
  sur la VM de production qui avait diverge du depot.
- Automatiser la synchronisation Nginx dans `scripts/deploy-production.sh`
  plutot que de compter sur une procedure manuelle suivie une seule fois a
  l'installation.
- Ne pas remettre de bloc `http:` dans `configuration.yaml` de Home Assistant:
  la configuration HTTP (proxies de confiance) est desormais geree depuis
  l'interface Home Assistant (Reglages > Systeme > Reseau), la config YAML
  n'etant migree qu'une seule fois puis ignoree.

## Todo

- [x] Diagnostiquer la connectivite reseau VM -> Pi (OK, meme sous-reseau
      `192.168.1.0/24`).
- [x] Identifier la config Nginx reellement chargee sur la VM vs celle du
      depot.
- [x] Corriger le symlink `sites-enabled` casse sur la VM de production.
- [x] Identifier le rejet cote Home Assistant (`trusted_proxies` non pris en
      compte).
- [x] Configurer le proxy de confiance via l'UI Home Assistant.
- [x] Automatiser la synchronisation Nginx dans le script de deploiement.
- [x] Mettre a jour l'index des plans et les docs de deploiement.

## Notes de verification

- 2026-08-21: `curl -v http://192.168.1.7:8123/api/mcp` execute depuis la VM
  de production (`192.168.1.64`) repond `405` -> la connectivite reseau
  VM/Pi est saine, le `502` vient de Nginx.
- 2026-08-21: `sudo nginx -T` sur la VM montre un `proxy_pass
  http://192.168.1.5:8123` (IP obsolete), alors que
  `deploy/nginx/suivi-sportif.fr.conf` du depot contient `192.168.1.7`.
  Cause: `/etc/nginx/sites-enabled/suivi-sportif.fr` etait un fichier
  independant (pas un symlink vers `sites-available/`), donc les
  deploiements automatises ne le mettaient jamais a jour malgre le
  `sudo nginx -t && systemctl reload nginx` deja present dans
  `scripts/deploy-production.sh`.
- 2026-08-21: resynchronisation manuelle (`cp` du fichier du depot vers
  `sites-available/`, recreation du symlink `sites-enabled` ->
  `sites-available/`), puis `nginx -t` et `reload`. Le `502` disparait: Home
  Assistant repond `405` via `ha-come.fr`, mais renvoie ensuite un
  `400 Bad Request`.
- 2026-08-21: les logs Home Assistant (`docker logs homeassistant`) montrent
  `A request from a reverse proxy was received from 192.168.1.64, but your
  HTTP integration is not set-up for reverse proxies`. Un bloc `http:
  use_x_forwarded_for / trusted_proxies` ajoute dans `configuration.yaml`
  reste sans effet.
- 2026-08-21: lecture du code source installe
  (`homeassistant/components/http/config.py`, version `2026.8.2`) confirme
  que la config YAML `http:` n'est migree qu'une seule fois vers un stockage
  interne (`.storage/http`, `yaml_migration_done: true`); toute modification
  YAML posterieure a la migration est ignoree et genere un avertissement
  Repairs ("La configuration YAML HTTP est ignoree apres la migration").
- 2026-08-21: proxy de confiance (`192.168.1.64`, `use_x_forwarded_for`)
  configure depuis l'UI Home Assistant (Reglages > Systeme > Reseau >
  Serveur HTTP > Proxy inverse), avec redemarrage automatique de Home
  Assistant a l'enregistrement.
- 2026-08-21: verification finale -- `POST https://ha-come.fr/api/mcp`
  renvoie `401 Unauthorized` (endpoint atteint, authentification MCP requise
  comme attendu) au lieu de `502`/`400`. Site principal `suivi-sportif.fr`
  non affecte (`/health` toujours `200`).
- 2026-08-21: `scripts/deploy-production.sh` modifie pour copier
  `deploy/nginx/suivi-sportif.fr.conf` vers `/etc/nginx/sites-available/` et
  recreer le symlink `sites-enabled` a chaque deploiement qui touche la conf
  Nginx, au lieu de seulement tester/recharger la conf deja presente sur
  disque -- evite que ce type de derive se reproduise silencieusement.
