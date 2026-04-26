# 🚀 Phase 0 - Setup & Configuration

## ✅ Étape 1 : Créer la structure des répertoires

Exécutez le script setup qui va créer tous les répertoires et les package.json TypeScript :

```bash
node setup-dirs.js
```

**Résultat attendu :**
```
🚀 Phase 0.1 - Création de la structure du projet...

✓ server/src/routes
✓ server/src/controllers
✓ server/src/models
✓ server/src/middleware
✓ server/src/plugins
✓ server/src/utils
✓ server/src/db/queries
✓ client/src/components
✓ client/src/modules/dashboard
... (+ tous les autres)
✓ shared/types

📦 Création des fichiers package.json...

✓ server/package.json
✓ client/package.json
✓ shared/package.json
```

---

## ✅ Étape 2 : Configurer le fichier .env local

Créez un fichier `.env` à la racine du projet (copie de `.env.example`) :

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Modifiez les valeurs si nécessaire :
```bash
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
```

---

## ✅ Étape 3 : Configurer la connexion PostgreSQL

Le projet utilise une base de données PostgreSQL distante. Configurez `.env` :

```bash
# Vérifier que .env est configuré
cat .env
```

Les variables importantes :
```env
DB_HOST=192.168.1.6       # Adresse du serveur PostgreSQL
DB_PORT=5432              # Port PostgreSQL
DB_USER=suivi             # Utilisateur
DB_PASSWORD=xxx           # Mot de passe
DB_NAME=suivi_sportif     # Nom de la base
DATABASE_URL=postgresql://suivi:xxx@192.168.1.6:5432/suivi_sportif
```

**Créer la base de données si elle n'existe pas :**
```sql
CREATE DATABASE suivi_sportif;
```

---

## ✅ Étape 4 : Installer les dépendances

```bash
npm install
```

Cela installe les dépendances pour les 3 workspaces :
- `server/`
- `client/`
- `shared/`

---

## ✅ Étape 5 : Vérifier la configuration TypeScript

```bash
# Vérifier que TypeScript compile sans erreurs
npm run typecheck

# Ou pour un workspace spécifique
npm run typecheck -w server
npm run typecheck -w client
```

**Résultat attendu :** Aucune erreur TypeScript

---

## ✅ Étape 6 : Démarrer le serveur Fastify

Dans un terminal :

```bash
npm run dev -w server
```

**Résultat attendu :**
```
✅ Server listening at http://0.0.0.0:3001
📚 Docs available at http://0.0.0.0:3001/docs
```

Testez la santé :
```bash
curl http://localhost:3001/health
```

Réponse :
```json
{
  "status": "ok",
  "timestamp": "2026-04-24T12:58:35.394Z",
  "version": "2.0.0"
}
```

---

## ✅ Étape 7 : Démarrer le client React

Dans un autre terminal :

```bash
npm run dev -w client
```

**Résultat attendu :**
```
  VITE v5.0.8  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Accédez à http://localhost:5173

Vous devriez voir :
- ✅ Titre "Suivi Sportif v2"
- ✅ API Status : "ok" (en vert)

---

## ✅ Phase 0 Complète !

Bravo ! 🎉

Vous avez maintenant :
- ✅ TypeScript partout (server + client + shared)
- ✅ Structure monorepo complète
- ✅ PostgreSQL 16 + Redis en local
- ✅ Configuration validée avec Zod
- ✅ Logging structuré avec Pino
- ✅ Fastify qui démarre
- ✅ React/Vite qui démarre

---

## 🔍 Fichiers clés créés

| Fichier | Rôle |
|---------|------|
| `.env` | Variables d'environnement (DB distante) |
| `server/src/config.ts` | Validation Zod des env |
| `server/src/utils/logger.ts` | Logging pino |
| `server/src/server.ts` | Bootstrap Fastify |
| `client/src/main.tsx` | Entry point React |
| `shared/types/` | Types partagés |
| `tsconfig.json` | Config TypeScript |

---

## ⚠️ Troubleshooting

**Connexion DB échoue ?**
Vérifiez `.env` :
```bash
cat .env
```

**Port 3001 déjà utilisé ?**
```bash
# Trouver le processus
netstat -ano | findstr :3001  # Windows
lsof -i :3001  # macOS/Linux

# Ou changer le port dans .env
API_PORT=3002
```

**TypeScript erreurs ?**
```bash
npm run typecheck
npm install
npm run build
```
```

---

## 🎯 Prochaines Étapes

✅ Phase 0 : DONE  
⏭️ Phase 1 : Migrations SQL + Schéma BD  
⏭️ Phase 2 : Routes API  
⏭️ Phase 3 : Frontend  

Consultez `plan.md` pour le détail.

---

**Status:** Phase 0 prête à exécuter ✨
