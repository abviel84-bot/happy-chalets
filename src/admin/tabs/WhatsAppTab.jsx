import { useRef, useState } from "react";
import { RotateCcw, ExternalLink } from "lucide-react";
import { Field, Text } from "../ui.jsx";
import { TEMPLATE_VARS, SAMPLE_VARS, renderTemplate, whatsappLink } from "../../lib/whatsapp.js";
import { DEFAULT_WHATSAPP_TEMPLATE } from "../../lib/defaultContent.js";

export default function WhatsAppTab({ draft, setDraft }) {
  const [lang, setLang] = useState("es");
  const ta = useRef(null);
  const tpl = draft.whatsappTemplate || DEFAULT_WHATSAPP_TEMPLATE;
  const value = tpl[lang] ?? "";
  const setTpl = (v) => setDraft({ ...draft, whatsappTemplate: { ...tpl, [lang]: v } });
  const preview = renderTemplate(value, SAMPLE_VARS[lang]);

  function insert(key) {
    const el = ta.current;
    const token = `{${key}}`;
    if (!el) { setTpl(value + token); return; }
    const s = el.selectionStart ?? value.length, e = el.selectionEnd ?? value.length;
    const next = value.slice(0, s) + token + value.slice(e);
    setTpl(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + token.length, s + token.length); });
  }

  return (
    <div className="grid gap-5">
      <div className="adm-card grid gap-4">
        <Field label="Número que recibe las reservas (WhatsApp)" hint="Con código de país, solo números. Ej.: 17875058678">
          <Text value={draft.settings.whatsapp} inputMode="numeric"
            onChange={(v) => setDraft({ ...draft, settings: { ...draft.settings, whatsapp: v.replace(/\D/g, "") } })} />
        </Field>
      </div>

      <div className="adm-card grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-extrabold">Mensaje automático de la reserva</h3>
          <div className="flex gap-1 rounded-xl bg-arena p-1">
            {[["es", "Español"], ["en", "English"]].map(([k, l]) => (
              <button key={k} type="button" onClick={() => setLang(k)} className={`rounded-lg px-3 py-1.5 text-sm font-bold ${lang === k ? "bg-white shadow" : "text-muted"}`}>{l}</button>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted">
          Este es el texto que le llega a tu WhatsApp cuando alguien pide una reserva. Escribe lo que quieras y usa las
          <b> variables</b> para poner la información de la persona. Si el huésped deja un dato vacío (por ejemplo, sin comentarios), esa línea no aparece.
        </p>
        <div>
          <span className="adm-label">Toca una variable para insertarla donde está el cursor</span>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_VARS.map((v) => (
              <button key={v.key} type="button" onClick={() => insert(v.key)} title={v.es}
                className="rounded-lg border border-linea bg-arena px-2.5 py-1.5 font-mono text-[13px] font-semibold text-azul hover:bg-arena-2">
                {`{${v.key}}`} <span className="font-sans font-medium text-muted">· {v.es}</span>
              </button>
            ))}
          </div>
        </div>
        <textarea ref={ta} className="adm-input font-mono text-[14px] leading-relaxed" rows={13} value={value} onChange={(e) => setTpl(e.target.value)} aria-label="Plantilla del mensaje" />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="adm-btn border border-linea bg-white" onClick={() => setTpl(DEFAULT_WHATSAPP_TEMPLATE[lang])}>
            <RotateCcw className="size-4" /> Restaurar mensaje original
          </button>
          <a className="adm-btn border border-linea bg-white text-tinta no-underline" href={whatsappLink(draft.settings.whatsapp, preview)} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" /> Probar en WhatsApp
          </a>
        </div>
      </div>

      <div className="adm-card grid gap-2">
        <h3 className="text-base font-extrabold">Vista previa (con datos de ejemplo)</h3>
        <div className="whitespace-pre-wrap rounded-2xl border border-[#BFE5CB] bg-[#E7F7EC] p-4 text-sm leading-relaxed">{preview || "(mensaje vacío)"}</div>
        <p className="text-xs text-muted">Recuerda presionar «Guardar cambios» arriba.</p>
      </div>
    </div>
  );
}
