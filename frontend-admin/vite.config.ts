import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const apiTarget = env.VITE_API_URL || 'http://localhost:5001'

  return {
    plugins: [react()],

    // CRITICAL: tells Vite all asset paths should be prefixed with /admin/
    // This ensures index.html references /admin/assets/... not /assets/...
    // which would collide with the customer app on the same server.
    base: mode === 'production' ? '/admin/' : '/',

    server: {
      port: 5173,
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
      },
    },

    preview: {
      port: 5173,
      host: true,
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      // Increase chunk warning limit (admin dashboards tend to be large)
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Split vendor chunks for better caching
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
  }
})