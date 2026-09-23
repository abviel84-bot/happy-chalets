import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Rutas relativas: funciona en GitHub Pages (usuario.github.io/nombre-repo/),
  // en un dominio propio, en Vercel y en Netlify sin cambiar nada.
  base: "./",
  // El sitio construido va a /docs para que GitHub Pages lo publique directo
  // (Settings → Pages → Deploy from a branch → main → /docs).
  build: { outDir: "docs", emptyOutDir: true },
});
