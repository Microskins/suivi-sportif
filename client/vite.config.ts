import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  plugins: [react()],
  publicDir: process.env.VITE_DISABLE_PUBLIC_COPY === 'true' ? false : 'public',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rolldownOptions: {
      output: {
        // Le worker de MapLibre est un module `.mjs`. Le Nginx du conteneur
        // client ne connait pas cette extension (absente de mime.types) et le
        // sert en application/octet-stream: le navigateur refuse alors le
        // worker et aucune carte ne s'affiche. En `.js`, il est servi en
        // JavaScript par n'importe quel serveur.
        assetFileNames: (asset) =>
          asset.names.some((name) => name.endsWith('.mjs'))
            ? 'assets/[name]-[hash].js'
            : 'assets/[name]-[hash][extname]',
      },
    },
  },
  test: {
    // `client/e2e` contient la suite Playwright, pas des tests Vitest. Sans
    // cette exclusion, Vitest la collecte et echoue sur
    // "Playwright Test did not expect test.describe() to be called here".
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
}));
