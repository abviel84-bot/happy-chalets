# Happy Chalets

- **Página publicada:** esta carpeta principal (`index.html`, `assets/`, fotos). GitHub Pages la muestra tal cual.
- **Código fuente (React + Supabase):** carpeta `codigo/`. Instrucciones completas en `codigo/README.md`.

## Publicar en GitHub Pages
1. Sube TODO el contenido de esta carpeta a tu repositorio (rama `main`).
2. Settings → Pages → Source: **Deploy from a branch** → `main` → **/ (root)** → Save.

## Después de cambiar el código
```bash
cd codigo
npm install        # solo la primera vez
npm run publicar   # construye y copia la página aquí
```
Luego sube los cambios a GitHub.
