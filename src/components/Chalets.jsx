import { motion } from "framer-motion";
import { Users, Bed, Bath, MessageCircle } from "lucide-react";
import { useSite } from "../context/SiteContext.jsx";
import { tr } from "../lib/i18n.js";
import Icon, { FEATURE_ICONS } from "./Icon.jsx";
import SectionHead from "./SectionHead.jsx";
import { Photo } from "./Media.jsx";

export default function Chalets() {
  const { content, lang, ui, openBooking } = useSite();
  return (
    <section id="chalets" className="section" aria-labelledby="ch-title">
      <div className="container-x">
        <SectionHead k="chalets" id="ch-title" />
        <div className="grid gap-6 md:grid-cols-2">
          {content.chalets.map((c, i) => (
            <motion.article
              key={c.id}
              initial={{ opacity: 1, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card grid grid-rows-[auto_1fr] overflow-hidden"
            >
              <div className="relative">
                <Photo src={c.imageUrl} alt={c.name} label={c.name} className="aspect-[16/10] w-full" />
                {!c.imageUrl && (
                  <span className="absolute left-3 top-3 rounded-full bg-tinta/80 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">{ui.photoSoon}</span>
                )}
              </div>
              <div className="grid content-start gap-3.5 p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[26px] font-bold">{c.name}</h3>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#E7F7EC] px-3 py-1.5 text-[13px] font-bold text-[#1D5A31]">
                    <MessageCircle className="size-4" /> {ui.askPrice}
                  </span>
                </div>
                <p className="text-muted">{tr(c.desc, lang)}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[15px] text-muted">
                  <span className="inline-flex items-center gap-1.5"><Users className="size-[18px] text-azul" />{ui.upTo(c.capacity)}</span>
                  <span className="inline-flex items-center gap-1.5"><Bed className="size-[18px] text-azul" />{ui.beds(c.bedrooms)}</span>
                  <span className="inline-flex items-center gap-1.5"><Bath className="size-[18px] text-azul" />{ui.baths(c.baths)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(c.features || []).map((f) => (
                    <span key={f} className="chip inline-flex items-center gap-1.5"><Icon name={FEATURE_ICONS[f]} className="size-3.5" />{ui.features[f] || f}</span>
                  ))}
                </div>
                <div className="mt-1.5">
                  <button type="button" className="btn btn-sol" onClick={() => openBooking({ chalet: c.id })}>{ui.bookThis}</button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
