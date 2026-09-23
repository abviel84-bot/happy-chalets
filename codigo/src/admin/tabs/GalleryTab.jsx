import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2, Play } from "lucide-react";
import { useSite } from "../../context/SiteContext.jsx";
import { addMedia, removeMedia, updateMedia } from "../../lib/api.js";
import { deleteMedia } from "../../lib/upload.js";
import { UploadButton, IconBtn } from "../ui.jsx";
import { isSupabaseConfigured } from "../../lib/supabase.js";

const CATS = { ext: "Exterior", int: "Interior", pool: "Piscina", beach: "Playa" };

export default function GalleryTab({ notify }) {
  const { media, setMedia } = useSite();
  const [cat, setCat] = useState("ext");
  const [savingId, setSavingId] = useState(null);

  async function onUploaded({ url, path, type, name }) {
    const row = await addMedia({ type, url, path, category: cat, caption: { es: "", en: "" }, sort: media.length });
    setMedia((m) => [...m, row]);
    notify(`«${name}» agregado a la galería.`);
  }

  async function patch(item, p) {
    const next = { ...item, ...p };
    setMedia((m) => m.map((x) => (x.id === item.id ? next : x)));
    return next;
  }
  async function persist(item) {
    setSavingId(item.id);
    try { await updateMedia(item); } catch (e) { notify(e.message, "err"); } finally { setSavingId(null); }
  }

  async function move(i, d) {
    const a = [...media]; const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    const re = a.map((x, k) => ({ ...x, sort: k }));
    setMedia(re);
    try { await Promise.all([updateMedia(re[i]), updateMedia(re[j])]); } catch (e) { notify(e.message, "err"); }
  }

  async function del(item) {
    if (!window.confirm("¿Borrar este archivo de la galería?")) return;
    try {
      await removeMedia(item.id);
      await deleteMedia(item.path);
      setMedia((m) => m.filter((x) => x.id !== item.id));
      notify("Archivo borrado.");
    } catch (e) { notify(e.message, "err"); }
  }

  return (
    <div className="grid gap-5">
      <div className="adm-card grid gap-3">
        <h3 className="text-base font-extrabold">Subir fotos o videos</h3>
        <label className="block max-w-xs"><span className="adm-label">Categoría de lo que vas a subir</span>
          <select className="adm-input" value={cat} onChange={(e) => setCat(e.target.value)}>
            {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <UploadButton multiple folder="gallery" label="Elegir archivos" onDone={onUploaded} onError={(m) => notify(m, "err")} />
        <p className="text-xs text-muted">
          Puedes elegir varios a la vez. Los videos grandes (más de 50 MB) se suben por partes y siguen si se corta el internet.
          {isSupabaseConfigured ? " El tamaño máximo por archivo depende de tu plan de Supabase." : " Modo demo: se ven solo en este navegador hasta recargar."}
        </p>
      </div>

      {media.length === 0 && <p className="text-sm text-muted">Todavía no hay fotos en la galería.</p>}
      <div className="grid gap-3">
        {media.map((m, i) => (
          <div key={m.id} className="adm-card grid gap-3 sm:grid-cols-[160px_1fr]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-tinta">
              {m.type === "video"
                ? <><video src={m.url} muted playsInline preload="metadata" className="size-full object-cover" /><Play className="absolute left-2 top-2 size-5 text-white" fill="currentColor" /></>
                : <img src={m.url} alt="" className="size-full object-cover" loading="lazy" />}
            </div>
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <select className="adm-input w-auto" value={m.category} onChange={async (e) => persist(await patch(m, { category: e.target.value }))}>
                  {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <div className="flex gap-1">
                  <IconBtn label="Subir" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="size-4" /></IconBtn>
                  <IconBtn label="Bajar" onClick={() => move(i, 1)} disabled={i === media.length - 1}><ArrowDown className="size-4" /></IconBtn>
                  <IconBtn label="Borrar" danger onClick={() => del(m)}><Trash2 className="size-4" /></IconBtn>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input className="adm-input" placeholder="Descripción (español)" value={m.caption?.es || ""}
                  onChange={(e) => patch(m, { caption: { ...m.caption, es: e.target.value } })} onBlur={() => persist(media.find((x) => x.id === m.id))} />
                <input className="adm-input" placeholder="Description (English)" value={m.caption?.en || ""}
                  onChange={(e) => patch(m, { caption: { ...m.caption, en: e.target.value } })} onBlur={() => persist(media.find((x) => x.id === m.id))} />
              </div>
              {savingId === m.id && <span className="text-xs text-muted">Guardando…</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
