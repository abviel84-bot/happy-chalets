import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadSite, isAdmin as checkIsAdmin } from "../lib/api.js";
import { defaultContent, defaultMedia } from "../lib/defaultContent.js";
import { UI } from "../lib/i18n.js";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { buildBlockedNights } from "../lib/dates.js";

const SiteContext = createContext(null);

export const EMPTY_BOOKING = {
  step: 1,
  chalet: null, // id | "any"
  start: null,
  end: null,
  adults: 2,
  kids: 0,
  babies: 0,
  pets: 0,
  name: "",
  reason: "",
  comments: "",
};

export function SiteProvider({ children }) {
  const [content, setContent] = useState(defaultContent);
  const [media, setMedia] = useState(defaultMedia);
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [lang, setLang] = useState("es");

  // Reserva: vive aquí para no perderse al cerrar y abrir el modal.
  const [booking, setBooking] = useState(EMPTY_BOOKING);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Admin
  const [adminOpen, setAdminOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const reload = useCallback(async () => {
    try {
      const data = await loadSite();
      setContent(data.content);
      setMedia(data.media);
      setBlocked(data.blocked);
      setLoadError("");
    } catch (e) {
      console.error(e);
      setLoadError("No pudimos cargar la información más reciente. Mostrando datos guardados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Sesión de admin (Supabase recuerda la sesión en el navegador del administrador).
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    checkIsAdmin().then(setIsAdmin);
    const { data } = supabase.auth.onAuthStateChange(() => { checkIsAdmin().then(setIsAdmin); });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const openBooking = useCallback((preset = {}) => {
    setBooking((b) => {
      const next = { ...b, ...preset };
      if (preset.chalet && b.step === 1) next.step = 2;
      if (preset.step) next.step = preset.step;
      return next;
    });
    setBookingOpen(true);
  }, []);

  /** Intentos de abrir el modo admin (5 clics en el nombre). */
  const requestAdmin = useCallback(() => {
    if (isAdmin) setAdminOpen(true);
    else setLoginOpen(true);
  }, [isAdmin]);

  const blockedNights = useMemo(
    () => buildBlockedNights(blocked, content.chalets.map((c) => c.id)),
    [blocked, content.chalets]
  );

  const value = {
    content, setContent, media, setMedia, blocked, setBlocked, blockedNights, reload,
    loading, loadError,
    lang, setLang, ui: UI[lang],
    booking, setBooking, bookingOpen, setBookingOpen, openBooking,
    adminOpen, setAdminOpen, loginOpen, setLoginOpen, isAdmin, setIsAdmin, requestAdmin,
  };
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite debe usarse dentro de <SiteProvider>");
  return ctx;
}
