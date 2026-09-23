import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale/es";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useSite } from "../../context/SiteContext.jsx";
import { addBlocked, removeBlocked } from "../../lib/api.js";
import { formatDate, fromISODate, nightsBetween, toISODate, today } from "../../lib/dates.js";
import { IconBtn } from "../ui.jsx";

export default function CalendarTab({ notify }) {
  const { content, blocked, setBlocked, blockedNights } = useSite();
  const [chalet, setChalet] = useState(content.chalets[0]?.id || "");
  const [range, setRange] = useState();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const booked = (d) => blockedNights[chalet]?.has(toISODate(d)) || false;
  const list = useMemo(
    () => blocked.filter((b) => b.chalet_id === chalet).sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [blocked, chalet]
  );

  async function add() {
    if (!range?.from || !range?.to) { notify("Elige la llegada y la salida en el calendario.", "err"); return; }
    setBusy(true);
    try {
      const row = await addBlocked({ chalet_id: chalet, start_date: toISODate(range.from), end_date: toISODate(range.to), note: note.trim() });
      setBlocked((b) => [...b, row]);
      setRange(undefined); setNote("");
      notify("Fechas marcadas como ocupadas.");
    } catch (e) { notify(e.message, "err"); } finally { setBusy(false); }
  }
  async function del(id) {
    try { await removeBlocked(id); setBlocked((b) => b.filter((x) => x.id !== id)); notify("Fechas liberadas."); }
    catch (e) { notify(e.message, "err"); }
  }

  return (
    <div className="grid gap-5">
      <div className="adm-card grid gap-4">
        <p className="text-sm text-muted">Marca aquí las fechas que ya están reservadas (por WhatsApp, Airbnb u otro medio). Los huéspedes las verán tachadas en el calendario. Elige el día de <b>llegada</b> y el día de <b>salida</b>: la noche de salida queda libre para otro huésped.</p>
        <div className="flex flex-wrap gap-2">
          {content.chalets.map((c) => (
            <button key={c.id} type="button" onClick={() => { setChalet(c.id); setRange(undefined); }}
              className={`adm-btn border ${chalet === c.id ? "border-azul bg-azul text-white" : "border-linea bg-white"}`}>{c.name}</button>
          ))}
        </div>
        <div className="hc-calendar overflow-x-auto">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            locale={es}
            startMonth={today()}
            disabled={{ before: today() }}
            modifiers={{ booked }}
            modifiersClassNames={{ booked: "hc-booked" }}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block"><span className="adm-label">Nota (opcional, solo la ves tú)</span>
            <input className="adm-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej.: Familia Pérez · Airbnb" /></label>
          <button type="button" onClick={add} disabled={busy || !range?.from || !range?.to} className="adm-btn h-[46px] bg-azul text-white">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {range?.from && range?.to ? `Bloquear ${nightsBetween(range.from, range.to)} noches` : "Bloquear fechas"}
          </button>
        </div>
      </div>

      <div className="adm-card grid gap-2">
        <h3 className="text-base font-extrabold">Próximas fechas ocupadas · {content.chalets.find((c) => c.id === chalet)?.name}</h3>
        {list.length === 0 && <p className="text-sm text-muted">No hay fechas bloqueadas.</p>}
        {list.map((b) => (
          <div key={b.id} className="flex items-center justify-between gap-3 border-b border-linea py-2.5 text-sm last:border-b-0">
            <div>
              <b>{formatDate(fromISODate(b.start_date))} → {formatDate(fromISODate(b.end_date))}</b>
              <span className="text-muted"> · {nightsBetween(fromISODate(b.start_date), fromISODate(b.end_date))} noches{b.note ? ` · ${b.note}` : ""}</span>
            </div>
            <IconBtn label="Liberar fechas" danger onClick={() => del(b.id)}><Trash2 className="size-4" /></IconBtn>
          </div>
        ))}
      </div>
    </div>
  );
}
