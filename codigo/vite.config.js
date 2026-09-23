import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Rutas relativas: funciona en GitHub Pages (usuario.github.io/nombre-repo/),
  // en un dominio propio, en Vercel y en Netlify sin cambiar nada.
  base: "./",
  // "npm run publicar" construye en /dist y copia la página a la carpeta
  // principal del repositorio (lo que muestra GitHub Pages).
  build: { outDir: "dist", emptyOutDir: true },
});
