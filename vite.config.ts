import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.120.107:8282', //Dirección IP de esta laptop
        changeOrigin: true,
      },
    },
  },
})
