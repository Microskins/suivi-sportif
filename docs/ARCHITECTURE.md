# Suivi Sportif - Structure du Projet

```
suivi-sportif/
├── server/                      # Backend Fastify
│   ├── src/
│   │   ├── index.js            # Point d'entrée principal du serveur
│   │   ├── routes/             # Routes API (à créer)
│   │   ├── controllers/        # Gestionnaires de routes (à créer)
│   │   ├── models/             # Modèles de données (à créer)
│   │   └── middleware/         # Middleware personnalisé (à créer)
│   ├── package.json
│   ├── .eslintrc.json
│   └── node_modules/
│
├── client/                      # Frontend React
│   ├── src/
│   │   ├── main.jsx            # Point d'entrée React
│   │   ├── App.jsx             # Composant principal
│   │   ├── App.css             # Styles de l'application
│   │   ├── index.css           # Styles globaux
│   │   ├── components/         # Composants réutilisables (à créer)
│   │   ├── pages/              # Composants de pages (à créer)
│   │   └── hooks/              # Hooks personnalisés (à créer)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .eslintrc.json
│   └── node_modules/
│
├── migrations/                  # Migrations de base de données
│   ├── 001_initial_schema.sql  # Schéma initial
│   ├── migrate.js              # Gestionnaire de migrations
│   └── (ajouter nouvelles migrations au besoin)
│
├── package.json                 # Configuration du workspace monorepo
├── .gitignore
└── README.md
```

## Démarrage Rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer la base de données
```bash
npm run migrate -w server
```

### 3. Développement
```bash
# Démarrer le serveur et le client simultanément
npm run dev

# Ou séparément
cd server && npm run dev
cd client && npm run dev
```

### 4. Accéder à l'application
- Client: http://localhost:5173
- API: http://localhost:3001
- Vérifier l'API: http://localhost:3001/health

## Stack Technologique

- **Backend**: Fastify, Node.js, SQLite
- **Frontend**: React 18, Vite
- **Gestion des paquets**: npm workspaces
- **Qualité du code**: ESLint
- **Base de données**: SQLite avec migrations

## Scripts Disponibles

```bash
# Workspace (racine)
npm install          # Installer toutes les dépendances
npm run dev         # Démarrer serveur + client
npm run build       # Compiler le projet complet
npm run test        # Exécuter tous les tests
npm run lint        # Linter le code

# Serveur spécifiquement
npm run dev -w server    # Mode développement
npm run start -w server  # Production
npm run migrate -w server # Exécuter les migrations

# Client spécifiquement
npm run dev -w client    # Mode développement
npm run build -w client  # Build pour la production
```

## Structure des Dossiers à Créer

Après l'installation, complétez la structure :

### Pour le serveur (`server/src/`)
- `routes/` - Définir les routes API
- `controllers/` - Logique métier pour les routes
- `models/` - Interaction avec la base de données
- `middleware/` - Authentification, validation, etc.

### Pour le client (`client/src/`)
- `components/` - Composants réutilisables
- `pages/` - Pages principales
- `hooks/` - Logique partagée

## Prochaines Étapes

1. ✅ Structure créée
2. ⏭ Installer les dépendances: `npm install`
3. ⏭ Configurer la DB: `npm run migrate -w server`
4. ⏭ Ajouter l'authentification
5. ⏭ Créer les routes API pour les activités
6. ⏭ Développer l'interface utilisateur
