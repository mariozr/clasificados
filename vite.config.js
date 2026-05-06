import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',// Clasificados
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
    sourcemap: false,
    cssMinify: true,
  },
  server: {
    open: true,
  },
})
