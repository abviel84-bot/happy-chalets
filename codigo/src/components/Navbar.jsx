import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSite } from "../context/SiteContext.jsx";
import Logo from "./Logo.jsx";

const LINKS = [
  ["chalets", "#chalets"],
  ["amenities", "#amenidades"],
  ["gallery", "#galeria"],
  ["guanica", "#guanica"],
  ["contact", "#contacto"],
];

export default function Navbar() {
  const { ui, lang, setLang, openBooking, requestAdmin } = useSite();
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);
  const clicks = useRef([]);
  const closeRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    if (menu) setTimeout(() => closeRef.current?.focus(), 30);
    const onKey = (e) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  /** Modo administrador secreto: 5 clics en el nombre en menos de 3 segundos. */
  function onBrandClick() {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 3000), now];
    if (clicks.current.length >= 5) {
      clicks.current = [];
      requestAdmin();
    }
  }

  const linkColor = solid ? "text-tinta" : "text-white";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow] duration-300 ${
          solid ? "bg-arena/85 shadow-[0_1px_0_var(--color-linea)] backdrop-blur-md backdrop-saturate-150" : ""
        }`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="container-x flex h-[76px] items-center justify-between gap-4">
          <a href="#top" onClick={onBrandClick} className="relative block w-[160px] shrink-0 md:w-[190px]" aria-label="Happy Chalets">
            <Logo variant="reverse" className={`transition-opacity duration-300 ${solid ? "opacity-0" : "opacity-100"}`} />
            <Logo variant="color" className={`absolute inset-0 transition-opacity duration-300 ${solid ? "opacity-100" : "opacity-0"}`} />
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {LINKS.map(([k, href]) => (
                <li key={k}>
                  <a href={href} className={`text-[15px] font-semibold no-underline decoration-sol decoration-2 underline-offset-[6px] hover:underline ${linkColor}`}>
                    {ui.nav[k]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              aria-label={ui.langLabel}
              className={`rounded-[10px] border px-2.5 py-2 text-[13px] font-bold ${
                solid ? "border-linea text-tinta" : "border-white/35 bg-white/15 text-white"
              }`}
            >
              {ui.langSwitch}
            </button>
            <button type="button" className="btn btn-sol hidden min-h-[42px] px-4 py-2 text-[15px] lg:inline-flex" onClick={() => openBooking()}>
              {ui.book}
            </button>
            <button
              type="button"
              className={`p-2 lg:hidden ${linkColor}`}
              aria-label={ui.openMenu}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              onClick={() => setMenu(true)}
            >
              <Menu className="size-7" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="fixed inset-0 z-[70] flex flex-col gap-2.5 bg-tinta px-5 pb-8 text-[#F4ECDC]"
            style={{ paddingTop: "calc(20px + env(safe-area-inset-top, 0px))" }}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <Logo variant="reverse" className="w-[160px]" />
              <button ref={closeRef} type="button" className="p-2" aria-label={ui.closeMenu} onClick={() => setMenu(false)}>
                <X className="size-7" />
              </button>
            </div>
            {LINKS.map(([k, href]) => (
              <a key={k} href={href} onClick={() => setMenu(false)} className="border-b border-white/10 py-2.5 font-display text-[28px] font-bold text-[#F4ECDC] no-underline">
                {ui.nav[k]}
              </a>
            ))}
            <button type="button" className="btn btn-sol mt-auto" onClick={() => { setMenu(false); openBooking(); }}>
              {ui.bookStay}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
