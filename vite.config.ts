import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: mode === 'production' ? '/ondc-reference-app/' : '/',
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api/beckn': {
          target: env.VITE_API_BECKN_TARGET || 'https://34.93.141.21.sslip.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/beckn/, '/beckn'),
          secure: false, // Allow self-signed certificates
        },
        '/api/credentials': {
          target: env.VITE_API_CREDENTIALS_TARGET || 'http://34.100.210.253:6000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/credentials/, '/api/credentials'),
          secure: false,
        },
        '/api/tunnel': {
          target: env.VITE_API_TUNNEL_TARGET || 'http://34.93.71.145:8084',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tunnel/, '/tunnel'),
          secure: false,
        }
      }
    }
  }
})
