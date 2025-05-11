import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['18f0-47-35-151-22.ngrok-free.app'], // Add your ngrok URL here
  },
})
