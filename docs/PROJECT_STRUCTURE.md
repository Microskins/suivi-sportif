# Suivi Sportif - Project Structure

```
suivi-sportif/
├── server/                      # Fastify backend
│   ├── src/
│   │   ├── index.js            # Main server entry point
│   │   ├── routes/             # API routes (to be created)
│   │   ├── controllers/        # Route handlers (to be created)
│   │   ├── models/             # Data models (to be created)
│   │   └── middleware/         # Custom middleware (to be created)
│   ├── package.json
│   ├── .eslintrc.json
│   └── node_modules/
│
├── client/                      # React frontend
│   ├── src/
│   │   ├── main.jsx            # React entry point
│   │   ├── App.jsx             # Main app component
│   │   ├── App.css             # App styles
│   │   ├── index.css           # Global styles
│   │   ├── components/         # Reusable components (to be created)
│   │   ├── pages/              # Page components (to be created)
│   │   └── hooks/              # Custom hooks (to be created)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .eslintrc.json
│   └── node_modules/
│
├── migrations/                  # Database migrations
│   ├── 001_initial_schema.sql  # Initial schema
│   ├── migrate.js              # Migration runner
│   └── (add new migrations as needed)
│
├── package.json                 # Monorepo workspace config
├── .gitignore
└── README.md
```

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development
```bash
# Run both server and client
npm run dev

# Or run individually
cd server && npm run dev
cd client && npm run dev
```

### Build
```bash
npm run build
```

### Run Migrations
```bash
npm run migrate -w server
```

## Tech Stack

- **Backend**: Fastify, Node.js
- **Frontend**: React, Vite
- **Package Manager**: npm workspaces
- **Code Quality**: ESLint
- **Database**: SQLite (migrations included)

## Next Steps

1. Install dependencies: `npm install`
2. Set up database: `npm run migrate -w server`
3. Start development: `npm run dev`
4. Access client at http://localhost:5173
5. API running at http://localhost:3001
