import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { verifyClone } from './src/api/verify'; // Removido

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    // Garantir que o Rollup use a versão correta
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    proxy: {
      "/api/verify": {
        target: "http://localhost",
        changeOrigin: true,
        // Removido configure customizado, uso padrão
      },
    },
  },
});
