// Copia la página construida (codigo/dist) a la carpeta principal del repositorio,
// que es lo que publica GitHub Pages con "Deploy from a branch → main → / (root)".
import { cpSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, "../dist");
const root = resolve(here, "../..");

if (existsSync(resolve(root, "assets"))) rmSync(resolve(root, "assets"), { recursive: true });
cpSync(dist, root, { recursive: true });
console.log("Listo: la página quedó en la carpeta principal. Sube los cambios a GitHub.");
