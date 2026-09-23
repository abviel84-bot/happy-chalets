import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { useSite } from "../context/SiteContext.jsx";
import { tr } from "../lib/i18n.js";
import Logo from "./Logo.jsx";

export function Contact() {
  const { content, lang, ui, openBooking } = useSite();
  const s = content.settings;
  const cta = content.sections.cta;
  const q = encodeURIComponent(s.mapsQuery || s.address);
  return (
    <section id="contacto" className="section" aria-labelledby="ct-title">
      <div className="container-x">
        <div className="relative grid items-center gap-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-azul to-azul-d p-7 text-white md:grid-cols-[1.2fr_1fr] md:p-14">
          <svg className="absolute -bottom-16 -right-10 w-64 opacity-10" viewBox="0 0 64 64" aria-hidden="true"><path d="M10 60 V30 A22 22 0 0 1 54 30 V60 Z" fill="#fff" /></svg>
          <div className="relative grid gap-3">
            <h2 id="ct-title" className="h2 text-white">{tr(cta.title, lang)}</h2>
            <p className="text-[#D6E3F3]">{tr(cta.text, lang)}</p>
          </div>
          <div className="relative flex flex-wrap gap-3 md:justify-end">
            <button type="button" className="btn btn-sol" onClick={() => openBooking()}>{ui.bookStay}</button>
          </div>
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <div className="grid content-start">
            <Row icon={<MapPin />} label={ui.contact.address}>
              <a href={`https://maps.google.com/?q=${q}`} target="_blank" rel="noopener noreferrer">{s.address}</a>
            </Row>
            <Row icon={<Phone />} label={ui.contact.phone}>
              <a href={`tel:+${String(s.whatsapp).replace(/\D/g, "")}`}>{s.phoneDisplay}</a>
            </Row>
            <Row icon={<Mail />} label={ui.contact.email}>
              <a href={`mailto:${s.email}`}>{s.email}</a>
            </Row>
            {(s.instagram || s.facebook) && (
              <Row icon={<Instagram />} label={ui.contact.social}>
                <span className="flex flex-wrap gap-4">
                  {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5"><Instagram className="size-4" />Instagram</a>}
                  {s.facebook && <a href={s.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5"><Facebook className="size-4" />Facebook</a>}
                </span>
              </Row>
            )}
          </div>
          <div className="min-h-[340px] overflow-hidden rounded-[22px] border border-linea bg-arena-2">
            <iframe
              title={ui.contact.map}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${q}&output=embed`}
              className="block size-full min-h-[340px] border-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3.5 border-b border-linea py-4 [&_a]:font-semibold [&_a]:text-tinta [&_a]:no-underline [&_a]:[overflow-wrap:anywhere] [&>svg]:mt-0.5 [&>svg]:size-[22px] [&>svg]:shrink-0 [&>svg]:text-azul">
      {icon}
      <div>
        <small className="block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{label}</small>
        {children}
      </div>
    </div>
  );
}

export function Footer() {
  const { content, ui } = useSite();
  const s = content.settings;
  return (
    <footer className="bg-tinta pb-28 pt-12 text-sm text-[#B7C7CD]">
      <div className="container-x grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="grid gap-3.5">
          <Logo variant="mono" className="w-[220px]" />
          <p>{ui.footer.desc}</p>
        </div>
        <div>
          <b className="mb-3 block font-display text-[15px] text-[#F4ECDC]">{ui.footer.explore}</b>
          <ul className="grid gap-2 [&_a]:text-[#B7C7CD] [&_a]:no-underline [&_a:hover]:text-white">
            <li><a href="#chalets">{ui.nav.chalets}</a></li>
            <li><a href="#amenidades">{ui.nav.amenities}</a></li>
            <li><a href="#galeria">{ui.nav.gallery}</a></li>
            <li><a href="#faq">{ui.footer.faq}</a></li>
          </ul>
        </div>
        <div>
          <b className="mb-3 block font-display text-[15px] text-[#F4ECDC]">{ui.footer.contact}</b>
          <ul className="grid gap-2 [&_a]:text-[#B7C7CD] [&_a]:no-underline [&_a:hover]:text-white">
            <li><a href={`tel:+${String(s.whatsapp).replace(/\D/g, "")}`}>{s.phoneDisplay}</a></li>
            <li><a href={`mailto:${s.email}`}>{s.email}</a></li>
            <li>{s.address}</li>
          </ul>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-white/10 pt-5 md:col-span-3">
          <span>© {new Date().getFullYear()} Happy Chalets Beach House</span>
          <span>Be Happy, Stay Happy</span>
        </div>
      </div>
    </footer>
  );
}

export const WA_PATH = "M16.04 3C9 3 3.3 8.68 3.3 15.7c0 2.24.6 4.43 1.72 6.36L3.2 28.8l6.92-1.8a12.8 12.8 0 0 0 5.92 1.47h.01c7.03 0 12.74-5.69 12.74-12.7C28.8 8.7 23.07 3 16.04 3Zm0 23.3h-.01c-1.9 0-3.77-.51-5.4-1.48l-.39-.23-4.1 1.07 1.1-3.98-.26-.41a10.47 10.47 0 0 1-1.62-5.6c0-5.83 4.76-10.57 10.62-10.57a10.6 10.6 0 0 1 10.6 10.58c0 5.84-4.77 10.6-10.54 10.6Zm5.82-7.93c-.32-.16-1.88-.93-2.17-1.03-.3-.11-.5-.16-.72.16-.21.31-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.56-1.57a9.6 9.6 0 0 1-1.77-2.2c-.19-.32 0-.49.14-.64.14-.15.32-.37.48-.56.16-.18.21-.31.32-.52.1-.21.05-.4-.03-.56-.08-.16-.72-1.72-.98-2.35-.26-.62-.52-.53-.72-.54h-.61c-.21 0-.56.08-.85.4-.29.31-1.11 1.08-1.11 2.64 0 1.56 1.14 3.06 1.3 3.28.16.2 2.24 3.4 5.42 4.77.76.33 1.35.52 1.81.67.76.24 1.45.2 2 .12.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.37.19-1.5-.08-.14-.29-.22-.61-.38Z";

export function WhatsAppIcon({ className = "size-6" }) {
  return <svg viewBox="0 0 32 32" className={className} aria-hidden="true"><path fill="currentColor" d={WA_PATH} /></svg>;
}

/** Botón flotante: abre el flujo de reserva (no WhatsApp directo). */
export function WhatsAppFab() {
  const { ui, openBooking } = useSite();
  return (
    <button
      type="button"
      onClick={() => openBooking()}
      aria-label={ui.fabLabel}
      className="fixed right-4 z-40 flex items-center gap-2.5 rounded-full bg-wa p-[15px] text-[15px] font-bold text-tinta shadow-[0_12px_30px_-10px_rgba(15,46,61,.55)] transition hover:-translate-y-0.5 sm:right-5 sm:py-3.5 sm:pl-4 sm:pr-5"
      style={{ bottom: "calc(18px + env(safe-area-inset-bottom, 0px))" }}
    >
      <WhatsAppIcon className="size-[26px]" />
      <span className="hidden sm:inline">{ui.fab}</span>
    </button>
  );
}
