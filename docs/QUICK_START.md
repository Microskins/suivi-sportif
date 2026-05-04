# Démarrage rapide

## 1. Installer

```bash
git clone git@github.com:Microskins/suivi-sportif.git
cd suivi-sportif
npm install
```

## 2. Configurer l'environnement

Créer `.env` à la racine:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/suivi_sportif_v2"
JWT_SECRET="change-me"
NODE_ENV="development"
```

## 3. Préparer Prisma

```bash
npm run db:generate -w server
npm run db:push -w server
```

`db:push` est utile en développement. Pour des changements de schéma versionnés, utiliser ensuite `npm run db:migrate -w server`.

## 4. Lancer en développement

Terminal 1:

```bash
npm run dev -w server
```

Terminal 2:

```bash
npm run dev -w client
```

URLs:

- API: http://localhost:3001
- Health: http://localhost:3001/health
- Client: http://localhost:5173

## 5. Vérifier

```bash
npm run typecheck -w server
npm run test -w server -- --run
npm run build -w server
```

```bash
npm run typecheck -w client
npm run build -w client
```

## 6. Tester l'API manuellement

Health:

```bash
curl http://localhost:3001/health
```

Créer un utilisateur:

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

Utiliser ensuite le token retourné:

```bash
curl http://localhost:3001/api/workouts \
  -H "Authorization: Bearer <TOKEN>"
```

## Notes

- Les routes `/api/exercises` et `/api/workouts` sont protégées par JWT.
- Les workouts utilisent l'id utilisateur du token, pas un header manuel.
- Le frontend est encore minimal; la priorité actuelle est l'API.
