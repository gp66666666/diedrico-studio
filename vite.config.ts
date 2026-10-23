import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // PWA: instalable y con el núcleo cacheado para clase (wifi malo).
    VitePWA({
      registerType: 'autoUpdate',
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
        globIgnores: ['guia/**', 'og-image.jpg', 'Laminas_automaticas.html'],
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
            // Láminas: se usan sin conexión una vez abiertas
            urlPattern: /\/Laminas_automaticas\.html$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'laminas' },
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
