import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  plugins: [react()],
  publicDir: process.env.VITE_DISABLE_PUBLIC_COPY === 'true' ? false : 'public',
  server: {
    port: 5173,
    host: true,
  },
  test: {
    // `client/e2e` contient la suite Playwright, pas des tests Vitest. Sans
    // cette exclusion, Vitest la collecte et echoue sur
    // "Playwright Test did not expect test.describe() to be called here".
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
}));
