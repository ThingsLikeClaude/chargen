import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3333',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
