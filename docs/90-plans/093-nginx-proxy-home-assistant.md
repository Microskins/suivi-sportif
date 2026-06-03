# Plan - Nginx proxy Home Assistant

## Objectif

- Ajouter un serveur Nginx dedie pour `home-assistant-te.freeboxos.fr`.
- Garder le site principal `suivi-sportif.fr` et `www.suivi-sportif.fr` sur la conf par defaut.

## Decisions

- Conserver `client/nginx/default.conf` comme conf de base pour le frontend.
- Ajouter un deuxieme bloc `server` dans cette conf pour proxyfier Home Assistant vers `192.168.1.5:8123`.
- Activer les headers WebSocket habituels pour Home Assistant.

## Todo

- [x] Creer ce plan.
- [x] Mettre a jour `client/nginx/default.conf`.
- [x] Mettre a jour l'index des plans si necessaire.
- [x] Verifier le diff final.

## Notes de verification

- 2026-06-03: `client/nginx/default.conf` mis a jour avec le host principal `suivi-sportif.fr` / `www.suivi-sportif.fr` et un serveur dedie pour `home-assistant-te.freeboxos.fr`.
- 2026-06-03: `git diff --check` passe.
- 2026-06-03: passage du proxy Home Assistant en `https://192.168.1.49:8123` avec `proxy_ssl_verify off` pour accepter un certificat local non standard.
- 2026-06-03: bloc Home Assistant remplace par `proxy_pass http://192.168.1.49:8123` et `map $http_upgrade $connection_upgrade` ajoute en tete du fichier pour les WebSockets.
- 2026-06-03: mise a jour de l'upstream Home Assistant vers `http://192.168.1.5:8123`.
- 2026-06-03: ajout d'un second bloc Home Assistant en `443 ssl` avec les headers `X-Forwarded-Proto https` et `X-Forwarded-Host` demandés.
