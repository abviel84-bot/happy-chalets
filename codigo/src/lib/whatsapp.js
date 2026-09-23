import { formatDate, nightsBetween } from "./dates.js";

/** Variables disponibles en la plantilla del mensaje (se muestran en el panel admin). */
export const TEMPLATE_VARS = [
  { key: "nombre", es: "Nombre del huésped", en: "Guest name" },
  { key: "chalet", es: "Chalet elegido", en: "Chosen chalet" },
  { key: "llegada", es: "Fecha de llegada", en: "Check-in date" },
  { key: "salida", es: "Fecha de salida", en: "Check-out date" },
  { key: "noches", es: "Cantidad de noches", en: "Number of nights" },
  { key: "huespedes", es: "Resumen de huéspedes", en: "Guest summary" },
  { key: "adultos", es: "Adultos", en: "Adults" },
  { key: "ninos", es: "Niños", en: "Children" },
  { key: "bebes", es: "Bebés", en: "Infants" },
  { key: "mascotas", es: "Mascotas", en: "Pets" },
  { key: "motivo", es: "Motivo del viaje", en: "Trip reason" },
  { key: "comentarios", es: "Comentarios", en: "Comments" },
];

function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

export function guestsSummary({ adults, kids, babies, pets }, lang) {
  const L = lang === "en"
    ? [["adult", "adults"], ["child", "children"], ["infant", "infants"], ["pet", "pets"]]
    : [["adulto", "adultos"], ["niño", "niños"], ["bebé", "bebés"], ["mascota", "mascotas"]];
  return [
    plural(adults, ...L[0]),
    kids ? plural(kids, ...L[1]) : "",
    babies ? plural(babies, ...L[2]) : "",
    pets ? plural(pets, ...L[3]) : "",
  ].filter(Boolean).join(", ");
}

/** Arma el objeto de variables a partir del estado de la reserva. */
export function buildVars(booking, { lang, chaletName, reasonLabel }) {
  const n = booking.start && booking.end ? nightsBetween(booking.start, booking.end) : 0;
  return {
    nombre: (booking.name || "").trim(),
    chalet: chaletName || "",
    llegada: booking.start ? formatDate(booking.start, lang) : "",
    salida: booking.end ? formatDate(booking.end, lang) : "",
    noches: n ? String(n) : "",
    huespedes: guestsSummary(booking, lang),
    adultos: String(booking.adults || 0),
    ninos: booking.kids ? String(booking.kids) : "",
    bebes: booking.babies ? String(booking.babies) : "",
    mascotas: booking.pets ? String(booking.pets) : "",
    motivo: reasonLabel || "",
    comentarios: (booking.comments || "").trim(),
  };
}

/**
 * Rellena la plantilla. Regla: si una línea contiene alguna variable que quedó
 * vacía, esa línea completa se omite (así "🎉 Motivo: {motivo}" desaparece si
 * el huésped no eligió motivo). Se evitan líneas en blanco repetidas.
 */
export function renderTemplate(template, vars) {
  const lines = String(template || "").split("\n");
  const out = [];
  for (const line of lines) {
    const keys = [...line.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
    if (keys.some((k) => k in vars && !vars[k])) continue;
    const filled = line.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    if (filled.trim() === "" && (out.length === 0 || out[out.length - 1].trim() === "")) continue;
    out.push(filled);
  }
  while (out.length && out[out.length - 1].trim() === "") out.pop();
  return out.join("\n");
}

export function whatsappLink(phone, text) {
  const digits = String(phone || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Datos de ejemplo para la vista previa del panel admin. */
export const SAMPLE_VARS = {
  es: { nombre: "María Rivera", chalet: "Chalet Sol", llegada: "vie, 14 de nov 2026", salida: "dom, 16 de nov 2026", noches: "2", huespedes: "2 adultos, 2 niños", adultos: "2", ninos: "2", bebes: "", mascotas: "", motivo: "Cumpleaños", comentarios: "Llegamos tarde, como a las 9 p.m." },
  en: { nombre: "Mary Rivers", chalet: "Chalet Sol", llegada: "Fri, Nov 14 2026", salida: "Sun, Nov 16 2026", noches: "2", huespedes: "2 adults, 2 children", adultos: "2", ninos: "2", bebes: "", mascotas: "", motivo: "Birthday", comentarios: "Arriving late, around 9 p.m." },
};
