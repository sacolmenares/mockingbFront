import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.lottie'],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8282', //Dirección IP del mock
        changeOrigin: true,
      },
    },
  },
})
