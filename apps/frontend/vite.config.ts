import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  server: {
    host: true,
    allowedHosts: ['*'],
},
  build: {
    chunkSizeWarningLimit: 1000,
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state-vendor': ['zustand'],
          'ui-vendor': ['framer-motion'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'markdown-vendor': ['react-markdown', 'remark-gfm', 'rehype-highlight', 'react-syntax-highlighter'],
          'i18n-vendor': ['i18next', 'react-i18next'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@wadi/chat-core'],
  },
})


