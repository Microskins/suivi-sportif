# Guide complet de configuration - Suivi Sportif

## 📊 Étape par étape

### Phase 1 : Initialisation (Windows)

```batch
cd G:\suivi-sportif
setup.bat
```

**Que fait le script :**
1. ✓ Vérifie Node.js
2. ✓ Crée la structure des répertoires
3. ✓ Installe les dépendances (npm install)
4. ✓ Configure la base de données (migrations)
5. ✓ Lance `npm run dev`

### Phase 1 : Initialisation (macOS/Linux)

```bash
cd suivi-sportif
bash setup.sh
npm install
npm run migrate -w server
npm run dev
```

---

## 📋 Structure Attendue Après Setup

```
suivi-sportif/
│
├── server/                          # ✓ Créé automatiquement
│   ├── src/
│   │   ├── index.js                 # ✓ Serveur Fastify
│   │   ├── routes/                  # ✓ Répertoire créé
│   │   ├── controllers/             # ✓ Répertoire créé
│   │   ├── models/                  # ✓ Répertoire créé
│   │   └── middleware/              # ✓ Répertoire créé
│   ├── package.json                 # ✓ Créé automatiquement
│   ├── .eslintrc.json               # ✓ Créé manuellement
│   └── node_modules/                # ✓ Créé par npm install
│
├── client/                          # ✓ Créé automatiquement
│   ├── src/
│   │   ├── main.jsx                 # ✓ Point d'entrée React
│   │   ├── App.jsx                  # ✓ Composant principal
│   │   ├── App.css                  # ✓ Styles
│   │   ├── index.css                # ✓ Styles globaux
│   │   ├── components/              # ✓ Répertoire créé
│   │   ├── pages/                   # ✓ Répertoire créé
│   │   └── hooks/                   # ✓ Répertoire créé
│   ├── index.html                   # ✓ HTML template
│   ├── vite.config.js               # ✓ Config Vite
│   ├── package.json                 # ✓ Créé automatiquement
│   ├── .eslintrc.json               # ✓ Config ESLint
│   └── node_modules/                # ✓ Créé par npm install
│
├── migrations/                      # ✓ Créé automatiquement
│   ├── 001_initial_schema.sql       # ✓ Schéma BD
│   └── migrate.js                   # ✓ Runner migrations
│
├── package.json                     # ✓ Config racine
├── .gitignore                       # ✓ Git ignore
├── setup-dirs.js                    # ✓ Setup script
├── setup.sh                         # ✓ Setup script Bash
├── setup.bat                        # ✓ Setup script Windows
├── README.md                        # ✓ Documentation
├── SETUP.md                         # ✓ Instructions
├── ARCHITECTURE.md                  # ✓ Architecture
└── QUICK_START.md                   # ← Vous êtes ici

```

---

## 🎯 Commandes Essentielles

### Démarrage
```bash
# Démarrer tout (Windows)
setup.bat

# Ou manuellement
node setup-dirs.js
npm install
npm run dev
```

### Développement
```bash
# Terminal 1: Serveur
npm run dev -w server

# Terminal 2: Client
npm run dev -w client

# Ou les deux à la fois
npm run dev
```

### Vérifier que tout fonctionne
```bash
# Terminal 3: Tester l'API
curl http://localhost:3001/health
curl http://localhost:3001/api/activities
```

### Building & Deployment
```bash
# Build complet
npm run build

# Linting
npm run lint

# Tests
npm run test

# Production
npm run start
```

---

## 🔧 Configuration des Ports

### Port 3001 (Serveur Fastify)
**Fichier:** `server/src/index.js`
```javascript
await fastify.listen({ port: 3001, host: '0.0.0.0' });
```

### Port 5173 (Client Vite)
**Fichier:** `client/vite.config.js`
```javascript
server: {
  port: 5173,
  // ...
}
```

**Si vous avez un conflit de ports:**
- Serveur: changez le port dans `server/src/index.js`
- Client: Vite trouvera automatiquement le prochain port disponible

---

## 📦 Dépendances Principales

### Server (`server/package.json`)
- `fastify` ^4.25.2 - Framework serveur
- `fastify-cors` ^8.5.0 - CORS support
- `fastify-helmet` ^11.1.1 - Security headers
- `better-sqlite3` ^9.2.2 - SQLite driver

### Client (`client/package.json`)
- `react` ^18.2.0 - UI Library
- `react-dom` ^18.2.0 - React DOM
- `axios` ^1.6.5 - HTTP client
- `vite` ^5.0.8 - Build tool
- `@vitejs/plugin-react` ^4.2.1 - React support

---

## 🗄️ Base de Données

### Initialisation
```bash
npm run migrate -w server
```

Crée le fichier `suivi-sportif.db` avec les tables :

### Tables Créées
```sql
-- Utilisateurs
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activités
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_minutes INTEGER,
  distance_km DECIMAL(10, 2),
  calories INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Métriques d'activités
CREATE TABLE activity_metrics (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10, 2) NOT NULL,
  unit TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);
```

### Ajouter une nouvelle migration
1. Créez un fichier `migrations/002_your_migration.sql`
2. Exécutez `npm run migrate -w server`

---

## 🚨 Troubleshooting

### ❌ "node: command not found"
**Solution:** Installez Node.js depuis https://nodejs.org/

### ❌ "Cannot find module 'fastify'"
**Solution:** Exécutez `npm install`

### ❌ "Port 3001 already in use"
**Solution:** 
- Trouvez le processus : `lsof -i :3001` (macOS/Linux)
- Tuez le : `kill -9 <PID>`
- Ou changez le port dans `server/src/index.js`

### ❌ "Port 5173 already in use"
**Solution:** Vite trouvera un port alternative, mais vous pouvez aussi :
- Changer le port dans `client/vite.config.js`

### ❌ "Database connection error"
**Solution:** 
- Vérifiez les permissions d'écriture
- Vérifiez que le répertoire racine existe
- Supprimez `suivi-sportif.db` et relancez les migrations

### ❌ "CORS error"
**Solution:** Le proxy Vite doit transférer les requêtes :
- Vérifiez `client/vite.config.js`
- Assurez-vous que `fastify-cors` est installé et enregistré

---

## 🎓 Apprendre la Structure

### Server (Fastify)
```
server/src/
├── index.js              # Point d'entrée, configure Fastify
├── routes/               # Définition des routes (GET, POST, etc.)
├── controllers/          # Logique métier pour chaque route
├── models/               # Requêtes base de données
└── middleware/           # Middleware (auth, validation, etc.)
```

### Client (React + Vite)
```
client/src/
├── main.jsx              # React DOM render
├── App.jsx               # Composant racine
├── components/           # Composants réutilisables
├── pages/                # Composants pour les pages
└── hooks/                # Logique métier réutilisable
```

---

## 📚 Ressources

- **Fastify**: https://www.fastify.io/docs/latest/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/guide/
- **SQLite**: https://www.sqlite.org/
- **npm Workspaces**: https://docs.npmjs.com/cli/v9/using-npm/workspaces

---

## ✅ Checklist de Setup

- [ ] Node.js 18+ installé
- [ ] `node setup-dirs.js` exécuté
- [ ] `npm install` terminé
- [ ] `npm run migrate -w server` terminé
- [ ] `npm run dev` lance sans erreur
- [ ] Client accessible à http://localhost:5173
- [ ] API répond à http://localhost:3001/health

Une fois tout cela fait, vous êtes prêt à développer ! 🚀