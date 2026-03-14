import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    passWithNoTests: true,
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'server/src/**/*.test.ts',
    ],
  },
})
