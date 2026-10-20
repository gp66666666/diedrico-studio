import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
