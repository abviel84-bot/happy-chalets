import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Search } from "lucide-react";
import { useSite } from "../context/SiteContext.jsx";
import { tr } from "../lib/i18n.js";
import { addDays, fromISODate, toISODate, today } from "../lib/dates.js";

export default function Hero() {
  const { content, lang, ui, openBooking } = useSite();
  const { hero, settings } = content;
  const [inDate, setIn] = useState("");
  const [outDate, setOut] = useState("");
  const [guests, setGuests] = useState(2);
  const maxGuests = useMemo(() => Math.max(1, ...content.chalets.map((c) => Number(c.capacity) || 1)), [content.chalets]);

  function onIn(v) {
    setIn(v);
    if (v && (!outDate || outDate <= v)) setOut(toISODate(addDays(fromISODate(v), settings.minNights || 1)));
  }

  function submit(e) {
    e.preventDefault();
    const start = inDate ? fromISODate(inDate) : null;
    const end = start && outDate && outDate > inDate ? fromISODate(outDate) : null;
    openBooking({ start, end, adults: Math.max(1, guests), kids: 0, step: 1 });
  }

  const isVideo = hero.mediaType === "video" && hero.videoUrl;

  return (
    <section className="hero-shade relative isolate grid min-h-[min(92vh,860px)] items-end overflow-hidden text-white" aria-labelledby="hero-title">
      <div className="absolute inset-0 -z-20 bg-tinta">
        {isVideo ? (
          <video
            className="size-full object-cover"
            src={hero.videoUrl}
            poster={hero.posterUrl || hero.imageUrl || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        ) : (
          hero.imageUrl && (
            <img src={hero.imageUrl} alt="" className="size-full animate-hero-zoom object-cover object-[center_55%]" fetchPriority="high" />
          )
        )}
      </div>

      <div className="container-x grid gap-5 pb-10 pt-36 md:pb-14">
        <motion.span
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="hero-text-shadow inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.12em] text-sol"
        >
          <MapPin className="size-4" /> {tr(hero.kicker, lang)}
        </motion.span>
        <motion.h1
          id="hero-title"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
          className="hero-text-shadow max-w-[14ch] text-[clamp(40px,7.4vw,84px)] font-extrabold leading-none"
        >
          {tr(hero.title, lang)}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}
          className="hero-text-shadow max-w-[44ch] text-[clamp(17px,2vw,20px)] text-[#E9F0F2]"
        >
          {tr(hero.subtitle, lang)}
        </motion.p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-sol" onClick={() => openBooking()}>{ui.bookStay}</button>
          <a href="#chalets" className="btn border-[1.5px] border-white/45 text-white hover:bg-white/10">{ui.seeChalets}</a>
        </div>

        <motion.form
          onSubmit={submit}
          aria-label={ui.search.go}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-2 grid max-w-[860px] grid-cols-2 gap-1.5 rounded-[20px] bg-arena/95 p-2.5 text-tinta shadow-[0_24px_50px_-24px_rgba(0,0,0,.55)] md:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <Field label={ui.search.in} htmlFor="q-in">
            <input id="q-in" type="date" min={toISODate(today())} value={inDate} onChange={(e) => onIn(e.target.value)} className="w-full min-w-0 bg-transparent text-base font-semibold outline-none" />
          </Field>
          <Field label={ui.search.out} htmlFor="q-out">
            <input id="q-out" type="date" min={inDate ? toISODate(addDays(fromISODate(inDate), 1)) : toISODate(addDays(today(), 1))} value={outDate} onChange={(e) => setOut(e.target.value)} className="w-full min-w-0 bg-transparent text-base font-semibold outline-none" />
          </Field>
          <Field label={ui.search.guests} htmlFor="q-guests" className="col-span-2 md:col-span-1">
            <select id="q-guests" value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full min-w-0 bg-transparent text-base font-semibold outline-none">
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{ui.guests(n)}</option>
              ))}
            </select>
          </Field>
          <button type="submit" className="btn btn-azul col-span-2 min-h-14 md:col-span-1">
            <Search /> {ui.search.go}
          </button>
        </motion.form>
      </div>
    </section>
  );
}

function Field({ label, htmlFor, children, className = "" }) {
  return (
    <label htmlFor={htmlFor} className={`grid cursor-pointer gap-0.5 rounded-xl px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted hover:bg-arena-2 focus-within:outline focus-within:outline-3 focus-within:outline-sol ${className}`}>
      {label}
      <span className="normal-case tracking-normal">{children}</span>
    </label>
  );
}
