import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
      proxy: {
        '/api/beckn': {
          target: 'https://34.93.141.21.sslip.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/beckn/, '/beckn'),
          secure: false, // Allow self-signed certificates
        },
              '/api/credentials': {
                target: 'http://34.100.210.253:6000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/credentials/, '/api/credentials'),
                secure: false,
              },
              '/api/tunnel': {
                target: 'http://34.100.215.201:8084',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/tunnel/, '/tunnel'),
                secure: false,
              }
            }
  }
})
