import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** true cuando hay credenciales de Supabase en .env */
export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes("TU-PROYECTO"));

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

export const SUPABASE_URL = url || "";
export const SUPABASE_ANON_KEY = anonKey || "";
export const MEDIA_BUCKET = "media";
