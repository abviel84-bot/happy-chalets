import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays, House, Image, Inbox, LayoutGrid, Loader2, LogOut, MessageSquareText, Save, Settings, Type, X,
} from "lucide-react";
import { useSite } from "../context/SiteContext.jsx";
import { saveContent, signOut } from "../lib/api.js";
import { isSupabaseConfigured } from "../lib/supabase.js";
import GeneralTab from "./tabs/GeneralTab.jsx";
import HeroTab from "./tabs/HeroTab.jsx";
import ChaletsTab from "./tabs/ChaletsTab.jsx";
import GalleryTab from "./tabs/GalleryTab.jsx";
import CalendarTab from "./tabs/CalendarTab.jsx";
import WhatsAppTab from "./tabs/WhatsAppTab.jsx";
import TextsTab from "./tabs/TextsTab.jsx";
import RequestsTab from "./tabs/RequestsTab.jsx";

const TABS = [
  { id: "requests", label: "Solicitudes", icon: Inbox, draft: false },
  { id: "calendar", label: "Fechas ocupadas", icon: CalendarDays, draft: false },
  { id: "whatsapp", label: "Mensaje de WhatsApp", icon: MessageSquareText, draft: true },
  { id: "hero", label: "Portada (foto o video)", icon: Image, draft: true },
  { id: "gallery", label: "Galería", icon: LayoutGrid, draft: false },
  { id: "chalets", label: "Chalets", icon: House, draft: true },
  { id: "texts", label: "Textos y listas", icon: Type, draft: true },
  { id: "general", label: "Contacto y reglas", icon: Settings, draft: true },
];

export default function AdminPanel() {
  const { adminOpen, setAdminOpen, content, setContent, setIsAdmin } = useSite();
  const [tab, setTab] = useState("requests");
  const [draft, setDraft] = useState(content);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { if (adminOpen) setDraft(structuredClone(content)); }, [adminOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    document.body.style.overflow = adminOpen ? "hidden" : "";
  }, [adminOpen]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(content), [draft, content]);
  const current = TABS.find((t) => t.id === tab);

  function notify(text, kind = "ok") {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 3500);
  }

  async function save() {
    setSaving(true);
    try {
      await saveContent(draft);
      setContent(structuredClone(draft));
      notify(isSupabaseConfigured ? "Cambios guardados. Ya se ven en la página." : "Guardado en modo demo (se pierde al recargar).");
    } catch (e) {
      notify("No se pudo guardar: " + e.message, "err");
    } finally {
      setSaving(false);
    }
  }

  function close() {
    if (dirty && !window.confirm("Tienes cambios sin guardar. ¿Salir de todas formas?")) return;
    setAdminOpen(false);
  }

  async function logout() {
    await signOut();
    setIsAdmin(false);
    setAdminOpen(false);
  }

  const props = { draft, setDraft, notify };

  return (
    <AnimatePresence>
      {adminOpen && (
        <motion.div
          role="dialog" aria-modal="true" aria-label="Panel de administración"
          className="fixed inset-0 z-[100] grid grid-rows-[auto_1fr] bg-[#F6F1E7] text-tinta md:grid-cols-[260px_1fr] md:grid-rows-1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          {/* Menú lateral */}
          <aside className="flex gap-1 overflow-x-auto border-b border-linea bg-tinta p-2 text-[#DCE6EA] md:flex-col md:overflow-visible md:border-b-0 md:p-4">
            <div className="hidden px-2 pb-4 md:block">
              <p className="font-display text-lg font-extrabold text-white">Happy Chalets</p>
              <p className="text-xs text-[#9FB4BD]">Panel de administración</p>
            </div>
            {TABS.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${tab === t.id ? "bg-white/15 text-white" : "hover:bg-white/10"}`}>
                <t.icon className="size-[18px]" /> {t.label}
              </button>
            ))}
            <div className="mt-auto hidden gap-1 md:grid">
              <button type="button" onClick={logout} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-white/10"><LogOut className="size-[18px]" /> Cerrar sesión</button>
            </div>
          </aside>

          {/* Contenido */}
          <section className="grid min-h-0 grid-rows-[auto_1fr]">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-linea bg-white px-4 py-3 md:px-6">
              <div>
                <h2 className="text-lg font-extrabold">{current.label}</h2>
                {!isSupabaseConfigured && <p className="text-xs font-semibold text-[#9A6700]">Modo demo · Conecta Supabase para guardar de verdad</p>}
              </div>
              <div className="flex items-center gap-2">
                {current.draft && (
                  <button type="button" onClick={save} disabled={!dirty || saving} className="adm-btn bg-sol text-tinta hover:bg-sol-l">
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} {dirty ? "Guardar cambios" : "Guardado"}
                  </button>
                )}
                <button type="button" onClick={logout} className="adm-btn border border-linea md:hidden" aria-label="Cerrar sesión"><LogOut className="size-4" /></button>
                <button type="button" onClick={close} className="adm-btn border border-linea bg-white" aria-label="Cerrar panel"><X className="size-4" /> <span className="hidden sm:inline">Ver página</span></button>
              </div>
            </header>
            <div className="min-h-0 overflow-y-auto p-4 md:p-6">
              <div className="mx-auto max-w-4xl pb-20">
                {tab === "general" && <GeneralTab {...props} />}
                {tab === "hero" && <HeroTab {...props} />}
                {tab === "chalets" && <ChaletsTab {...props} />}
                {tab === "gallery" && <GalleryTab notify={notify} />}
                {tab === "calendar" && <CalendarTab notify={notify} />}
                {tab === "whatsapp" && <WhatsAppTab {...props} />}
                {tab === "texts" && <TextsTab {...props} />}
                {tab === "requests" && <RequestsTab notify={notify} />}
              </div>
            </div>
          </section>

          <AnimatePresence>
            {toast && (
              <motion.div role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                className={`fixed bottom-5 left-1/2 z-[110] -translate-x-1/2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl ${toast.kind === "err" ? "bg-[#B42318] text-white" : "bg-tinta text-white"}`}>
                {toast.text}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
