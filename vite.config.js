import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Sujith Thota Portfolio',
        short_name: 'Sujith',
        description: 'Portfolio of Sujith Thota - Full Stack Dev & Data Science',
        theme_color: '#0b0d10',
        background_color: '#0b0d10',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/profile_photo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/profile_photo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      // Proxy /api/* calls to our local serverless function handler during dev
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('lucide-react') || id.includes('react-icons') || id.includes('@tabler/icons')) return 'icons';
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router')) return 'vendor';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('react-pdf')) return 'pdf';
            if (id.includes('cobe')) return 'globe';
          }
        }
      }
    }
  }
});
