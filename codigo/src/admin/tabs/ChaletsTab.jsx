import { Bi, Field, ListEditor, Num, Text, UploadButton } from "../ui.jsx";
import { UI } from "../../lib/i18n.js";

const FEATURES = Object.keys(UI.es.features);

const EMPTY = { id: "", name: "Nuevo chalet", capacity: 4, bedrooms: 1, baths: 1, imageUrl: "", desc: { es: "", en: "" }, features: ["pool", "ac", "kitchen", "wifi"] };

export default function ChaletsTab({ draft, setDraft, notify }) {
  const setList = (chalets) => setDraft({
    ...draft,
    chalets: chalets.map((c) => ({ ...c, id: c.id || `${slug(c.name) || "chalet"}-${Math.random().toString(36).slice(2, 6)}` })),
  });
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">Sin precios: el huésped pide y tú le contestas el precio por WhatsApp. El código interno (id) de cada chalet no cambia aunque le cambies el nombre, para no perder sus fechas ocupadas.</p>
      <ListEditor
        items={draft.chalets}
        onChange={setList}
        empty={EMPTY}
        addLabel="Agregar chalet"
        title={(c) => `${c.name} · id: ${c.id || "(nuevo)"}`}
        render={(c, set) => (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
              <div className="grid content-start gap-2">
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-arena-2">
                  {c.imageUrl ? <img src={c.imageUrl} alt="" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-xs text-muted">Sin foto</div>}
                </div>
                <UploadButton accept="image/*" folder="chalets" label="Subir foto" onDone={({ url }) => set({ imageUrl: url })} onError={(m) => notify(m, "err")} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nombre" className="sm:col-span-2"><Text value={c.name} onChange={(v) => set({ name: v })} /></Field>
                <Field label="Capacidad (personas)"><Num value={c.capacity} min={1} max={40} onChange={(v) => set({ capacity: v })} /></Field>
                <Field label="Habitaciones"><Num value={c.bedrooms} min={0} max={20} onChange={(v) => set({ bedrooms: v })} /></Field>
                <Field label="Baños"><Num value={c.baths} min={0} max={20} onChange={(v) => set({ baths: v })} /></Field>
              </div>
            </div>
            <Bi label="Descripción" value={c.desc} onChange={(v) => set({ desc: v })} area rows={2} />
            <div>
              <span className="adm-label">Características</span>
              <div className="flex flex-wrap gap-2">
                {FEATURES.map((f) => {
                  const on = (c.features || []).includes(f);
                  return (
                    <button key={f} type="button" aria-pressed={on}
                      onClick={() => set({ features: on ? c.features.filter((x) => x !== f) : [...(c.features || []), f] })}
                      className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${on ? "border-azul bg-azul text-white" : "border-linea bg-white"}`}>
                      {UI.es.features[f]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}

function slug(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/chalet\s*/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
