# 🔧 Configuration & Docker

Ce dossier contient tous les fichiers de configuration et d'orchestration des services.

## 📋 Fichiers

### `docker-compose.yml`
Fichier d'orchestration Docker qui démarre les services :
- **PostgreSQL 16** - Base de données relationnelle
- **Redis 7** - Cache et session store
- **pgAdmin** - Interface web pour gérer PostgreSQL

### `.env.example`
Template pour les variables d'environnement. Dupliquez-le à la racine du projet :
```bash
cp .env.example ../.env
```

## 🚀 Démarrer les Services

```bash
# Démarrer tous les services en arrière-plan
docker-compose -f config/docker-compose.yml up -d

# Voir les logs
docker-compose -f config/docker-compose.yml logs -f

# Arrêter les services
docker-compose -f config/docker-compose.yml down

# Arrêter et supprimer les volumes (attention : données perdues !)
docker-compose -f config/docker-compose.yml down -v
```

## 🐘 PostgreSQL

**Connexion directe** :
```bash
psql -h localhost -U postgres -d suivi_sportif_v2
```

**Paramètres par défaut** :
- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `dev-password`
- Database: `suivi_sportif_v2`

**Health check** :
```bash
# Via psql
psql -h localhost -U postgres -c "SELECT 1"

# Via pg_isready
pg_isready -h localhost -U postgres
```

## 🔴 Redis

**Connexion directe** :
```bash
redis-cli
```

**Commandes utiles** :
```bash
PING                    # Vérifier la connexion
FLUSHDB                 # Vider la base courante
KEYS *                  # Lister toutes les clés
GET <key>               # Voir une valeur
DEL <key>               # Supprimer une clé
DBSIZE                  # Taille de la base
```

## 🖥️ pgAdmin

**URL** : http://localhost:5050

**Identifiants par défaut** :
- Email: `admin@example.com`
- Mot de passe: `admin`

**Ajouter PostgreSQL** :
1. Connexion → New → Server
2. Name: `suivi-sportif-db`
3. Host: `postgres` (nom du container)
4. Port: `5432`
5. User: `postgres`
6. Password: `dev-password`

## 📊 Healthchecks

Les services incluent des healthchecks automatiques :

```bash
# Voir l'état des services
docker-compose -f config/docker-compose.yml ps

# Attendre que les services soient prêts
docker-compose -f config/docker-compose.yml up -d
# Attendez que tous les services passent de "starting" à "healthy"
```

## 🔒 Sécurité en Production

**IMPORTANT** : Les identifiants par défaut ne sont pas sécurisés pour la production !

Pour la production, changez :
1. `POSTGRES_PASSWORD` en un mot de passe fort
2. `PGADMIN_PASSWORD` en un mot de passe fort
3. `JWT_SECRET` en une clé secrète aléatoire
4. Utilisez des services managés (AWS RDS, Azure Database, etc.)

## 🐛 Troubleshooting

### Les services ne démarrent pas
```bash
# Voir les erreurs
docker-compose -f config/docker-compose.yml logs

# Nettoyer et redémarrer
docker-compose -f config/docker-compose.yml down -v
docker-compose -f config/docker-compose.yml up -d
```

### Port déjà utilisé
```bash
# Trouver le processus
lsof -i :5432    # PostgreSQL
lsof -i :6379    # Redis
lsof -i :5050    # pgAdmin

# Tuer le processus
kill -9 <PID>
```

### Permission denied
```bash
# Donner les permissions au dossier data
sudo chown -R $(whoami) postgres_data redis_data
```

## 📝 Variables d'Environnement Personnalisées

Pour changer les ports ou identifiants, créez un fichier `.env.docker` :

```env
DB_PORT=5433
REDIS_PORT=6380
PGADMIN_PORT=5051
DB_USER=admin
DB_PASSWORD=secure-password
```

Puis lancez :
```bash
docker-compose -f config/docker-compose.yml --env-file .env.docker up -d
```

## 🔗 Références

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Redis Docker](https://hub.docker.com/_/redis)
- [pgAdmin Docker](https://hub.docker.com/r/dpage/pgadmin4/)
