import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://157.173.221.226:3006/api',
        changeOrigin: true,
      }
    }
  }
})
