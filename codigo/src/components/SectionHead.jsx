import { motion } from "framer-motion";
import { useSite } from "../context/SiteContext.jsx";
import { tr } from "../lib/i18n.js";

/** Encabezado de sección editable (content.sections[key]). */
export default function SectionHead({ k, id, dark = false, children }) {
  const { content, lang } = useSite();
  const s = content.sections?.[k] || {};
  return (
    <motion.div
      className="mb-9 grid max-w-[62ch] gap-3"
      initial={{ opacity: 1, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
    >
      {tr(s.eyebrow, lang) && <span className={`eyebrow ${dark ? "text-sol" : ""}`}>{tr(s.eyebrow, lang)}</span>}
      <h2 id={id} className="h2">{tr(s.title, lang)}</h2>
      {tr(s.text, lang) && <p className={dark ? "text-[#B7C7CD]" : "text-muted"}>{tr(s.text, lang)}</p>}
      {children}
    </motion.div>
  );
}
