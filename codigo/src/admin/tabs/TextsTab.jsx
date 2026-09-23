import { useState } from "react";
import { Bi, Field, IconPicker, ListEditor, Text, UploadButton } from "../ui.jsx";

const SECTIONS = [
  ["chalets", "Sección Chalets"], ["amenities", "Sección Amenidades"], ["gallery", "Sección Galería"],
  ["guanica", "Sección Guánica"], ["reviews", "Sección Reseñas"], ["faq", "Sección Preguntas"], ["cta", "Llamado final (reservar)"],
];
const SUB = [
  ["sections", "Títulos de secciones"], ["trust", "Barra de confianza"], ["amenities", "Amenidades"],
  ["places", "Qué hacer en Guánica"], ["faq", "Preguntas frecuentes"], ["reviews", "Reseñas reales"],
];

export default function TextsTab({ draft, setDraft, notify }) {
  const [sub, setSub] = useState("sections");
  const setKey = (k, v) => setDraft({ ...draft, [k]: v });

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-1.5">
        {SUB.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setSub(k)} className={`adm-btn border ${sub === k ? "border-tinta bg-tinta text-white" : "border-linea bg-white"}`}>{l}</button>
        ))}
      </div>

      {sub === "sections" && SECTIONS.map(([k, l]) => (
        <div key={k} className="adm-card grid gap-3">
          <h3 className="text-base font-extrabold">{l}</h3>
          <Bi label="Etiqueta pequeña" value={draft.sections[k]?.eyebrow} onChange={(v) => setKey("sections", { ...draft.sections, [k]: { ...draft.sections[k], eyebrow: v } })} />
          <Bi label="Título" value={draft.sections[k]?.title} onChange={(v) => setKey("sections", { ...draft.sections, [k]: { ...draft.sections[k], title: v } })} />
          <Bi label="Texto" area rows={2} value={draft.sections[k]?.text} onChange={(v) => setKey("sections", { ...draft.sections, [k]: { ...draft.sections[k], text: v } })} />
        </div>
      ))}

      {sub === "trust" && (
        <ListEditor items={draft.trust} onChange={(v) => setKey("trust", v)} addLabel="Agregar dato" empty={{ icon: "sun", es: "", en: "" }}
          title={(x) => x.es || "Nuevo"}
          render={(x, set) => (
            <div className="grid gap-3">
              <IconPicker value={x.icon} onChange={(icon) => set({ icon })} />
              <Bi label="Texto" value={{ es: x.es, en: x.en }} onChange={(v) => set(v)} />
            </div>
          )} />
      )}

      {sub === "amenities" && (
        <ListEditor items={draft.amenities} onChange={(v) => setKey("amenities", v)} addLabel="Agregar amenidad"
          empty={{ icon: "sparkles", title: { es: "", en: "" }, text: { es: "", en: "" } }} title={(x) => x.title?.es || "Nueva"}
          render={(x, set) => (
            <div className="grid gap-3">
              <IconPicker value={x.icon} onChange={(icon) => set({ icon })} />
              <Bi label="Nombre" value={x.title} onChange={(v) => set({ title: v })} />
              <Bi label="Detalle" value={x.text} onChange={(v) => set({ text: v })} />
            </div>
          )} />
      )}

      {sub === "places" && (
        <ListEditor items={draft.places} onChange={(v) => setKey("places", v)} addLabel="Agregar lugar"
          empty={{ name: "", distance: { es: "", en: "" }, text: { es: "", en: "" }, imageUrl: "" }} title={(x) => x.name || "Nuevo"}
          render={(x, set) => (
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                <Field label="Nombre del lugar"><Text value={x.name} onChange={(name) => set({ name })} /></Field>
                <div className="grid gap-1.5">
                  {x.imageUrl && <img src={x.imageUrl} alt="" className="aspect-video w-full rounded-lg object-cover" />}
                  <UploadButton accept="image/*" folder="places" label="Foto" onDone={({ url }) => set({ imageUrl: url })} onError={(m) => notify(m, "err")} />
                </div>
              </div>
              <Bi label="Distancia" value={x.distance} onChange={(v) => set({ distance: v })} />
              <Bi label="Descripción" value={x.text} onChange={(v) => set({ text: v })} />
            </div>
          )} />
      )}

      {sub === "faq" && (
        <ListEditor items={draft.faq} onChange={(v) => setKey("faq", v)} addLabel="Agregar pregunta"
          empty={{ q: { es: "", en: "" }, a: { es: "", en: "" } }} title={(x) => x.q?.es || "Nueva pregunta"}
          render={(x, set) => (
            <div className="grid gap-3">
              <Bi label="Pregunta" value={x.q} onChange={(v) => set({ q: v })} />
              <Bi label="Respuesta" area rows={3} value={x.a} onChange={(v) => set({ a: v })} />
            </div>
          )} />
      )}

      {sub === "reviews" && (
        <>
          <p className="text-sm text-muted">Publica solo reseñas reales y con permiso del huésped. Mientras no haya ninguna, la página muestra espacios vacíos.</p>
          <ListEditor items={draft.reviews || []} onChange={(v) => setKey("reviews", v)} addLabel="Agregar reseña"
            empty={{ name: "", date: "", rating: 5, text: { es: "", en: "" } }} title={(x) => x.name || "Nueva reseña"}
            render={(x, set) => (
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Nombre del huésped"><Text value={x.name} onChange={(name) => set({ name })} /></Field>
                  <Field label="Fecha (ej.: julio 2026)"><Text value={x.date} onChange={(date) => set({ date })} /></Field>
                  <Field label="Estrellas">
                    <select className="adm-input" value={x.rating} onChange={(e) => set({ rating: Number(e.target.value) })}>
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </Field>
                </div>
                <Bi label="Reseña" area rows={3} value={typeof x.text === "string" ? { es: x.text, en: x.text } : x.text} onChange={(v) => set({ text: v })} />
              </div>
            )} />
        </>
      )}
    </div>
  );
}
