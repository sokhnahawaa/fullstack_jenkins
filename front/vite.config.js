import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
    },

    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
    },
  }
})
