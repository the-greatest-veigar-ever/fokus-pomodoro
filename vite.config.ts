import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: true,
    port: 3000,
    allowedHosts: [
      'unquixotical-unpromptly-loan.ngrok-free.dev'
    ]
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['typescript']
        }
      }
    }
  },
  base: '/fokus-pomodoro/',
  publicDir: 'public'
})