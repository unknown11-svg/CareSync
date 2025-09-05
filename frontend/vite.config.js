import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://caresync-gdevh3eccggqhjch.southafricanorth-01.azurewebsites.net/',
        changeOrigin: true
      }
    }
  }
})
