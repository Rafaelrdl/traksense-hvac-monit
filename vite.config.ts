import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = process.env.PROJECT_ROOT || __dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  server: {
    proxy: {
      // 🔐 Proxy API requests to backend (enables cookie sharing)
      // Frontend (localhost:5173) → Backend (umc.localhost:8000)
      // This way cookies work because both are on localhost:5173 from browser's perspective
      '/api': {
        target: 'http://umc.localhost:8000',
        changeOrigin: true,
        secure: false,
        // Preserve /api prefix in the request
        // rewrite: (path) => path.replace(/^\/api/, '/api'),
      }
    }
  }
});
