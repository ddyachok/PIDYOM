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
      // Proxy Neon Auth requests so session cookies are same-origin in dev too.
      // Matches the Vercel edge function in api/auth/[...path].js for production parity.
      '/neondb/auth': {
        target: 'https://ep-plain-art-ag9lypls.neonauth.c-2.eu-central-1.aws.neon.tech',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
