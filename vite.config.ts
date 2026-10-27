import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: process.env.BASE_PATH || '/phumulani/',
    plugins: [react(), tailwindcss()],
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      exclude: ['pg'],
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio container environments via DISABLE_HMR env var.
      // Defaults safely to true (disabled) to eliminate WebSocket errors and prevent reload cascades during agent edits.
      hmr: process.env.DISABLE_HMR === 'false' || process.env.DISABLE_HMR === '0' ? true : false,
      // Disable file watching when DISABLE_HMR is active (or by default in container) to conserve CPU
      watch: process.env.DISABLE_HMR === 'false' || process.env.DISABLE_HMR === '0' ? {} : null,
    },
  };
});
