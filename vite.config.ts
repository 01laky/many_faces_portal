import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_DEV_PORT) || 8081,
    host: true, // Allow access from network
  },
  // Enable JSON imports
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  // Define environment variables with defaults
  define: {
    __APP_NAME__: JSON.stringify(process.env.VITE_APP_NAME || 'Be Demo Frontend'),
    __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION || '1.0.0'),
  },
})
