import { motion } from "framer-motion";
import { Plus, Star, Car } from "lucide-react";
import { useSite } from "../context/SiteContext.jsx";
import { tr } from "../lib/i18n.js";
import Icon from "./Icon.jsx";
import SectionHead from "./SectionHead.jsx";
import { Photo } from "./Media.jsx";

const fadeUp = {
  initial: { opacity: 1, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
};

export function TrustBar() {
  const { content, lang } = useSite();
  return (
    <section aria-label="Datos rápidos" className="border-b border-linea bg-white">
      <ul className="container-x grid grid-cols-2 gap-4 py-5 sm:grid-cols-3 lg:grid-cols-5">
        {content.trust.map((x, i) => (
          <li key={i} className="flex items-center gap-3 text-[15px] font-semibold leading-tight last:col-span-2 sm:last:col-span-1">
            <span className="grid size-[42px] shrink-0 place-items-center rounded-xl bg-arena text-azul"><Icon name={x.icon} /></span>
            {tr(x, lang)}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Amenities() {
  const { content, lang } = useSite();
  return (
    <section id="amenidades" className="section bg-white" aria-labelledby="am-title">
      <div className="container-x">
        <SectionHead k="amenities" id="am-title" />
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {content.amenities.map((a, i) => (
            <motion.div key={i} {...fadeUp} transition={{ duration: 0.45, delay: (i % 4) * 0.05 }} className="grid content-start gap-2.5 rounded-[18px] bg-arena p-4 sm:p-5">
              <span className="grid size-12 place-items-center rounded-[14px] bg-white text-azul"><Icon name={a.icon} className="size-6" /></span>
              <b className="font-display text-[17px] leading-tight">{tr(a.title, lang)}</b>
              {tr(a.text, lang) && <p className="text-[14.5px] text-muted">{tr(a.text, lang)}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Guanica() {
  const { content, lang, ui } = useSite();
  return (
    <section id="guanica" className="section bg-tinta text-[#F4ECDC]" aria-labelledby="gu-title">
      <div className="container-x">
        <SectionHead k="guanica" id="gu-title" dark />
        <div className="grid grid-cols-1 gap-3.5 min-[421px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {content.places.map((p, i) => (
            <motion.article key={i} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.05 }} className="grid grid-rows-[140px_auto] overflow-hidden rounded-[18px] bg-[#163D50]">
              <Photo src={p.imageUrl} alt={p.name} label={p.name} className="h-full" />
              <div className="grid gap-1.5 p-4">
                <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-sol"><Car className="size-4" />{tr(p.distance, lang)}</span>
                <b className="font-display text-lg leading-tight">{p.name}</b>
                <p className="text-sm text-[#B7C7CD]">{tr(p.text, lang)}</p>
              </div>
            </motion.article>
          ))}
        </div>
        <p className="mt-4 text-[13px] text-[#8FA6AE]">{ui.distanceNote}</p>
      </div>
    </section>
  );
}

export function Reviews() {
  const { content, lang, ui } = useSite();
  const list = content.reviews || [];
  return (
    <section id="resenas" className="section" aria-labelledby="re-title">
      <div className="container-x">
        <SectionHead k="reviews" id="re-title" />
        <div className="grid gap-4 md:grid-cols-3">
          {list.length
            ? list.map((r, i) => (
                <motion.figure key={i} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.05 }} className="m-0 grid gap-3 rounded-[18px] border border-linea bg-white p-6">
                  <div className="flex gap-0.5 text-sol" aria-label={`${r.rating || 5} de 5`}>
                    {Array.from({ length: 5 }, (_, j) => <Star key={j} className="size-[18px]" fill={j < (r.rating || 5) ? "currentColor" : "none"} />)}
                  </div>
                  <blockquote className="m-0 text-[15.5px]">“{tr(r.text, lang) || r.text}”</blockquote>
                  <figcaption className="text-sm font-bold text-muted">— {r.name}{r.date ? ` · ${r.date}` : ""}</figcaption>
                </motion.figure>
              ))
            : [0, 1, 2].map((i) => (
                <div key={i} className="grid gap-3 rounded-[18px] border-2 border-dashed border-[#D9C9A8] bg-white/50 p-6">
                  <div className="flex gap-0.5 text-[#D9C9A8]" aria-hidden="true">{Array.from({ length: 5 }, (_, j) => <Star key={j} className="size-[18px]" />)}</div>
                  <p className="italic text-muted">“{ui.reviewPh}”</p>
                  <small className="font-bold text-muted">— {ui.reviewPhName}</small>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const { content, lang } = useSite();
  return (
    <section id="faq" className="section bg-white" aria-labelledby="faq-title">
      <div className="container-x grid items-start gap-2 md:grid-cols-[1fr_1.6fr] md:gap-12">
        <SectionHead k="faq" id="faq-title" />
        <div className="grid gap-2.5">
          {content.faq.map((f, i) => (
            <details key={i} className="group overflow-hidden rounded-2xl border border-linea bg-arena">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display text-[17px] font-bold [&::-webkit-details-marker]:hidden">
                {tr(f.q, lang)}
                <Plus className="size-5 shrink-0 transition-transform group-open:rotate-45" />
              </summary>
              <p className="whitespace-pre-line px-5 pb-4 text-muted">{tr(f.a, lang)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
