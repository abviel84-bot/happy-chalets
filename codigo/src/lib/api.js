/**
 * Capa de datos. Con Supabase configurado lee/escribe en la base de datos;
 * sin Supabase usa datos de ejemplo en memoria (nada de localStorage).
 */
import { supabase, isSupabaseConfigured } from "./supabase.js";
import { defaultContent, defaultMedia, defaultBlocked } from "./defaultContent.js";

/** Mezcla profunda: lo guardado en la base de datos gana; arrays se reemplazan completos. */
export function mergeDeep(base, over) {
  if (Array.isArray(base) || Array.isArray(over)) return over ?? base;
  if (base && typeof base === "object" && over && typeof over === "object") {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = mergeDeep(base[k], over[k]);
    return out;
  }
  return over === undefined || over === null ? base : over;
}

// ---- memoria para modo demo ----
const mem = {
  content: structuredClone(defaultContent),
  media: structuredClone(defaultMedia),
  blocked: defaultBlocked(),
  requests: [],
};
const uid = () => Math.random().toString(36).slice(2, 10);

export async function loadSite() {
  if (!isSupabaseConfigured) {
    return { content: structuredClone(mem.content), media: [...mem.media], blocked: [...mem.blocked] };
  }
  const [c, m, b] = await Promise.all([
    supabase.from("site_content").select("data").eq("id", "main").maybeSingle(),
    supabase.from("media").select("*").order("sort", { ascending: true }).order("created_at", { ascending: true }),
    supabase.from("blocked_dates").select("*").gte("end_date", new Date().toISOString().slice(0, 10)).order("start_date"),
  ]);
  if (c.error) console.warn("site_content:", c.error.message);
  return {
    content: mergeDeep(structuredClone(defaultContent), c.data?.data || {}),
    media: m.error ? [] : m.data.map(normalizeMedia),
    blocked: b.error ? [] : b.data,
  };
}

function normalizeMedia(r) {
  return { id: r.id, type: r.type, url: r.url, path: r.path, category: r.category, caption: { es: r.caption_es || "", en: r.caption_en || "" }, sort: r.sort ?? 0 };
}

export async function saveContent(content) {
  if (!isSupabaseConfigured) { mem.content = structuredClone(content); return; }
  const { error } = await supabase.from("site_content").upsert({ id: "main", data: content, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

// ---- galería ----
export async function addMedia(item) {
  if (!isSupabaseConfigured) { const row = { ...item, id: uid() }; mem.media.push(row); return row; }
  const { data, error } = await supabase.from("media").insert({
    type: item.type, url: item.url, path: item.path, category: item.category,
    caption_es: item.caption?.es || "", caption_en: item.caption?.en || "", sort: item.sort ?? 0,
  }).select().single();
  if (error) throw new Error(error.message);
  return normalizeMedia(data);
}
export async function updateMedia(item) {
  if (!isSupabaseConfigured) { mem.media = mem.media.map((m) => (m.id === item.id ? item : m)); return; }
  const { error } = await supabase.from("media").update({
    category: item.category, caption_es: item.caption?.es || "", caption_en: item.caption?.en || "", sort: item.sort ?? 0,
  }).eq("id", item.id);
  if (error) throw new Error(error.message);
}
export async function removeMedia(id) {
  if (!isSupabaseConfigured) { mem.media = mem.media.filter((m) => m.id !== id); return; }
  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---- fechas bloqueadas ----
export async function addBlocked(row) {
  if (!isSupabaseConfigured) { const r = { ...row, id: uid() }; mem.blocked.push(r); return r; }
  const { data, error } = await supabase.from("blocked_dates").insert(row).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function removeBlocked(id) {
  if (!isSupabaseConfigured) { mem.blocked = mem.blocked.filter((b) => b.id !== id); return; }
  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---- solicitudes de reserva (registro de lo que se envía por WhatsApp) ----
export async function logBookingRequest(req) {
  try {
    if (!isSupabaseConfigured) { mem.requests.unshift({ ...req, id: uid(), status: "nueva", created_at: new Date().toISOString() }); return; }
    await supabase.from("booking_requests").insert(req);
  } catch (e) {
    console.warn("No se pudo registrar la solicitud", e);
  }
}
export async function listBookingRequests() {
  if (!isSupabaseConfigured) return [...mem.requests];
  const { data, error } = await supabase.from("booking_requests").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return data;
}
export async function setRequestStatus(id, status) {
  if (!isSupabaseConfigured) { mem.requests = mem.requests.map((r) => (r.id === id ? { ...r, status } : r)); return; }
  const { error } = await supabase.from("booking_requests").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

// ---- autenticación ----
export async function signIn(email, password) {
  if (!isSupabaseConfigured) return { demo: true };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error.message);
  const { data, error: rpcError } = await supabase.rpc("is_admin");
  if (rpcError) {
    await supabase.auth.signOut();
    throw new Error("La base de datos no respondió la verificación de administrador (" + rpcError.message + "). Corre el archivo supabase/arreglo-admin.sql en el SQL Editor.");
  }
  if (data !== true) {
    await supabase.auth.signOut();
    throw new Error(`El correo ${email} entró bien, pero no está en la tabla admin_users. Agrégalo con el SQL de supabase/arreglo-admin.sql.`);
  }
  return {};
}
export async function signOut() {
  if (isSupabaseConfigured) await supabase.auth.signOut();
}
export async function isAdmin() {
  if (!isSupabaseConfigured) return false;
  const { data } = await supabase.rpc("is_admin");
  return data === true;
}
export async function resetPassword(email) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  if (error) throw new Error(error.message);
}
