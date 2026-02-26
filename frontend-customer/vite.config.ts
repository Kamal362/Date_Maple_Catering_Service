import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const apiTarget = env.VITE_API_URL || 'http://localhost:5001'

  return {
    plugins: [react()],

    // Customer app lives at the root '/' so no base needed.
    // Explicitly set to '/' to be clear and avoid any inherited config issues.
    base: '/',

    server: {
      port: 5174, // Different port from admin app
      host: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        // Proxy socket.io connections in dev
        '/socket.io': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          ws: true, // Enable WebSocket proxying
        },
      },
    },

    preview: {
      port: 5174,
      host: true,
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
  }
})