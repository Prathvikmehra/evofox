import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    proxy: {
      // Forward all /api/* requests to the Express backend
      '/api': {
        target: 'https://evofox.onrender.com',
        changeOrigin: true,
      },
    },
  },
})

