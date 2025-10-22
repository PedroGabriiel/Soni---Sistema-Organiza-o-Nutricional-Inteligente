import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Encaminha chamadas /api para o Apache do XAMPP servir os .php
      "/api": {
        target: "http://localhost/Prototipo-Soni-Sistema-de-Organização-Nutricional-Inteligente/public",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
