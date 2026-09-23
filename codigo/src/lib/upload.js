import * as tus from "tus-js-client";
import { supabase, isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY, MEDIA_BUCKET } from "./supabase.js";

/**
 * Sube un archivo a Supabase Storage con "resumable upload" (protocolo TUS).
 * - Sirve para videos grandes (más de 50 MB): sube en pedazos de 6 MB y, si se
 *   corta el internet, continúa donde se quedó.
 * - El tamaño máximo lo decide tu plan de Supabase (Free: 50 MB por archivo;
 *   Pro: se puede subir hasta 500 GB en Storage → Settings).
 *
 * @returns {Promise<{path:string,url:string}>}
 */
export async function uploadMedia(file, { folder = "uploads", onProgress, signal } = {}) {
  if (!isSupabaseConfigured) {
    // Modo demo: se muestra localmente (se pierde al recargar).
    onProgress?.(1);
    return { path: "", url: URL.createObjectURL(file), local: true };
  }
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("Tu sesión expiró. Vuelve a entrar al modo administrador.");

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const safe = file.name.replace(/\.[^.]+$/, "").normalize("NFD").replace(/[^\w-]+/g, "-").slice(0, 40) || "archivo";
  const path = `${folder}/${Date.now()}-${safe}.${ext}`;

  const endpoint = storageEndpoint();

  await new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: { authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY, "x-upsert": "true" },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: MEDIA_BUCKET,
        objectName: path,
        contentType: file.type || "application/octet-stream",
        cacheControl: "31536000",
      },
      chunkSize: 6 * 1024 * 1024, // Supabase exige 6 MB
      onError: (err) => reject(humanError(err)),
      onProgress: (sent, total) => onProgress?.(total ? sent / total : 0),
      onSuccess: () => resolve(),
    });
    if (signal) signal.addEventListener("abort", () => { upload.abort(true); reject(new Error("Subida cancelada")); });
    upload.findPreviousUploads().then((prev) => {
      if (prev.length) upload.resumeFromPreviousUpload(prev[0]);
      upload.start();
    });
  });

  const { data: pub } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { path, url: pub.publicUrl };
}

export async function deleteMedia(path) {
  if (!isSupabaseConfigured || !path) return;
  await supabase.storage.from(MEDIA_BUCKET).remove([path]);
}

function storageEndpoint() {
  // https://abc.supabase.co → https://abc.storage.supabase.co (recomendado por Supabase para archivos grandes)
  const m = SUPABASE_URL.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i);
  return m
    ? `https://${m[1]}.storage.supabase.co/storage/v1/upload/resumable`
    : `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/upload/resumable`;
}

function humanError(err) {
  const msg = String(err?.message || err);
  if (/413|too large|Payload/i.test(msg))
    return new Error("El archivo es más grande que el límite de tu plan de Supabase. En el plan Free el máximo es 50 MB; en Pro puedes subirlo en Storage → Settings.");
  if (/401|403|row-level|policy/i.test(msg))
    return new Error("No tienes permiso para subir archivos. Verifica que tu correo esté en la tabla admin_users.");
  return new Error("No se pudo subir el archivo: " + msg);
}

export function isVideoFile(file) {
  return /^video\//.test(file?.type || "") || /\.(mp4|mov|webm|m4v)$/i.test(file?.name || "");
}

export function formatBytes(n) {
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
