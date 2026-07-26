import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project from a subfolder
  // (https://mahmoodkhan944.github.io/AlHind-Lifecare/), not the domain root,
  // so every asset URL Vite generates needs this prefix. Without it, built
  // JS/CSS request from the domain root (404) and the page stays blank
  // because React never gets a chance to mount.
  base: '/AlHind-Lifecare/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '/src'),
    },
  },
  plugins: [
    react(),
  ]
});