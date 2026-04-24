# 📋 Configuration - Suivi Sportif

## 🚀 Première Étape : Créer la Structure des Répertoires

Avant de commencer, vous devez créer la structure complète des répertoires du projet.

### Option 1 : Utiliser le script Bash (Linux/macOS/WSL)
```bash
bash setup.sh
```

### Option 2 : Utiliser le script Node.js (Tous les systèmes)
```bash
node setup-dirs.js
```

### Option 3 : Créer manuellement sur Windows (PowerShell)
```powershell
# Exécutez dans le répertoire racine du projet
$dirs = @(
    'server\src\routes',
    'server\src\controllers',
    'server\src\models',
    'server\src\middleware',
    'client\src\components',
    'client\src\pages',
    'client\src\hooks',
    'migrations'
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path $dir -Force > $null
    Write-Host "✓ Créé: $dir"
}
```

### Option 4 : Créer manuellement sur macOS/Linux
```bash
mkdir -p server/src/{routes,controllers,models,middleware}
mkdir -p client/src/{components,pages,hooks}
mkdir -p migrations
```

---

## 📦 Installer les Dépendances

Une fois la structure créée :

```bash
npm install
```

Cela installera les dépendances pour :
- **Workspace racine** (configuration monorepo)
- **Server** (Fastify et dépendances)
- **Client** (React et dépendances)

---

## 🗄️ Configurer la Base de Données

```bash
npm run migrate -w server
```

Cela crée les tables SQLite à partir des migrations.

---

## 🛠️ Commandes Disponibles

Après la configuration :

```bash
# Démarrage complet
npm run dev        # Démarre le serveur + client

# Ou individuellement
npm run dev -w server    # Serveur uniquement
npm run dev -w client    # Client uniquement

# Build
npm run build

# Tests
npm run test

# Linting
npm run lint

# Production
npm run start

# Vérifier l'API
curl http://localhost:3001/health
```

---

## 🌐 Accès au Projet

- **Frontend** : http://localhost:5173
- **API** : http://localhost:3001
- **Santé API** : http://localhost:3001/health

---

## 📋 Structure Complète

```
suivi-sportif/
├── server/
│   ├── src/
│   │   ├── index.js           # Point d'entrée
│   │   ├── routes/            # Définition des routes
│   │   ├── controllers/       # Logique métier
│   │   ├── models/            # Modèles de données
│   │   └── middleware/        # Middleware Fastify
│   ├── package.json
│   └── .eslintrc.json
│
├── client/
│   ├── src/
│   │   ├── main.jsx           # Point d'entrée React
│   │   ├── App.jsx            # Composant principal
│   │   ├── components/        # Composants réutilisables
│   │   ├── pages/             # Pages principales
│   │   ├── hooks/             # Hooks personnalisés
│   │   ├── App.css
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .eslintrc.json
│
├── migrations/
│   ├── 001_initial_schema.sql
│   └── migrate.js
│
├── package.json               # Configuration workspace
├── .gitignore
├── setup.sh                   # Script Bash
├── setup-dirs.js              # Script Node.js
├── setup.py                   # Script Python
└── README.md
```

---

## ⚠️ Troubleshooting

**Q: Les répertoires ne sont pas créés**  
A: Exécutez l'une des commandes de setup ci-dessus.

**Q: npm install échoue**  
A: Assurez-vous que Node.js 18+ est installé : `node --version`

**Q: Le serveur ne démarre pas**  
A: Vérifiez que le port 3001 est disponible.

**Q: React ne se charge pas**  
A: Vérifiez que le port 5173 est disponible et que le proxy API est configuré.

---

## 📝 Prochaines Étapes

1. ✅ Créer la structure des répertoires
2. ✅ Installer npm install
3. ✅ Configurer la base de données
4. ⏭️ Implémenter l'authentification
5. ⏭️ Créer les endpoints API
6. ⏭️ Développer l'interface utilisateur
