import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Versión del build, visible en el pie de la app: sirve para comprobar de un
  // vistazo si el navegador está sirviendo una versión cacheada.
  define: {
    __BUILD_ID__: JSON.stringify(
      new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '')
    ),
  },
  plugins: [
    react(),
    // PWA: instalable y con el núcleo cacheado para clase (wifi malo).
    VitePWA({
      registerType: 'autoUpdate',
      // La registración la hace <PwaUpdatePrompt /> (virtual:pwa-register/react)
      // para poder avisar de la versión nueva en vez de dejar el shell viejo.
      injectRegister: null,
      includeAssets: ['logo-128.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Diédrico Studio',
        short_name: 'Diédrico',
        description: 'Sistema diédrico interactivo: 3D, proyecciones y ejercicios resueltos.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#070d18',
        theme_color: '#070d18',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Se cachea el núcleo de la app; las capturas de la guía se dejan fuera
        // para no engordar la instalación.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // El HTML por ruta que genera scripts/seo.mjs NO se precachea: se sirve
        // desde la red y, sin conexión, el service worker ya responde con el
        // index de la app (la ruta la resuelve React).
        globIgnores: ['guia/**', 'og-image.jpg', 'Laminas_automaticas.html', '*/index.html', 'ejercicios/**'],
        navigateFallback: '/index.html',
        // OJO: sin esta lista, el service worker responde CUALQUIER navegación
        // (incluido el iframe de las láminas) con el index de la app, y la
        // pestaña Láminas mostraba el 404 de React. Los .html se piden a la red.
        navigateFallbackDenylist: [/\.html$/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Láminas: se usan sin conexión una vez abiertas (va antes que la
            // regla de navegaciones, que si no la capturaría).
            urlPattern: /\/Laminas_automaticas\.html$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'laminas' },
          },
          {
            // Navegaciones: primero la red y, si falla o tarda, lo cacheado.
            // Así un despliegue nuevo se ve al recargar sin esperar a que el
            // service worker viejo se jubile (era el "no me salen los cambios").
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    // three.js y la app van aparte para que el navegador los cachee por separado
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    // Los console.log de depuración no llegan a producción (los error sí)
    minify: 'esbuild',
  },
  esbuild: {
    pure: ['console.log', 'console.debug'],
  },
})
