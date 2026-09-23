import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { useSite } from "../context/SiteContext.jsx";
import { tr } from "../lib/i18n.js";
import SectionHead from "./SectionHead.jsx";
import { Photo } from "./Media.jsx";

const CATS = ["all", "ext", "int", "pool", "beach"];

export default function Gallery() {
  const { media, lang, ui } = useSite();
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(-1);
  const opener = useRef(null);

  const items = useMemo(() => media.filter((m) => cat === "all" || m.category === cat), [media, cat]);
  const cats = CATS.filter((c) => c === "all" || media.some((m) => m.category === c));

  return (
    <section id="galeria" className="section" aria-labelledby="ga-title">
      <div className="container-x">
        <SectionHead k="gallery" id="ga-title" />
        {cats.length > 2 && (
          <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label={ui.filterGallery}>
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={cat === c}
                onClick={() => setCat(c)}
                className={`rounded-full border-[1.5px] px-4 py-2.5 text-sm font-bold ${cat === c ? "border-tinta bg-tinta text-white" : "border-linea bg-white"}`}
              >
                {ui.cats[c]}
              </button>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <div className="ph-empty rounded-2xl p-10 text-center font-semibold">{ui.photoSoon}</div>
        ) : (
          <div className="grid auto-rows-[150px] grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-4">
            {items.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={(e) => { opener.current = e.currentTarget; setOpen(i); }}
                aria-label={tr(m.caption, lang) || ui.nav.gallery}
                className={`group relative cursor-zoom-in overflow-hidden rounded-2xl border-0 p-0 ${i === 0 && cat === "all" && items.length > 2 ? "col-span-2 row-span-2" : ""}`}
              >
                {m.type === "video" ? (
                  <>
                    <video src={m.url} muted playsInline preload="metadata" className="absolute inset-0 size-full object-cover" />
                    <span className="absolute inset-0 grid place-items-center bg-tinta/25">
                      <span className="grid size-14 place-items-center rounded-full bg-white/90 text-tinta"><Play className="ml-1 size-6" fill="currentColor" /></span>
                    </span>
                  </>
                ) : (
                  <Photo src={m.url} alt={tr(m.caption, lang)} className="size-full" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <Lightbox items={items} index={open} setIndex={setOpen} onClose={() => { setOpen(-1); opener.current?.focus(); }} />
    </section>
  );
}

function Lightbox({ items, index, setIndex, onClose }) {
  const { lang, ui } = useSite();
  const closeRef = useRef(null);
  const isOpen = index >= 0 && items[index];

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % items.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [isOpen, items.length, onClose, setIndex]);

  const m = isOpen ? items[index] : null;
  return (
    <AnimatePresence>
      {m && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={ui.galleryZoom}
          className="fixed inset-0 z-[90] grid grid-rows-[auto_1fr_auto] bg-[rgba(8,24,32,.94)] p-3 text-white"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between px-2 py-1 font-semibold">
            <span>{tr(m.caption, lang)} · {index + 1} / {items.length}</span>
            <button ref={closeRef} type="button" onClick={onClose} aria-label={ui.close} className="grid size-12 place-items-center rounded-full bg-white/15 hover:bg-white/25"><X /></button>
          </div>
          <div className="grid min-h-0 place-items-center">
            {m.type === "video" ? (
              <video key={m.id} src={m.url} controls autoPlay playsInline className="max-h-full max-w-[min(1100px,100%)] rounded-xl" />
            ) : (
              <img key={m.id} src={m.url} alt={tr(m.caption, lang)} className="max-h-full max-w-[min(1100px,100%)] rounded-xl object-contain" />
            )}
          </div>
          {items.length > 1 && (
            <div className="flex justify-center gap-3 pb-[env(safe-area-inset-bottom,0px)]">
              <button type="button" aria-label={ui.prev} onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)} className="grid size-12 place-items-center rounded-full bg-white/15 hover:bg-white/25"><ChevronLeft /></button>
              <button type="button" aria-label={ui.next} onClick={() => setIndex((i) => (i + 1) % items.length)} className="grid size-12 place-items-center rounded-full bg-white/15 hover:bg-white/25"><ChevronRight /></button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
