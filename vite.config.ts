import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        outDir: "dist/client",
        emptyOutDir: false,
    },
    server: {
        port: 5173,
        host: "127.0.0.1",
        proxy: {
            "/v1": {
                target: "http://127.0.0.1:3000",
                changeOrigin: true,
            },
            "/api": {
                target: "http://127.0.0.1:3000",
                changeOrigin: true,
            },
            "/openai": {
                target: "http://127.0.0.1:3000",
                changeOrigin: true,
            },
            "/anthropic": {
                target: "http://127.0.0.1:3000",
                changeOrigin: true,
            },
        },
    },
});
