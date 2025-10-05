import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // écoute sur 0.0.0.0
    port: 5173,      // correspond au port exposé
    strictPort: true // échoue si le port est déjà pris
  }
});
