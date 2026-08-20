import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/** Security headers injected on every dev server response */
function securityHeadersPlugin() {
  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        // Explicitly remove X-Frame-Options in dev mode to allow iframe/IDE previews
        res.removeHeader('X-Frame-Options');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self)');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
      });
    },
  };
}

function localApiDevPlugin() {
  return {
    name: 'local-api-dev-handler',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) return next();

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-portfolio-session');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          return res.end();
        }

        if (url.startsWith('/api/geo')) {
          res.setHeader('Content-Type', 'application/json');
          try {
            const geoModule = await import('./api/geo.js');
            return await geoModule.default(req, res);
          } catch {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              country: 'India',
              region: 'Asia-South',
              lat: 20.5937,
              lng: 78.9629,
              referrerBucket: 'direct',
              deviceType: 'desktop',
              isBot: false
            }));
          }
        }

        if (url.startsWith('/api/chat')) {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const rawBody = Buffer.concat(buffers).toString('utf-8');
          try {
            req.body = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            req.body = {};
          }

          try {
            const chatModule = await import('./api/chat.js');
            return await chatModule.default(req, res);
          } catch (err) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            const fallbackText = "👋 Hi! I'm **Sujith's AI Assistant**. I see you are testing locally! Ask me about my **Skills**, **Projects**, or **Education**.";
            res.write(`data: ${JSON.stringify({ type: 'token', token: fallbackText })}\n\n`);
            res.write(`data: [DONE]\n\n`);
            return res.end();
          }
        }

        if (url.startsWith('/api/contact')) {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const rawBody = Buffer.concat(buffers).toString('utf-8');
          try {
            req.body = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            req.body = {};
          }

          res.setHeader('Content-Type', 'application/json');
          try {
            const contactModule = await import('./api/contact.js');
            return await contactModule.default(req, res);
          } catch {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, message: 'Local dev test submission succeeded' }));
          }
        }

        if (url.startsWith('/api/send-otp')) {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const rawBody = Buffer.concat(buffers).toString('utf-8');
          try {
            req.body = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            req.body = {};
          }

          res.setHeader('Content-Type', 'application/json');
          try {
            const sendOtpModule = await import('./api/send-otp.js');
            return await sendOtpModule.default(req, res);
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: 'Local OTP dispatch failed: ' + err.message }));
          }
        }

        if (url.startsWith('/api/verify-otp')) {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const rawBody = Buffer.concat(buffers).toString('utf-8');
          try {
            req.body = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            req.body = {};
          }

          res.setHeader('Content-Type', 'application/json');
          try {
            const verifyOtpModule = await import('./api/verify-otp.js');
            return await verifyOtpModule.default(req, res);
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: 'Local OTP verification failed: ' + err.message }));
          }
        }

        if (url.startsWith('/api/login-alert')) {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const rawBody = Buffer.concat(buffers).toString('utf-8');
          try {
            req.body = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            req.body = {};
          }

          res.setHeader('Content-Type', 'application/json');
          try {
            const alertModule = await import('./api/login-alert.js');
            return await alertModule.default(req, res);
          } catch (err) {
            res.statusCode = 200;
            return res.end(JSON.stringify({ ok: true, devFallback: true }));
          }
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    securityHeadersPlugin(),
    localApiDevPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: false
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*(supabase|api).*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Sujith Thota Portfolio',
        short_name: 'Sujith',
        description: 'Portfolio of Sujith Thota - Full Stack Dev & Data Science',
        theme_color: '#0b0d10',
        background_color: '#0b0d10',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],

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
