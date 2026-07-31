import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,                    // bind 0.0.0.0 so the host can reach the dev server in Docker
    watch: { usePolling: true },   // macOS->Linux file events don't cross the bind mount; poll so HMR fires
    proxy: {
      // In Docker, localhost is THIS (client) container, so proxy /api to the server service.
      // Falls back to localhost for running Vite bare on the Mac.
      '/api': process.env.VITE_API_PROXY || 'http://localhost:3000',
    },
  },
})
