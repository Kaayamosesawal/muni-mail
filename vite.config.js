import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Fixes the Cross-Origin-Opener-Policy errors in the console
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // This ensures your .env variables are exposed correctly to the client
  define: {
    'process.env': {}
  }
})