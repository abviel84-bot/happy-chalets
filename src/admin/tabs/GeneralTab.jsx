import { Field, Text, Num, Toggle } from "../ui.jsx";

export default function GeneralTab({ draft, setDraft }) {
  const s = draft.settings;
  const set = (patch) => setDraft({ ...draft, settings: { ...s, ...patch } });
  return (
    <div className="grid gap-5">
      <div className="adm-card grid gap-4 sm:grid-cols-2">
        <h3 className="text-base font-extrabold sm:col-span-2">Contacto</h3>
        <Field label="Número de WhatsApp (con código de país)" hint="Solo números. Ej.: 17875058678 (1 + 787...)">
          <Text value={s.whatsapp} onChange={(v) => set({ whatsapp: v.replace(/\D/g, "") })} inputMode="numeric" />
        </Field>
        <Field label="Teléfono como se muestra"><Text value={s.phoneDisplay} onChange={(v) => set({ phoneDisplay: v })} /></Field>
        <Field label="Email"><Text type="email" value={s.email} onChange={(v) => set({ email: v })} /></Field>
        <Field label="Dirección"><Text value={s.address} onChange={(v) => set({ address: v })} /></Field>
        <Field label="Búsqueda para el mapa" hint="Lo que se busca en Google Maps para el mapa embebido."><Text value={s.mapsQuery} onChange={(v) => set({ mapsQuery: v })} /></Field>
        <div />
        <Field label="Enlace de Instagram" hint="https://instagram.com/..."><Text value={s.instagram} onChange={(v) => set({ instagram: v })} /></Field>
        <Field label="Enlace de Facebook" hint="https://facebook.com/..."><Text value={s.facebook} onChange={(v) => set({ facebook: v })} /></Field>
      </div>

      <div className="adm-card grid gap-4 sm:grid-cols-2">
        <h3 className="text-base font-extrabold sm:col-span-2">Reglas de reserva</h3>
        <Field label="Mínimo de noches"><Num value={s.minNights} min={1} max={30} onChange={(v) => set({ minNights: v })} /></Field>
        <Field label="Máximo de bebés por reserva"><Num value={s.maxBabies} min={0} max={10} onChange={(v) => set({ maxBabies: v })} /></Field>
        <div className="grid content-end pb-2"><Toggle checked={s.petsAllowed} onChange={(v) => set({ petsAllowed: v })} label="Se permiten mascotas (muestra el contador)" /></div>
        {s.petsAllowed && <Field label="Máximo de mascotas"><Num value={s.maxPets} min={1} max={10} onChange={(v) => set({ maxPets: v })} /></Field>}
        <p className="text-sm text-muted sm:col-span-2">Los precios no se muestran en la página: el huésped envía su solicitud y tú le contestas el precio por WhatsApp.</p>
      </div>
    </div>
  );
}
