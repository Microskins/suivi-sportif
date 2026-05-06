# Demarrage rapide

## 1. Installer

```bash
git clone git@github.com:Microskins/suivi-sportif.git
cd suivi-sportif
npm install
```

## 2. Configurer l'environnement

Creer `.env` a la racine:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/suivi_sportif_v2"
JWT_SECRET="change-me"
NODE_ENV="development"
```

Option frontend sans API locale, dans `client/.env`:

```env
VITE_BYPASS_AUTH="true"
```

## 3. Preparer Prisma

```bash
npm run db:generate -w server
npm run db:push -w server
```

Optionnel: charger le catalogue de developpement.

```bash
npm run db:seed -w server
```

Pour des changements de schema versionnes, utiliser ensuite:

```bash
npm run db:migrate -w server
```

## 4. Lancer en developpement

Terminal 1:

```bash
npm run dev -w server
```

Terminal 2:

```bash
npm run dev -w client
```

Terminal 3, si besoin du MCP:

```bash
npm run mcp:dev
```

URLs:

- API: http://localhost:3001
- Health: http://localhost:3001/health
- Client: http://localhost:5173
- MCP: http://127.0.0.1:3033/mcp

## 5. Verifier

Serveur:

```bash
npm run typecheck -w server
npm run test -w server -- --run
npm run build -w server
```

Client:

```bash
npm run typecheck -w client
npm run build -w client
```

MCP:

```bash
npm run mcp:typecheck
npm run test -w mcp
```

## 6. Tester l'API manuellement

Health:

```bash
curl http://localhost:3001/health
```

Creer un utilisateur:

```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

Se connecter:

```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Utiliser le token retourne:

```bash
curl http://localhost:3001/api/workouts \
  -H "Authorization: Bearer <TOKEN>"
```

## Notes

- Les routes metier sont protegees par JWT.
- Les ressources utilisateur utilisent l'id issu du token.
- Les anciennes docs de setup ne sont plus la reference.
