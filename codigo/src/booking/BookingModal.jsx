import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import { es as esLocale } from "date-fns/locale/es";
import { enUS } from "date-fns/locale/en-US";
import { AlertCircle, Minus, Plus, Sparkles, X } from "lucide-react";
import { useSite } from "../context/SiteContext.jsx";
import { tr } from "../lib/i18n.js";
import { addDays, formatDate, nightsBetween, toISODate, today } from "../lib/dates.js";
import { buildVars, renderTemplate, whatsappLink } from "../lib/whatsapp.js";
import { logBookingRequest } from "../lib/api.js";
import { Photo } from "../components/Media.jsx";
import { WhatsAppIcon } from "../components/Contact.jsx";

function useMedia(query) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return m;
}

export default function BookingModal() {
  const { bookingOpen, setBookingOpen, booking: b, setBooking, content, lang, ui, blockedNights } = useSite();
  const L = ui.booking;
  const S = content.settings;
  const sheetRef = useRef(null);
  const bodyRef = useRef(null);
  const lastFocus = useRef(null);
  const [err, setErr] = useState("");
  const [dir, setDir] = useState(1);
  const [capWarn, setCapWarn] = useState(false);
  const [sent, setSent] = useState(false);
  const mobile = useMedia("(max-width: 640px)");

  const set = (patch) => setBooking((x) => ({ ...x, ...patch }));
  const close = useCallback(() => setBookingOpen(false), [setBookingOpen]);

  // abrir/cerrar: foco, scroll y Esc
  useEffect(() => {
    if (!bookingOpen) return;
    lastFocus.current = document.activeElement;
    document.body.style.overflow = "hidden";
    setErr(""); setSent(false);
    setTimeout(() => sheetRef.current?.querySelector("[data-autofocus]")?.focus(), 40);
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && sheetRef.current) {
        const f = [...sheetRef.current.querySelectorAll('button:not([disabled]),a[href],input,textarea,select,[tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocus.current?.focus?.();
    };
  }, [bookingOpen, close]);

  useEffect(() => { bodyRef.current?.scrollTo(0, 0); }, [b.step]);

  const chalet = content.chalets.find((c) => c.id === b.chalet);
  const capacity = chalet ? Number(chalet.capacity) : Math.max(...content.chalets.map((c) => Number(c.capacity) || 1));
  const chaletName = b.chalet === "any" ? L.any : chalet?.name || "";

  // ---- disponibilidad ----
  const isBooked = useCallback((d) => {
    const k = toISODate(d);
    if (!b.chalet) return false;
    if (b.chalet === "any") return content.chalets.every((c) => blockedNights[c.id]?.has(k));
    return blockedNights[b.chalet]?.has(k) || false;
  }, [b.chalet, blockedNights, content.chalets]);

  const rangeFree = useCallback((a, z) => {
    for (let d = new Date(a); d < z; d = addDays(d, 1)) if (isBooked(d)) return false;
    return true;
  }, [isBooked]);

  const minNights = Math.max(1, Number(S.minNights) || 1);

  function onDayClick(day, modifiers) {
    if (modifiers.disabled) return;
    setErr("");
    if (!b.start || b.end || day <= b.start) { set({ start: day, end: null }); return; }
    if (!rangeFree(b.start, day)) { setErr(L.errBusy); set({ start: isBooked(day) ? null : day, end: null }); return; }
    if (nightsBetween(b.start, day) < minNights) { setErr(L.errMin(minNights)); return; }
    set({ end: day });
  }

  // Un día ocupado solo se puede tocar como fecha de salida.
  const disabled = [
    { before: today() },
    (d) => isBooked(d) && !(b.start && !b.end && d > b.start && rangeFree(b.start, d)),
  ];

  // ---- validación por paso ----
  function validate() {
    if (b.step === 1 && !b.chalet) return L.errChalet;
    if (b.step === 2) {
      if (!b.start || !b.end) return L.errDates;
      if (!rangeFree(b.start, b.end)) return L.errBusy;
      if (nightsBetween(b.start, b.end) < minNights) return L.errMin(minNights);
    }
    if (b.step === 4 && !b.name.trim()) return L.errName;
    return "";
  }
  function next() {
    const e = validate();
    setErr(e);
    if (e) { if (b.step === 4) document.getElementById("bk-name")?.focus(); return; }
    setDir(1); setCapWarn(false); set({ step: Math.min(5, b.step + 1) });
  }
  function back() { setErr(""); setDir(-1); set({ step: Math.max(1, b.step - 1) }); }
  function goto(step) { setErr(""); setDir(-1); set({ step }); }

  // ---- mensaje ----
  const reasonLabel = b.reason !== "" ? L.reasons[Number(b.reason)] : "";
  const message = useMemo(() => {
    if (!b.start || !b.end) return "";
    const vars = buildVars(b, { lang, chaletName, reasonLabel });
    return renderTemplate(tr(content.whatsappTemplate, lang), vars);
  }, [b, lang, chaletName, reasonLabel, content.whatsappTemplate]);
  const waHref = whatsappLink(S.whatsapp, message);

  function onSend() {
    setSent(true);
    logBookingRequest({
      chalet_id: b.chalet, chalet_name: chaletName,
      check_in: toISODate(b.start), check_out: toISODate(b.end), nights: nightsBetween(b.start, b.end),
      adults: b.adults, kids: b.kids, babies: b.babies, pets: b.pets,
      guest_name: b.name.trim(), reason: reasonLabel, comments: b.comments.trim(), message, lang, status: "nueva",
    });
  }

  // ---- contadores ----
  function inc(k) {
    if ((k === "adults" || k === "kids") && b.adults + b.kids >= capacity) { setCapWarn(true); return; }
    if (k === "babies" && b.babies >= (S.maxBabies || 4)) return;
    if (k === "pets" && b.pets >= (S.maxPets || 2)) return;
    setCapWarn(false); set({ [k]: b[k] + 1 });
  }
  function dec(k, min) { if (b[k] > min) { setCapWarn(false); set({ [k]: b[k] - 1 }); } }

  function chooseChalet(id) {
    setErr("");
    const patch = { chalet: id };
    const cap = id === "any" ? Math.max(...content.chalets.map((c) => Number(c.capacity) || 1)) : Number(content.chalets.find((c) => c.id === id)?.capacity || 1);
    if (b.adults + b.kids > cap) { patch.adults = Math.min(b.adults, cap); patch.kids = Math.max(0, cap - patch.adults); }
    setBooking((x) => {
      const n = { ...x, ...patch };
      // si las fechas elegidas ya no están libres para este chalet, se limpia la salida
      return n;
    });
  }
  // limpiar fechas inválidas al cambiar de chalet
  useEffect(() => {
    if (b.start && b.end && !rangeFree(b.start, b.end)) set({ end: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b.chalet]);

  const n = b.adults + b.kids;

  return (
    <AnimatePresence>
      {bookingOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center sm:p-6">
          <motion.div className="absolute inset-0 bg-[rgba(8,24,32,.62)] backdrop-blur-[3px]" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bk-title"
            className="relative grid h-dvh w-full grid-rows-[auto_auto_1fr_auto] overflow-hidden bg-arena shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)] sm:h-auto sm:max-h-[min(92vh,880px)] sm:w-[min(760px,100%)] sm:rounded-[26px]"
            initial={mobile ? { y: "100%" } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={mobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={mobile ? { y: "100%" } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
          >
            <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-[calc(18px+env(safe-area-inset-top,0px))] sm:px-6">
              <h2 id="bk-title" className="text-[22px] font-extrabold">{L.title}</h2>
              <button type="button" data-autofocus onClick={close} aria-label={ui.close} className="grid size-11 place-items-center rounded-full border border-linea bg-white"><X className="size-5" /></button>
            </div>

            <ol className="grid grid-cols-5 gap-1.5 px-5 pb-3.5 sm:px-6" aria-label="Progreso">
              {L.steps.map((s, i) => {
                const st = i + 1 < b.step ? "done" : i + 1 === b.step ? "cur" : "";
                return (
                  <li key={s} aria-current={st === "cur" ? "step" : undefined} className={`grid gap-1.5 text-[11px] font-bold uppercase tracking-wide ${st === "cur" ? "text-tinta" : "text-[#8A9AA1]"}`}>
                    <span className={`h-[5px] rounded-full transition-colors ${st ? "bg-azul" : "bg-linea"}`} />
                    <span className={st === "cur" ? "" : "hidden sm:block"}>{i + 1}. {s}</span>
                  </li>
                );
              })}
            </ol>

            <div ref={bodyRef} className="overflow-y-auto overflow-x-hidden overscroll-contain px-5 pb-5 pt-2 sm:px-6" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={b.step}
                  initial={{ opacity: 0, x: 24 * dir }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 * dir }}
                  transition={{ duration: 0.22 }}
                  className="grid gap-4"
                >
                  {b.step === 1 && (
                    <>
                      <StepTitle title={L.s1t} hint={L.s1h} />
                      <div role="radiogroup" aria-label={L.s1t} className="grid gap-2.5">
                        {content.chalets.map((c) => (
                          <Option key={c.id} checked={b.chalet === c.id} onClick={() => chooseChalet(c.id)}
                            thumb={<Photo src={c.imageUrl} alt="" className="h-[72px] w-24 rounded-xl max-[420px]:w-[72px]" />}
                            title={c.name}
                            sub={`${ui.upTo(c.capacity)} · ${ui.beds(c.bedrooms)} · ${ui.baths(c.baths)}`} />
                        ))}
                        <Option checked={b.chalet === "any"} onClick={() => chooseChalet("any")}
                          thumb={<div className="grid h-[72px] w-24 place-items-center rounded-xl bg-gradient-to-br from-bosque to-turq text-white max-[420px]:w-[72px]"><Sparkles /></div>}
                          title={L.any} sub={L.anyD} />
                      </div>
                    </>
                  )}

                  {b.step === 2 && (
                    <>
                      <StepTitle title={L.s2t} hint={L.s2h(minNights)} />
                      <p className="text-center text-sm font-bold">{!b.start ? L.pickIn : !b.end ? L.pickOut : ""}</p>
                      <div className="hc-calendar">
                        <DayPicker
                          mode="range"
                          required={false}
                          selected={{ from: b.start || undefined, to: b.end || undefined }}
                          onSelect={() => {}}
                          onDayClick={onDayClick}
                          disabled={disabled}
                          modifiers={{ booked: isBooked }}
                          modifiersClassNames={{ booked: "hc-booked" }}
                          numberOfMonths={mobile ? 1 : 2}
                          defaultMonth={b.start || today()}
                          startMonth={today()}
                          locale={lang === "en" ? enUS : esLocale}
                          weekStartsOn={0}
                        />
                      </div>
                      <div className="flex flex-wrap gap-4 text-[13px] text-muted">
                        <span className="inline-flex items-center gap-1.5"><i className="inline-block size-3.5 rounded-full border border-[#D5CAB4] bg-white" />{L.free}</span>
                        <span className="inline-flex items-center gap-1.5"><i className="inline-block size-3.5 rounded-full bg-[repeating-linear-gradient(135deg,#D8D0BF_0_3px,#F3EFE6_3px_6px)]" />{L.busy}</span>
                        <span className="inline-flex items-center gap-1.5"><i className="inline-block size-3.5 rounded-full bg-azul" />{L.sel}</span>
                      </div>
                      {b.start && b.end && (
                        <div className="rounded-[14px] border border-linea bg-white px-4 py-3 text-center font-bold">
                          {L.nights(nightsBetween(b.start, b.end), formatDate(b.start, lang), formatDate(b.end, lang))}
                        </div>
                      )}
                    </>
                  )}

                  {b.step === 3 && (
                    <>
                      <StepTitle title={L.s3t} />
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <Counter id="adults" label={L.adults} desc={L.adultsD} value={b.adults} min={1} onInc={() => inc("adults")} onDec={() => dec("adults", 1)} full={n >= capacity} />
                        <Counter id="kids" label={L.kids} desc={L.kidsD} value={b.kids} min={0} onInc={() => inc("kids")} onDec={() => dec("kids", 0)} full={n >= capacity} />
                        <Counter id="babies" label={L.babies} desc={L.babiesD} value={b.babies} min={0} onInc={() => inc("babies")} onDec={() => dec("babies", 0)} full={b.babies >= (S.maxBabies || 4)} />
                        {S.petsAllowed && <Counter id="pets" label={L.pets} desc={L.petsD} value={b.pets} min={0} onInc={() => inc("pets")} onDec={() => dec("pets", 0)} full={b.pets >= (S.maxPets || 2)} />}
                      </div>
                      <p className="text-sm text-muted">{L.cap(capacity, n)}</p>
                      {capWarn && <p role="status" className="rounded-xl bg-[#DDF1E3] px-3 py-2.5 text-[14.5px] font-semibold text-[#1D5A31]">{L.capFull(capacity)}</p>}
                    </>
                  )}

                  {b.step === 4 && (
                    <>
                      <StepTitle title={L.s4t} />
                      <div className="grid gap-1.5">
                        <label htmlFor="bk-name" className="text-[15px] font-bold">{L.name} <small className="font-medium text-muted">{L.required}</small></label>
                        <input id="bk-name" autoComplete="name" value={b.name} onChange={(e) => set({ name: e.target.value })} aria-required="true" aria-invalid={Boolean(err) || undefined}
                          className="w-full rounded-xl border-[1.5px] border-[#D5CAB4] bg-white px-3.5 py-3 text-base outline-none focus:border-azul focus:ring-4 focus:ring-azul/15 aria-[invalid=true]:border-[#C2410C]" />
                      </div>
                      <div className="grid gap-1.5">
                        <span className="text-[15px] font-bold">{L.reason} <small className="font-medium text-muted">{L.optional}</small></span>
                        <div className="flex flex-wrap gap-2" role="group" aria-label={L.reason}>
                          {L.reasons.map((r, i) => (
                            <button key={r} type="button" aria-pressed={b.reason === String(i)} onClick={() => set({ reason: b.reason === String(i) ? "" : String(i) })}
                              className={`rounded-full border-[1.5px] px-3.5 py-2.5 text-[14.5px] font-semibold ${b.reason === String(i) ? "border-azul bg-azul text-white" : "border-linea bg-white"}`}>
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <label htmlFor="bk-com" className="text-[15px] font-bold">{L.comments} <small className="font-medium text-muted">{L.optional}</small></label>
                        <textarea id="bk-com" rows={3} maxLength={1500} placeholder={L.commentsPh} value={b.comments} onChange={(e) => set({ comments: e.target.value })}
                          className="w-full rounded-xl border-[1.5px] border-[#D5CAB4] bg-white px-3.5 py-3 text-base outline-none focus:border-azul focus:ring-4 focus:ring-azul/15" />
                      </div>
                    </>
                  )}

                  {b.step === 5 && b.start && b.end && (
                    <>
                      <StepTitle title={L.s5t} />
                      <div className="overflow-hidden rounded-[18px] border border-linea bg-white">
                        <Row k={L.rows.chalet} v={chaletName} onEdit={() => goto(1)} edit={L.edit} />
                        <Row k={L.rows.in} v={formatDate(b.start, lang)} onEdit={() => goto(2)} edit={L.edit} />
                        <Row k={L.rows.out} v={formatDate(b.end, lang)} onEdit={() => goto(2)} edit={L.edit} />
                        <Row k={L.rows.nights} v={String(nightsBetween(b.start, b.end))} />
                        <Row k={L.rows.guests} v={buildVars(b, { lang }).huespedes} onEdit={() => goto(3)} edit={L.edit} />
                        <Row k={L.rows.name} v={b.name} onEdit={() => goto(4)} edit={L.edit} />
                        {reasonLabel && <Row k={L.rows.reason} v={reasonLabel} onEdit={() => goto(4)} edit={L.edit} />}
                        {b.comments.trim() && <Row k={L.rows.comments} v={b.comments} onEdit={() => goto(4)} edit={L.edit} />}
                      </div>
                      <p className="rounded-2xl border border-[#F3DA9A] bg-[#FFF6DF] px-4 py-3 text-sm font-semibold text-[#6B4A00]">{L.priceNote}</p>
                      <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={onSend} className="btn btn-wa">
                        <WhatsAppIcon className="size-6" /> {L.send}
                      </a>
                      <p className="text-center text-[13px] text-muted">{L.note}</p>
                      {sent && <p role="status" className="rounded-xl bg-[#DDF1E3] px-3 py-2.5 text-[14.5px] font-semibold text-[#1D5A31]">{L.sent}</p>}
                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{L.preview}</span>
                      <div className="whitespace-pre-wrap rounded-2xl border border-[#BFE5CB] bg-[#E7F7EC] p-4 text-sm leading-relaxed">{message}</div>
                    </>
                  )}

                  {err && (
                    <div role="alert" className="flex items-center gap-2 rounded-xl bg-[#FCE9D9] px-3 py-2.5 text-[14.5px] font-semibold text-[#A3321A]">
                      <AlertCircle className="size-[18px] shrink-0" /> {err}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-2.5 border-t border-linea bg-white px-5 pb-[calc(14px+env(safe-area-inset-bottom,0px))] pt-3.5 sm:px-6">
              <button type="button" onClick={back} className={`btn btn-ghost ${b.step === 1 ? "invisible" : ""}`}>{L.back}</button>
              <span className="hidden flex-1 text-center text-[12.5px] text-muted sm:block">{L.note}</span>
              {b.step < 5 && <button type="button" onClick={next} className="btn btn-azul">{L.next}</button>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StepTitle({ title, hint }) {
  return (
    <div className="grid gap-1">
      <h3 className="text-2xl font-bold">{title}</h3>
      {hint && <p className="text-[15px] text-muted">{hint}</p>}
    </div>
  );
}

function Option({ checked, onClick, thumb, title, sub }) {
  return (
    <button type="button" role="radio" aria-checked={checked} onClick={onClick}
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-3.5 rounded-[18px] border-2 bg-white p-2.5 text-left transition ${checked ? "border-azul shadow-[0_0_0_4px_rgba(20,82,160,.12)]" : "border-linea hover:border-[#B9C9DA]"}`}>
      {thumb}
      <span><b className="block font-display text-lg leading-tight">{title}</b><small className="text-sm text-muted">{sub}</small></span>
      <span className={`grid size-6 place-items-center rounded-full border-2 ${checked ? "border-azul bg-azul" : "border-[#B9C9DA]"}`}>
        {checked && <span className="size-2 rounded-full bg-white" />}
      </span>
    </button>
  );
}

function Counter({ id, label, desc, value, min, onInc, onDec, full }) {
  return (
    <div className="flex items-center justify-between gap-2.5 rounded-2xl border border-linea bg-white px-4 py-3.5">
      <div><b id={`lb-${id}`} className="block font-display text-[17px]">{label}</b><small className="text-[13px] text-muted">{desc}</small></div>
      <div className="flex items-center gap-2.5" role="group" aria-labelledby={`lb-${id}`}>
        <button type="button" onClick={onDec} disabled={value <= min} aria-label={`− ${label}`} className="grid size-10 place-items-center rounded-full border-[1.5px] border-[#B9C9DA] bg-white text-azul disabled:opacity-35"><Minus className="size-[18px]" /></button>
        <output aria-live="polite" className="min-w-[22px] text-center font-display text-[19px] font-extrabold tabular-nums">{value}</output>
        <button type="button" onClick={onInc} aria-disabled={full || undefined} aria-label={`+ ${label}`} className={`grid size-10 place-items-center rounded-full border-[1.5px] border-[#B9C9DA] bg-white text-azul ${full ? "opacity-40" : ""}`}><Plus className="size-[18px]" /></button>
      </div>
    </div>
  );
}

function Row({ k, v, onEdit, edit }) {
  return (
    <div className="flex justify-between gap-4 border-b border-linea px-4 py-3 text-[15.5px] last:border-b-0">
      <span className="text-muted">{k}</span>
      <span className="text-right font-bold [overflow-wrap:anywhere]">
        {v}
        {onEdit && <button type="button" onClick={onEdit} className="ml-2 text-[13px] font-bold text-azul underline">{edit}</button>}
      </span>
    </div>
  );
}
