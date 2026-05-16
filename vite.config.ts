import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/mistral-proxy': {
        target: process.env.VITE_CUSTOM_ENDPOINT || 'https://api.example.com/v1/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mistral-proxy/, ''),
        secure: false,
      },
    },
  },
})
