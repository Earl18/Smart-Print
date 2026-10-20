/**
 * Vite config for the Smart Print renderer (Electron desktop build).
 * The renderer mounts the exact same React app the Next.js preview serves:
 * entry is renderer/index.html → renderer/main.tsx → src/kiosk/index.tsx.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  root: 'renderer',
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: '../dist-renderer',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
