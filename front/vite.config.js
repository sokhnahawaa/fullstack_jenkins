import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  // Configuration pour le développement
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
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
          ui: ['react-router-dom']
        }
      }
    }
  },
  
  // Définition des variables d'environnement
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}))
