# Deploiement Docker

Ce runbook decrit le passage production de PM2 vers Docker Compose en gardant
le meme point d'entree Nginx.

## 1. Prerequis

- Docker Engine et le plugin Docker Compose installes sur l'hote.
- Un fichier `.env` valide a la racine du depot avec au minimum:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `API_PUBLIC_BASE_URL` (recommande: `https://suivi-sportif.fr`)
  - `MCP_AUTH_TOKEN`
- Nginx installe sur la machine hote.

## 2. Construire et demarrer les conteneurs

Sur l'hote API/frontend:

```bash
cd /var/www/suivi-sportif
docker compose build
docker compose up -d
docker compose ps
```

Utiliser `docker compose build --no-cache` seulement quand le cache de
dependances doit etre ignore. Un `npm ci` a froid peut prendre plusieurs
minutes sur un petit serveur distant.

Les ports des conteneurs sont exposes localement:

- API: `127.0.0.1:3001`
- Frontend: `127.0.0.1:5173`
- MCP: `127.0.0.1:3033`

## 3. Verifier l'execution

```bash
curl -i http://127.0.0.1:3001/health
curl -I http://127.0.0.1:5173
curl -i http://127.0.0.1:3033/health
docker compose logs api --tail 100
docker compose logs client --tail 100
docker compose logs mcp --tail 100
```

Appliquer les migrations de production:

```bash
docker compose run --rm api npx prisma migrate deploy --schema server/prisma/schema.prisma
```

Creer le compte initial de production et le catalogue de base. Ne jamais
commiter le mot de passe du compte. Passer un mot de passe explicitement pour
cette commande, ou laisser le script en generer un et stocker la valeur dans un
endroit sur:

```bash
docker compose exec -T api npm run db:seed:prod -w server

# Ou avec un mot de passe explicite a usage unique.
docker compose exec -T \
  -e SEED_ACCOUNT_PASSWORD='<mot-de-passe-fort>' \
  api npm run db:seed:prod -w server
```

Compte cree par defaut:

```text
Email: admin@suivi-sportif.fr
Name: Admin Test
```

Ce compte est un utilisateur normal dans le schema actuel. Un vrai role admin
necessitera une future migration Prisma.

Verifier le compte cree et les donnees de base:

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

Apres ce seed, utiliser `docs/03-api/data-entry.md` pour saisir rapidement des
donnees de production tant que l'interface frontend de creation n'est pas
terminee.

## 4. Bascule Nginx

Utiliser `deploy/nginx/suivi-sportif.fr.conf` comme configuration de site.

```bash
sudo cp deploy/nginx/suivi-sportif.fr.conf /etc/nginx/sites-available/suivi-sportif.fr
sudo ln -sf /etc/nginx/sites-available/suivi-sportif.fr /etc/nginx/sites-enabled/suivi-sportif.fr
sudo nginx -t
sudo systemctl reload nginx
```

Si les fichiers de certificat references par la configuration Nginx n'existent
pas encore, les generer d'abord avec Certbot:

```bash
sudo certbot certonly --nginx -d suivi-sportif.fr
```

## 5. Arreter PM2

Seulement apres validation de Docker et Nginx:

```bash
pm2 list
pm2 stop all
pm2 delete all
pm2 save
```

## 6. Operations

### Deploiement automatise

Les deploiements production sont automatises par GitHub Actions a chaque push
sur `main`. Le workflow:

1. installe les dependances avec l'outillage de developpement;
2. lance le typecheck serveur, les tests serveur, le build serveur, le
   typecheck client et le build client;
3. lance le job de deploiement sur le runner self-hosted de production;
4. execute `scripts/deploy-production.sh` localement sur l'hote production.

Variable GitHub optionnelle:

```text
PROD_PROJECT_DIR=/var/www/suivi-sportif
```

Aucun secret SSH de production n'est requis dans GitHub Actions. L'hote de
production n'est pas expose en SSH; il lui faut seulement un acces sortant vers
GitHub pour le runner et pour `git fetch` / `git pull`.

Installer le runner sur l'hote de production comme runner limite au depot
`Microskins/suivi-sportif`. Recuperer le token courant depuis l'interface
GitHub:

```text
Repository -> Settings -> Actions -> Runners -> New self-hosted runner
```

Choisir Linux x64 dans l'interface GitHub et garder la page ouverte; le token
expire rapidement.

Creer un utilisateur Linux dedie et lui donner acces a Docker:

```bash
sudo adduser deploy
sudo usermod -aG docker deploy
```

Si `adduser` demande un mot de passe, utiliser un mot de passe temporaire fort
et le stocker de facon sure pendant l'installation du runner. Le compte
`deploy` est destine au service runner, pas a une connexion quotidienne par mot
de passe. Une fois le service installe et verifie, verrouiller la connexion par
mot de passe:

```bash
sudo passwd -l deploy
```

S'assurer que le checkout de production appartient a `deploy` avant le premier
deploiement automatise:

```bash
sudo chown -R deploy:deploy /var/www/suivi-sportif
```

Installer le runner avec le compte `deploy`. Utiliser exactement la commande de
telechargement affichee par GitHub pour Linux ARM64, puis configurer le label de
production:

```bash
sudo -iu deploy
mkdir -p ~/actions-runner
cd ~/actions-runner

# Copier les commandes courantes de telechargement et d'extraction Linux x64
# affichees par GitHub.
# Exemple de forme seulement; utiliser la version et le checksum courants:
# curl -o actions-runner-linux-x64-<version>.tar.gz -L https://github.com/actions/runner/releases/download/<version>/actions-runner-linux-x64-<version>.tar.gz
# tar xzf ./actions-runner-linux-x64-<version>.tar.gz

./config.sh --url https://github.com/Microskins/suivi-sportif --token <runner-token> --labels production
exit
```

Quand le script pose des questions:

- nom du runner: `prod-192-168-1-64`;
- groupe du runner: garder la valeur par defaut;
- dossier de travail: garder `_work`.

GitHub ajoute automatiquement les labels `self-hosted`, `linux` et `x64`. Le
label manuel requis par le workflow est `production`.

Enregistrer le runner comme service:

```bash
cd /home/deploy/actions-runner
sudo ./svc.sh install deploy
sudo ./svc.sh start
sudo ./svc.sh status
```

Verifier que l'utilisateur du runner peut deployer sans `sudo`:

```bash
sudo -iu deploy
cd /var/www/suivi-sportif
git status
git fetch origin main
docker compose ps
exit
```

Le runner doit apparaitre en ligne dans:

```text
Repository -> Settings -> Actions -> Runners
```

Labels attendus:

```text
self-hosted
linux
x64
production
```

L'utilisateur `deploy` doit pouvoir:

- lire et ecrire `/var/www/suivi-sportif`;
- lancer `git` dans ce depot, dont `git fetch` et `git pull --ff-only`;
- lancer `docker compose`;
- lire le `.env` de production deja present sur l'hote.

Le deploiement manuel utilise le meme script:

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

## 7. Sauvegardes PostgreSQL

Les sauvegardes sont lancees depuis l'hote applicatif et lisent `DATABASE_URL`
depuis le conteneur API en cours d'execution. La base reste privee; aucun port
PostgreSQL ne doit etre ouvert publiquement.

Installer les scripts de sauvegarde sur l'hote production:

```bash
cd /var/www/suivi-sportif
sudo install -m 0750 scripts/postgres-backup.sh /usr/local/bin/suivi-sportif-postgres-backup
sudo install -m 0750 scripts/postgres-restore-test.sh /usr/local/bin/suivi-sportif-postgres-restore-test
sudo mkdir -p /var/backups/suivi-sportif/postgres
sudo chmod 700 /var/backups/suivi-sportif/postgres
```

Lancer une sauvegarde manuelle:

```bash
sudo PROJECT_DIR=/var/www/suivi-sportif /usr/local/bin/suivi-sportif-postgres-backup
```

Resultat attendu:

```text
Backup OK: /var/backups/suivi-sportif/postgres/suivi_sportif_<timestamp>.dump
```

Tester la restauration de la derniere sauvegarde dans un conteneur PostgreSQL
temporaire et isole:

```bash
sudo /usr/local/bin/suivi-sportif-postgres-restore-test
```

Resultat attendu:

```text
Restore test OK: /var/backups/suivi-sportif/postgres/suivi_sportif_<timestamp>.dump
```

Planifier une sauvegarde quotidienne a 03:20 avec 14 jours de retention locale:

```bash
sudo tee /etc/cron.d/suivi-sportif-postgres-backup >/dev/null <<'EOF'
20 3 * * * root PROJECT_DIR=/var/www/suivi-sportif BACKUP_DIR=/var/backups/suivi-sportif/postgres RETENTION_DAYS=14 /usr/local/bin/suivi-sportif-postgres-backup >> /var/log/suivi-sportif-postgres-backup.log 2>&1
EOF
sudo chmod 644 /etc/cron.d/suivi-sportif-postgres-backup
```

Controles operationnels:

```bash
sudo ls -lh /var/backups/suivi-sportif/postgres
sudo tail -50 /var/log/suivi-sportif-postgres-backup.log
```

## 8. Notes production maison: Freebox + Cloudflare + Certbot

L'installation production du 6 mai 2026 etait hebergee derriere une Freebox
avec DNS Cloudflare. Les conditions reseau suivantes sont necessaires pour que
HTTPS fonctionne.

### IPv4 Freebox

Si Freebox autorise uniquement des redirections de ports au-dessus de `49152`,
la connexion utilise une plage IPv4 partagee. Demander une IPv4 Full Stack dans
l'espace abonne Free, puis redemarrer la Freebox.

Apres redemarrage, verifier l'IPv4 publique sur l'hote applicatif:

```bash
curl -4 ifconfig.me
```

Utiliser cette IPv4 publique dans Cloudflare.

### DNS Cloudflare

Pendant l'emission Certbot, l'enregistrement racine doit pointer directement
vers l'hote applicatif:

```text
Type: A
Name: @
Content: <FREEBOX_FULL_STACK_PUBLIC_IPV4>
Proxy status: DNS only
TTL: Auto
```

Ne pas laisser d'enregistrements Cloudflare proxifies actifs pendant le
challenge HTTP. `dig` doit retourner l'IPv4 publique Freebox, pas des IP
Cloudflare comme `104.x.x.x`, `172.x.x.x` ou `2606:4700:...`.

```bash
dig +short suivi-sportif.fr
dig +short AAAA suivi-sportif.fr
```

Si l'hote applicatif n'a pas de vraie route IPv6, supprimer ou desactiver les
enregistrements `AAAA` du domaine pendant l'emission du certificat.

### Redirection de ports Freebox

Rediriger les ports web publics vers l'adresse LAN de l'hote applicatif. Lors
de l'installation production, l'hote applicatif etait `192.168.1.64`:

```text
TCP 80  -> 192.168.1.64:80
TCP 443 -> 192.168.1.64:443
```

Si UFW est actif sur l'hote applicatif:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

Certbot expirera tant que le port `80` n'est pas joignable depuis Internet.

## 9. Acces distant PostgreSQL et migrations Prisma

L'hote API doit etre autorise dans le fichier PostgreSQL `pg_hba.conf`. Sur
l'hote DB, trouver le fichier actif:

```bash
sudo -u postgres psql -c "SHOW hba_file;"
```

Ajouter une entree pour l'IP de l'hote applicatif:

```conf
host    suivi_sportif_v2    suivi_sportif    192.168.1.64/32    scram-sha-256
```

Recharger PostgreSQL:

```bash
sudo systemctl reload postgresql
```

Verifier depuis l'hote applicatif:

```bash
psql "postgresql://suivi_sportif:<PASSWORD>@192.168.1.6:5432/suivi_sportif_v2" -c "select current_user, current_database(), current_schema();"
psql "postgresql://suivi_sportif:<PASSWORD>@192.168.1.6:5432/suivi_sportif_v2" -c "create table test_permissions_from_app(id int); drop table test_permissions_from_app;"
```

Si la base de production est une nouvelle installation vide et qu'une migration
Prisma echouee a deja ete enregistree, reinitialiser le schema vide et
l'historique Prisma:

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

Puis appliquer les migrations depuis l'hote applicatif:

```bash
cd /var/www/suivi-sportif
docker compose run --rm api npx prisma migrate deploy --schema server/prisma/schema.prisma
```

Migrations attendues sur une base neuve:

```text
20260506000000_init_core_schema
20260506074000_add_nutrition_tracking
```

## 10. Note d'incident: le domaine public pointe seulement vers l'API

Observation depuis l'exterieur le 5 mai 2026:

```bash
curl https://suivi-sportif.fr
```

retournait la reponse JSON 404 de Fastify:

```json
{"message":"Route GET:/ not found","error":"Not Found","statusCode":404}
```

alors que:

```bash
curl https://suivi-sportif.fr/health
```

retournait le payload de sante de l'API.

Cela signifie que le domaine est joignable, mais que le routage public envoie
actuellement `/` et `/mcp` vers l'API au lieu de router:

- `/` vers le conteneur frontend sur `127.0.0.1:5173`;
- `/api/` et `/health` vers le conteneur API sur `127.0.0.1:3001`;
- `/mcp` vers le conteneur MCP sur `127.0.0.1:3033`.

Quand l'acces serveur est retabli, lancer:

```bash
cd /var/www/suivi-sportif
git pull
docker compose build
docker compose up -d
docker compose ps
```

Puis reinstaller et recharger la configuration Nginx depuis ce depot:

```bash
sudo cp deploy/nginx/suivi-sportif.fr.conf /etc/nginx/sites-available/suivi-sportif.fr
sudo ln -sf /etc/nginx/sites-available/suivi-sportif.fr /etc/nginx/sites-enabled/suivi-sportif.fr
sudo nginx -t
sudo systemctl reload nginx
```

Controles locaux attendus sur le serveur:

```bash
curl -I http://127.0.0.1:5173
curl -i http://127.0.0.1:3001/health
curl -i http://127.0.0.1:3033/health
```

Controles publics attendus:

```bash
curl -I https://suivi-sportif.fr
curl -i https://suivi-sportif.fr/health
curl -i https://suivi-sportif.fr/mcp
```

Resultat public attendu:

- `/` retourne le HTML frontend ou une reponse frontend `200`;
- `/health` retourne le JSON de sante de l'API;
- `/mcp` sans token retourne `401 Unauthorized`, pas une `404` Fastify.
