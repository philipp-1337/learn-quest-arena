import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'web-app-manifest-192x192.png', 'web-app-manifest-512x512.png'],
      manifest: {
        name: 'Learn Quest Arena',
        short_name: 'Learn Quest',
        description: 'Eine Progressive Web App für interaktives Lernen',
        theme_color: '#faf5ff',
        background_color: '#faf5ff',
        display: 'standalone',
        icons: [
          {
            src: '/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Tage
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@config": path.resolve(__dirname, "src/config"),
      "@features": path.resolve(__dirname, "src/features"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@admin": path.resolve(__dirname, "src/features/admin"),
      "@admin/*": path.resolve(__dirname, "src/features/admin/*"),
      "@auth": path.resolve(__dirname, "src/features/auth"),
      "@auth/*": path.resolve(__dirname, "src/features/auth/*"),
      "@quiz": path.resolve(__dirname, "src/features/quiz"),
      "@quiz/*": path.resolve(__dirname, "src/features/quiz/*"),
      "@modals": path.resolve(__dirname, "src/features/modals"),
      "@quiz-browse": path.resolve(__dirname, "src/features/quiz-browse"),
      "@quiz-browse/*": path.resolve(__dirname, "src/features/quiz-browse/*"),
      "@quiz-player": path.resolve(__dirname, "src/features/quiz-player"),
      "@quiz-player/*": path.resolve(__dirname, "src/features/quiz-player/*"),
      "@shared": path.resolve(__dirname, "src/features/shared"),
      "@username": path.resolve(__dirname, "src/features/username"),
      "quizTypes": path.resolve(__dirname, "src/types/quizTypes"),
      "userProgress": path.resolve(__dirname, "src/types/userProgress"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("sonner")) {
              return "sonner";
            }
            if (id.includes("firebase")) {
              return "firebase";
            }
            if (id.includes("cloudinary")) {
              return "cloudinary";
            }
            if (id.includes("lucide-react")) {
              return "lucide";
            }
            if (id.includes("react")) {
              return "react";
            }
            return "vendor";
          }
        },
      },
    },
  },
})
