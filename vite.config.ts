import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// The admin panel is deployed on a SEPARATE origin from the API (see plan §10),
// so it talks to the backend cross-origin and relies on backend CORS (ticket B1).
// Set VITE_API_BASE to the backend origin (default: local dev backend on :8090).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // Split third-party deps into a separate cached vendor chunk; feature
        // routes are additionally code-split via React.lazy in AppRoutes.
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})
