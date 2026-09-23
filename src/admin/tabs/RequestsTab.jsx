import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { listBookingRequests, setRequestStatus } from "../../lib/api.js";
import { formatDate, fromISODate } from "../../lib/dates.js";

const STATUS = {
  nueva: ["Nueva", "bg-[#FFF1CC] text-[#6B4A00]"],
  contestada: ["Contestada", "bg-[#E1ECF9] text-azul"],
  confirmada: ["Confirmada", "bg-[#DDF1E3] text-[#1D5A31]"],
  descartada: ["Descartada", "bg-[#EEE] text-muted"],
};

export default function RequestsTab({ notify }) {
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState("todas");

  async function load() {
    setRows(null);
    try { setRows(await listBookingRequests()); } catch (e) { notify(e.message, "err"); setRows([]); }
  }
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function change(r, status) {
    setRows((x) => x.map((y) => (y.id === r.id ? { ...y, status } : y)));
    try { await setRequestStatus(r.id, status); } catch (e) { notify(e.message, "err"); }
  }

  const list = (rows || []).filter((r) => filter === "todas" || r.status === filter);

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        Cada vez que alguien presiona «Enviar solicitud por WhatsApp», se guarda una copia aquí. Así no se te pierde ninguna,
        aunque la persona no llegue a enviar el mensaje. Cuando confirmes una reserva, recuerda bloquear sus fechas en «Fechas ocupadas».
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {["todas", ...Object.keys(STATUS)].map((k) => (
          <button key={k} type="button" onClick={() => setFilter(k)} className={`adm-btn border ${filter === k ? "border-tinta bg-tinta text-white" : "border-linea bg-white"}`}>
            {k === "todas" ? "Todas" : STATUS[k][0]}
          </button>
        ))}
        <button type="button" onClick={load} className="adm-btn ml-auto border border-linea bg-white"><RotateCcw className="size-4" /> Actualizar</button>
      </div>

      {rows === null && <p className="flex items-center gap-2 text-sm text-muted"><Loader2 className="size-4 animate-spin" /> Cargando…</p>}
      {rows && list.length === 0 && <p className="text-sm text-muted">No hay solicitudes {filter !== "todas" ? "con ese estado" : "todavía"}.</p>}

      {list.map((r) => (
        <article key={r.id} className="adm-card grid gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <b className="text-base">{r.guest_name || "(sin nombre)"}</b>
              <span className="text-sm text-muted"> · {r.chalet_name} · {new Date(r.created_at).toLocaleString("es-PR", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <select value={r.status} onChange={(e) => change(r, e.target.value)} className={`rounded-lg border-0 px-2.5 py-1.5 text-sm font-bold ${STATUS[r.status]?.[1] || ""}`} aria-label="Estado">
              {Object.entries(STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <p className="text-sm">
            <b>{r.check_in ? formatDate(fromISODate(r.check_in)) : "—"}</b> → <b>{r.check_out ? formatDate(fromISODate(r.check_out)) : "—"}</b>
            {" "}· {r.nights} noches · {r.adults} adultos{r.kids ? `, ${r.kids} niños` : ""}{r.babies ? `, ${r.babies} bebés` : ""}{r.pets ? `, ${r.pets} mascotas` : ""}
          </p>
          {(r.reason || r.comments) && <p className="text-sm text-muted">{r.reason && <>Motivo: {r.reason}. </>}{r.comments}</p>}
          <details className="text-sm">
            <summary className="cursor-pointer font-semibold text-azul">Ver mensaje enviado</summary>
            <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-arena p-3 font-sans">{r.message}</pre>
          </details>
        </article>
      ))}
    </div>
  );
}
