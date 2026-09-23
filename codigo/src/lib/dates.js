/** Utilidades de fechas (todo en hora local, sin horas). */
export const DAY = 86400000;

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
export function today() {
  return startOfDay(new Date());
}
export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
/** "YYYY-MM-DD" en hora local */
export function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function fromISODate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function nightsBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY);
}

const FMT = {
  es: { days: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"], months: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"] },
  en: { days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
};
/** es: "vie, 14 de nov 2026" · en: "Fri, Nov 14 2026" */
export function formatDate(d, lang = "es") {
  const f = FMT[lang] || FMT.es;
  return lang === "en"
    ? `${f.days[d.getDay()]}, ${f.months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`
    : `${f.days[d.getDay()]}, ${d.getDate()} de ${f.months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Convierte filas de `blocked_dates` (start_date = primera noche ocupada,
 * end_date = día de salida, exclusivo) en un Set de noches ocupadas "YYYY-MM-DD"
 * por chalet.
 */
export function buildBlockedNights(rows, chaletIds) {
  const map = {};
  chaletIds.forEach((id) => (map[id] = new Set()));
  for (const r of rows || []) {
    if (!map[r.chalet_id]) map[r.chalet_id] = new Set();
    let d = fromISODate(r.start_date);
    const end = fromISODate(r.end_date);
    while (d < end) {
      map[r.chalet_id].add(toISODate(d));
      d = addDays(d, 1);
    }
  }
  return map;
}
