import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement selon le mode (development/production)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // Configuration serveur pour le dev local
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    },

    // Configuration pour la preview
    preview: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
    },

    // Configuration build pour la production
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['react-router-dom'],
          }
        }
      }
    },

    // Définition des variables d'environnement pour Vite
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:5000')
    }
  }
})
