#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dirs = [
  // Server
  'server/src/routes',
  'server/src/controllers',
  'server/src/models',
  'server/src/middleware',
  'server/src/plugins',
  'server/src/utils',
  'server/src/db/queries',
  // Client
  'client/src/components',
  'client/src/modules/dashboard',
  'client/src/modules/body',
  'client/src/modules/sleep',
  'client/src/modules/meals',
  'client/src/modules/sessions',
  'client/src/modules/assistant',
  'client/src/store',
  'client/src/hooks',
  'client/src/api',
  'client/src/utils',
  // Shared
  'shared/types',
  'shared/utils',
  // Migrations & Config
  'migrations',
];

const files = {
  // Server package.json
  'server/package.json': {
    "name": "suivi-sportif-server",
    "version": "2.0.0",
    "description": "Backend Fastify pour Suivi Sportif v2",
    "type": "module",
    "main": "src/server.ts",
    "scripts": {
      "dev": "tsx watch src/server.ts",
      "build": "tsc",
      "start": "node dist/server.js",
      "test": "vitest",
      "test:watch": "vitest --watch",
      "lint": "eslint src --ext .ts",
      "format": "prettier --write src",
      "typecheck": "tsc --noEmit"
    },
    "dependencies": {
      "fastify": "^4.25.2",
      "@fastify/cors": "^8.5.0",
      "@fastify/helmet": "^11.1.1",
      "@fastify/jwt": "^7.1.0",
      "@fastify/swagger": "^8.14.0",
      "@fastify/swagger-ui": "^1.10.1",
      "@fastify/rate-limit": "^9.1.0",
      "pg": "^8.11.3",
      "zod": "^3.22.4",
      "pino": "^8.17.2",
      "pino-http": "^8.7.0",
      "bcrypt": "^5.1.1",
      "node-pg-migrate": "^7.2.0",
      "dotenv": "^16.3.1"
    },
    "devDependencies": {
      "typescript": "^5.3.3",
      "tsx": "^4.7.0",
      "@types/node": "^20.10.6",
      "@types/bcrypt": "^5.0.2",
      "vitest": "^1.1.0",
      "eslint": "^8.56.0",
      "@typescript-eslint/eslint-plugin": "^6.17.0",
      "@typescript-eslint/parser": "^6.17.0",
      "prettier": "^3.1.1"
    }
  },
  // Client package.json
  'client/package.json': {
    "name": "suivi-sportif-client",
    "version": "2.0.0",
    "description": "Frontend React pour Suivi Sportif v2",
    "type": "module",
    "main": "src/main.tsx",
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "preview": "vite preview",
      "test": "vitest",
      "test:watch": "vitest --watch",
      "test:e2e": "playwright test",
      "lint": "eslint src --ext .ts,.tsx",
      "format": "prettier --write src",
      "typecheck": "tsc --noEmit"
    },
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "zustand": "^4.4.1",
      "axios": "^1.6.5",
      "recharts": "^2.10.3",
      "zod": "^3.22.4"
    },
    "devDependencies": {
      "typescript": "^5.3.3",
      "@types/react": "^18.2.45",
      "@types/react-dom": "^18.2.18",
      "@vitejs/plugin-react": "^4.2.1",
      "vite": "^5.0.8",
      "vitest": "^1.1.0",
      "@testing-library/react": "^14.1.2",
      "@testing-library/jest-dom": "^6.1.5",
      "@playwright/test": "^1.40.1",
      "eslint": "^8.56.0",
      "@typescript-eslint/eslint-plugin": "^6.17.0",
      "@typescript-eslint/parser": "^6.17.0",
      "prettier": "^3.1.1",
      "tailwindcss": "^3.4.1",
      "postcss": "^8.4.32",
      "autoprefixer": "^10.4.16"
    }
  },
  // Shared package.json
  'shared/package.json': {
    "name": "suivi-sportif-shared",
    "version": "2.0.0",
    "description": "Shared types for Suivi Sportif",
    "type": "module",
    "main": "types/index.ts",
    "devDependencies": {
      "typescript": "^5.3.3"
    }
  }
};

console.log('🚀 Phase 0.1 - Création de la structure du projet...\n');

// Créer tous les répertoires
dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✓ ${dir}`);
  }
});

console.log('\n📦 Création des fichiers package.json...\n');

// Créer les fichiers package.json
Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, JSON.stringify(content, null, 2) + '\n');
  console.log(`✓ ${filePath}`);
});

console.log('\n✨ Structure Phase 0.1 créée avec succès !');
console.log('\nProchaines étapes:');
console.log('  → npm install');
console.log('  → Phase 0.2 : Docker Compose');
console.log('  → Phase 0.3 : Configuration & Secrets');
