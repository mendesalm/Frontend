import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente com base no modo (development, production, etc.)
  const env = loadEnv(mode, '', "");

  return {
    plugins: [react({ jsxRuntime: "automatic" })],
    resolve: {
      alias: {
        "~": "/src",
      },
    },
    server: {
      proxy: {
        // Proxy para as chamadas de API (ex: /api/membros)
        "/api": {
          target: env.VITE_BACKEND_URL || "http://localhost:3001",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        // Proxy para a pasta de uploads (áudios, imagens, etc.)
        "/uploads": {
          target: env.VITE_BACKEND_URL || "http://localhost:3001",
          changeOrigin: true,
        },
      },
    },
  };
});
