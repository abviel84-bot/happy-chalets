import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Lock, X } from "lucide-react";
import { useSite } from "../context/SiteContext.jsx";
import { signIn, resetPassword } from "../lib/api.js";
import { isSupabaseConfigured } from "../lib/supabase.js";

export default function AdminLogin() {
  const { loginOpen, setLoginOpen, setAdminOpen, setIsAdmin } = useSite();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const first = useRef(null);

  useEffect(() => {
    if (!loginOpen) return;
    setErr(""); setMsg("");
    setTimeout(() => first.current?.focus(), 50);
    const onKey = (e) => e.key === "Escape" && setLoginOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loginOpen, setLoginOpen]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await signIn(email.trim(), pass);
      if (!isSupabaseConfigured) setIsAdmin(true);
      setLoginOpen(false); setAdminOpen(true); setPass("");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    if (!email.trim()) { setErr("Escribe tu correo primero."); return; }
    try { await resetPassword(email.trim()); setMsg("Te enviamos un correo para cambiar la contraseña."); } catch (e) { setErr(e.message); }
  }

  return (
    <AnimatePresence>
      {loginOpen && (
        <div className="fixed inset-0 z-[95] grid place-items-center p-4">
          <motion.div className="absolute inset-0 bg-tinta/70 backdrop-blur-sm" onClick={() => setLoginOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="adm-login-t"
            className="relative grid w-full max-w-sm gap-4 rounded-3xl bg-arena p-6 shadow-2xl"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            <div className="flex items-center justify-between">
              <h2 id="adm-login-t" className="flex items-center gap-2 text-xl font-extrabold"><Lock className="size-5 text-azul" /> Modo administrador</h2>
              <button type="button" onClick={() => setLoginOpen(false)} aria-label="Cerrar" className="grid size-9 place-items-center rounded-full border border-linea bg-white"><X className="size-4" /></button>
            </div>
            {!isSupabaseConfigured && (
              <p className="rounded-xl bg-[#FFF6DF] p-3 text-sm text-[#6B4A00]">
                Supabase todavía no está conectado. Entra con cualquier dato para ver el panel en <b>modo demo</b> (los cambios no se guardan al recargar).
              </p>
            )}
            <label className="block"><span className="adm-label">Correo</span>
              <input ref={first} type="email" autoComplete="username" required={isSupabaseConfigured} className="adm-input" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label className="block"><span className="adm-label">Contraseña</span>
              <input type="password" autoComplete="current-password" required={isSupabaseConfigured} className="adm-input" value={pass} onChange={(e) => setPass(e.target.value)} /></label>
            {err && <p role="alert" className="rounded-xl bg-[#FDECEA] p-3 text-sm font-semibold text-[#B42318]">{err}</p>}
            {msg && <p role="status" className="rounded-xl bg-[#DDF1E3] p-3 text-sm font-semibold text-[#1D5A31]">{msg}</p>}
            <button type="submit" className="btn btn-azul" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Entrar</button>
            {isSupabaseConfigured && <button type="button" onClick={forgot} className="text-sm font-semibold text-azul underline">Olvidé mi contraseña</button>}
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
