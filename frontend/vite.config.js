import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const src = (segment = '') => fileURLToPath(new URL(`./src/${segment}`, import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': src(),
      '@components': src('components'),
      '@pages': src('pages'),
      '@layouts': src('layouts'),
      '@hooks': src('hooks'),
      '@data': src('data'),
      '@utils': src('utils'),
      '@constants': src('constants'),
      '@context': src('context'),
      '@services': src('services'),
      '@assets': src('assets'),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Deliberate vendor splitting keeps the initial bundle small and
        // leaves the app code-splitting friendly for future route lazy-loading.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  server: { port: 5173, host: true, open: false },
  preview: { port: 4173, host: true },
})
