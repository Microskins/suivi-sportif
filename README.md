# 🚀 Suivi Sportif - Application de Suivi de Santé et Fitness

> Application web complète pour suivre vos activités sportives, votre santé et vos performances. Multi-profils, graphiques en temps réel, assistant IA intégré.

## 📊 Stack Technologique

### Frontend
- **React 18.2** - UI Framework
- **Vite 5.0** - Build tool ultra-rapide
- **TypeScript 5.3** - Type safety
- **Zustand 4.4** - State management
- **Tailwind CSS 3.4** - Styling
- **Axios 1.6** - HTTP client
- **Recharts 2.10** - Data visualization

### Backend
- **Fastify 4.28** - Web server ultra-performant
- **TypeScript 5.3** - Type safety
- **PostgreSQL 16** - Base de données relationnelle
- **Redis 7** - Cache et sessions
- **Pino 8.20** - Structured logging
- **Zod 3.23** - Schema validation

### DevOps
- **Docker & Docker Compose** - Containerization
- **Node.js LTS** - Runtime
- **npm workspaces** - Monorepo management

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js 18+** ([Télécharger](https://nodejs.org/))
- **Docker & Docker Compose** ([Télécharger](https://www.docker.com/products/docker-desktop))
- **Git** ([Télécharger](https://git-scm.com/))

### Installation

**1. Cloner le projet**
```bash
git clone git@github.com:Microskins/suivi-sportif.git
cd suivi-sportif
```

**2. Configurer l'environnement**
```bash
cp config/.env.example .env
# Optionnel : modifiez .env si besoin
```

**3. Démarrer les services Docker**
```bash
docker-compose -f config/docker-compose.yml up -d
```

Cela démarre :
- 🐘 **PostgreSQL 16** sur `localhost:5432`
- 🔴 **Redis 7** sur `localhost:6379`
- 🖥️ **pgAdmin** sur `http://localhost:5050`

**4. Installer les dépendances npm**
```bash
npm install
```

**5. Lancer le développement**

Terminal 1 - Backend :
```bash
npm run dev -w server
# http://localhost:3001
```

Terminal 2 - Frontend :
```bash
npm run dev -w client
# http://localhost:5173
```

## 📁 Structure du Projet

```
suivi-sportif/
├── 📖 docs/                    # Documentation
├── ⚙️  setup/                   # Scripts d'initialisation
├── 🔧 config/                   # Configuration
├── 📦 server/                   # Backend Fastify
├── 💻 client/                   # Frontend React
├── 🤝 shared/                   # Code partagé
├── 🗃️  migrations/               # SQL migrations
└── 📋 package.json              # Workspace root
```

## 🔌 Services Docker

| Service | Port | Accès |
|---------|------|-------|
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| pgAdmin | 5050 | http://localhost:5050 |

## 🔨 Commandes

```bash
# Développement
npm run dev -w server          # Backend
npm run dev -w client          # Frontend

# Build
npm run build                   # Construire tous les projets
npm run build -w server        # Construire server seulement
npm run build -w client        # Construire client seulement

# Tests & Qualité
npm run typecheck              # TypeScript check
npm run lint                   # Linter
npm run format                 # Prettier

# Production
npm run start -w server        # Lancer server en production
```

## 🌍 Accès aux Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |
| API Health | http://localhost:3001/health |
| pgAdmin | http://localhost:5050 |

## 🔐 Variables d'Environnement

Créez `.env` à la racine (voir `config/.env.example`) :

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=dev-password
DB_NAME=suivi_sportif_v2
REDIS_HOST=localhost
REDIS_PORT=6379
SERVER_PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin
PGADMIN_PORT=5050
```

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Setup Phase 0](./docs/PHASE_0_SETUP.md)
- [Project Structure](./docs/PROJECT_STRUCTURE.md)
- [Quick Start](./docs/QUICK_START.md)

## 📝 Phases du Projet

- ✅ **Phase 0** : Setup & Configuration
- ⏳ **Phase 1** : Core API
- ⏳ **Phase 2** : Frontend
- ⏳ **Phase 3** : Features Avancées
- ⏳ **Phase 4** : Tests & Optimisation
- ⏳ **Phase 5** : Deployment

## 📄 Licence

MIT - voir [LICENSE](LICENSE)
