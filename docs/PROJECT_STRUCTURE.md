# Structure du projet

```text
suivi-sportif/
├── .agents/
│   └── skills/                 # Skills projet pour Codex
├── client/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── vite-env.d.ts
│       └── api/
│           └── client.ts
├── config/
├── docs/
│   ├── INDEX.md
│   ├── QUICK_START.md
│   ├── ARCHITECTURE.md
│   └── PROJECT_STRUCTURE.md
├── server/
│   ├── ecosystem.config.cjs
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── db/
│       │   ├── index.ts
│       │   └── queries/
│       │       ├── exercises.ts
│       │       ├── users.ts
│       │       └── workouts.ts
│       ├── plugins/
│       │   └── auth.ts
│       ├── routes/
│       │   ├── api.test.ts
│       │   ├── exercises.ts
│       │   ├── users.ts
│       │   └── workouts.ts
│       └── schemas/
│           └── index.ts
├── package.json
├── package-lock.json
└── README.md
```

## Fichiers importants

- `README.md`: vue d'ensemble et commandes principales.
- `docs/INDEX.md`: index de documentation et état des docs.
- `server/src/app.ts`: construction de l'app Fastify.
- `server/src/server.ts`: démarrage réseau.
- `server/prisma/schema.prisma`: schéma PostgreSQL/Prisma.
- `server/src/routes/api.test.ts`: premiers tests API.
- `client/src/api/client.ts`: client HTTP du frontend.

## Documents historiques

Certains fichiers dans `docs/` viennent d'une ancienne phase de setup. Ils ne doivent pas être utilisés comme référence tant qu'ils ne sont pas réécrits.

Voir `docs/INDEX.md` pour la liste.
