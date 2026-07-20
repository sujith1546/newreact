import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  server: {
    proxy: {
      // Proxy /api/* calls to our local serverless function handler during dev
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});
