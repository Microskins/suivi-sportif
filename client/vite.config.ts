import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  plugins: [react()],
  publicDir: process.env.VITE_DISABLE_PUBLIC_COPY === 'true' ? false : 'public',
  server: {
    port: 5173,
    host: true,
  },
}));
