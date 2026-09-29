import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'index.html'), // marketing page at /
        app: resolve(__dirname, 'app/index.html'), // the planner at /app/
      },
    },
  },
  server: {
    // `npm run dev:api` serves the API on 8787
    proxy: { '/api': 'http://localhost:8787' },
  },
})
