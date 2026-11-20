import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Vite configuration.
 *
 * The `/api` proxy is the important part: the browser calls
 * `http://localhost:5173/api/v1/...` and Vite forwards it to FastAPI on :8000.
 * That means no CORS issues in development and the frontend never needs to
 * know the backend host. The same relative URLs work behind a reverse proxy in
 * production.
 */
const API_TARGET = process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true, // listen on 0.0.0.0 so containers / sandbox previews can reach it
    port: 5173,
    strictPort: true,
    // Vite rejects unknown Host headers by default (DNS-rebinding protection).
    // Add your own preview domain here if you use one.
    allowedHosts: ['localhost', '127.0.0.1', '.e2b.app'],
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ['localhost', '127.0.0.1', '.e2b.app'],
  },
})
