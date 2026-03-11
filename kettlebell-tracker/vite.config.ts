import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      // Mirrors the Vercel Edge Function in api/auth/[...path].ts.
      // /api/auth/sign-in/email → neonauth.../neondb/auth/sign-in/email
      '/api/auth': {
        target: 'https://ep-plain-art-ag9lypls.neonauth.c-2.eu-central-1.aws.neon.tech',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/neondb/auth'),
      },
    },
  },
})
