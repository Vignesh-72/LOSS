import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.jpeg', 'logotrans.png'],
      manifest: {
        name: 'LOSS - Market Analyzer',
        short_name: 'LOSS',
        theme_color: '#262626',
        icons: [
            {
                src: '/logo.jpeg',
                sizes: '192x192',
                type: 'image/jpeg',
                purpose: 'any maskable'
            }
        ]
      }
    })
  ],
  // === ADD THIS SECTION ===
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Points to our new local-server.js
        changeOrigin: true,
        secure: false,
      }
    }
  }
})