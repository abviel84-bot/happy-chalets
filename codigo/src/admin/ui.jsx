import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { uploadMedia, formatBytes, isVideoFile } from "../lib/upload.js";
import { ICONS } from "../components/Icon.jsx";
import Icon from "../components/Icon.jsx";

export function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="adm-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Text({ value, onChange, ...rest }) {
  return <input className="adm-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

export function Num({ value, onChange, min = 0, max = 99 }) {
  return <input type="number" className="adm-input" min={min} max={max} value={value ?? 0} onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))} />;
}

export function Area({ value, onChange, rows = 3, ...rest }) {
  return <textarea className="adm-input" rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

/** Campo bilingüe {es,en} */
export function Bi({ label, value = {}, onChange, area = false, rows = 3 }) {
  const C = area ? Area : Text;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Field label={`${label} · Español`}><C rows={rows} value={value.es} onChange={(v) => onChange({ ...value, es: v })} /></Field>
      <Field label={`${label} · English`}><C rows={rows} value={value.en} onChange={(v) => onChange({ ...value, en: v })} /></Field>
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-semibold">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-azul" : "bg-[#CFC5B0]"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
      {label}
    </label>
  );
}

export function IconPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-arena text-azul"><Icon name={value} /></span>
      <select className="adm-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.keys(ICONS).map((k) => <option key={k} value={k}>{k}</option>)}
      </select>
    </div>
  );
}

/** Lista editable genérica con agregar / borrar / subir / bajar */
export function ListEditor({ items, onChange, render, empty, addLabel = "Agregar", title }) {
  const move = (i, d) => {
    const a = [...items]; const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; onChange(a);
  };
  return (
    <div className="grid gap-3">
      {items.map((it, i) => (
        <div key={i} className="adm-card grid gap-3">
          <div className="flex items-center justify-between gap-2">
            <b className="text-sm text-muted">{title ? title(it, i) : `#${i + 1}`}</b>
            <div className="flex gap-1">
              <IconBtn label="Subir" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="size-4" /></IconBtn>
              <IconBtn label="Bajar" onClick={() => move(i, 1)} disabled={i === items.length - 1}><ArrowDown className="size-4" /></IconBtn>
              <IconBtn label="Borrar" danger onClick={() => onChange(items.filter((_, k) => k !== i))}><Trash2 className="size-4" /></IconBtn>
            </div>
          </div>
          {render(it, (patch) => onChange(items.map((x, k) => (k === i ? { ...x, ...patch } : x))), i)}
        </div>
      ))}
      <button type="button" className="adm-btn justify-center border-2 border-dashed border-linea bg-white py-3 text-azul hover:bg-arena" onClick={() => onChange([...items, structuredClone(empty)])}>
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  );
}

export function IconBtn({ children, label, danger, ...rest }) {
  return (
    <button type="button" aria-label={label} title={label}
      className={`grid size-8 place-items-center rounded-lg border border-linea bg-white disabled:opacity-30 ${danger ? "text-[#B42318] hover:bg-[#FDECEA]" : "hover:bg-arena"}`} {...rest}>
      {children}
    </button>
  );
}

/**
 * Botón para subir un archivo (imagen o video) con barra de progreso.
 * onDone recibe { url, path, type }.
 */
export function UploadButton({ accept = "image/*,video/*", folder, onDone, label = "Subir archivo", multiple = false, onError }) {
  const input = useRef(null);
  const [jobs, setJobs] = useState([]);

  async function handle(files) {
    for (const file of files) {
      const id = Math.random().toString(36).slice(2);
      setJobs((j) => [...j, { id, name: file.name, size: file.size, p: 0, err: "" }]);
      try {
        const res = await uploadMedia(file, { folder, onProgress: (p) => setJobs((j) => j.map((x) => (x.id === id ? { ...x, p } : x))) });
        await onDone({ ...res, type: isVideoFile(file) ? "video" : "image", name: file.name });
        setJobs((j) => j.filter((x) => x.id !== id));
      } catch (e) {
        setJobs((j) => j.map((x) => (x.id === id ? { ...x, err: e.message } : x)));
        onError?.(e.message);
      }
    }
  }

  return (
    <div className="grid gap-2">
      <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => { handle([...e.target.files]); e.target.value = ""; }} />
      <button type="button" className="adm-btn w-fit bg-azul text-white hover:bg-azul-d" onClick={() => input.current?.click()}>
        <Upload className="size-4" /> {label}
      </button>
      {jobs.map((j) => (
        <div key={j.id} className="rounded-xl border border-linea bg-white p-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="truncate font-semibold">{j.name}</span>
            <span className="shrink-0 text-muted">{formatBytes(j.size)}</span>
          </div>
          {j.err ? (
            <p className="mt-1 text-[#B42318]">{j.err}</p>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-arena-2"><div className="h-full bg-azul transition-[width]" style={{ width: `${Math.round(j.p * 100)}%` }} /></div>
              <span className="w-12 text-right tabular-nums text-muted">{Math.round(j.p * 100)}%</span>
              <Loader2 className="size-4 animate-spin text-azul" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
