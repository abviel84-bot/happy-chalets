import { Bi, Field, Text, UploadButton } from "../ui.jsx";
import { Image, Video } from "lucide-react";
import { isSupabaseConfigured } from "../../lib/supabase.js";

export default function HeroTab({ draft, setDraft, notify }) {
  const h = draft.hero;
  const set = (patch) => setDraft({ ...draft, hero: { ...h, ...patch } });
  return (
    <div className="grid gap-5">
      <div className="adm-card grid gap-4">
        <h3 className="text-base font-extrabold">Fondo de la portada</h3>
        <div className="flex flex-wrap gap-2">
          {[["image", "Foto", Image], ["video", "Video", Video]].map(([v, l, I]) => (
            <button key={v} type="button" onClick={() => set({ mediaType: v })}
              className={`adm-btn border ${h.mediaType === v ? "border-azul bg-azul text-white" : "border-linea bg-white"}`}><I className="size-4" /> {l}</button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-linea bg-tinta">
          {h.mediaType === "video" && h.videoUrl ? (
            <video src={h.videoUrl} poster={h.posterUrl || undefined} muted autoPlay loop playsInline className="aspect-video w-full object-cover" />
          ) : h.imageUrl ? (
            <img src={h.imageUrl} alt="" className="aspect-video w-full object-cover" />
          ) : (
            <div className="grid aspect-video place-items-center text-sm text-white/70">Sin archivo</div>
          )}
        </div>

        {h.mediaType === "video" ? (
          <div className="grid gap-3">
            <UploadButton accept="video/mp4,video/webm,video/quicktime" folder="hero" label="Subir video"
              onDone={({ url }) => { set({ videoUrl: url }); notify("Video subido. Presiona «Guardar cambios»."); }} onError={(m) => notify(m, "err")} />
            <p className="text-xs text-muted">
              Se sube en partes de 6 MB y continúa si se corta el internet, así que puede pesar más de 50 MB.
              {isSupabaseConfigured ? " El máximo depende de tu plan de Supabase (Free: 50 MB; Pro: hasta 500 GB)." : ""}
              {" "}Recomendado: MP4 (H.264), 1080p, 20–40 segundos, sin audio. El video se reproduce en silencio y en bucle.
            </p>
            <Field label="…o pega el enlace directo de un video (.mp4)"><Text value={h.videoUrl} onChange={(v) => set({ videoUrl: v })} placeholder="https://…/video.mp4" /></Field>
            <Field label="Imagen mientras carga el video (póster)" hint="Se usa también en celulares con ahorro de datos.">
              <div className="grid gap-2">
                <Text value={h.posterUrl} onChange={(v) => set({ posterUrl: v })} />
                <UploadButton accept="image/*" folder="hero" label="Subir póster" onDone={({ url }) => set({ posterUrl: url })} onError={(m) => notify(m, "err")} />
              </div>
            </Field>
          </div>
        ) : (
          <div className="grid gap-3">
            <UploadButton accept="image/*" folder="hero" label="Subir foto" onDone={({ url }) => { set({ imageUrl: url, posterUrl: h.posterUrl || url }); notify("Foto subida. Presiona «Guardar cambios»."); }} onError={(m) => notify(m, "err")} />
            <Field label="…o pega el enlace de una imagen"><Text value={h.imageUrl} onChange={(v) => set({ imageUrl: v })} /></Field>
            <p className="text-xs text-muted">Recomendado: foto horizontal de al menos 1920 px de ancho, en formato WebP o JPG.</p>
          </div>
        )}
      </div>

      <div className="adm-card grid gap-4">
        <h3 className="text-base font-extrabold">Textos de la portada</h3>
        <Bi label="Línea pequeña" value={h.kicker} onChange={(v) => set({ kicker: v })} />
        <Bi label="Título" value={h.title} onChange={(v) => set({ title: v })} />
        <Bi label="Subtítulo" value={h.subtitle} onChange={(v) => set({ subtitle: v })} area rows={2} />
      </div>
    </div>
  );
}
