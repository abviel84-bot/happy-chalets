/**
 * Contenido por defecto del sitio.
 *
 * - Si Supabase NO está configurado, el sitio usa exactamente este archivo.
 * - Si Supabase está configurado, lo que se guarde desde el modo administrador
 *   (tabla `site_content`) se mezcla encima de esto. Así, un campo nuevo que
 *   agregues aquí siempre tiene un valor aunque la base de datos sea vieja.
 *
 * Los textos bilingües usan la forma { es: "...", en: "..." }.
 */

export const DEFAULT_WHATSAPP_TEMPLATE = {
  es: `¡Hola Happy Chalets! 🌴 Me gustaría reservar:

🏠 Chalet: {chalet}
📅 Llegada: {llegada}
📅 Salida: {salida} ({noches} noches)
👥 Huéspedes: {huespedes}
🎉 Motivo: {motivo}
📝 Comentarios: {comentarios}

Mi nombre es {nombre}. ¿Está disponible? ¡Gracias!`,
  en: `Hi Happy Chalets! 🌴 I'd like to book:

🏠 Chalet: {chalet}
📅 Check-in: {llegada}
📅 Check-out: {salida} ({noches} nights)
👥 Guests: {huespedes}
🎉 Reason: {motivo}
📝 Comments: {comentarios}

My name is {nombre}. Is it available? Thank you!`,
};

export const defaultContent = {
  settings: {
    whatsapp: "17875058678", // formato internacional sin + ni guiones
    phoneDisplay: "787-505-8678",
    email: "happychaletsbh@gmail.com",
    address: "950 Calle Cobos, Guánica, PR 00647",
    mapsQuery: "950 Calle Cobos, Guánica, PR 00647",
    instagram: "",
    facebook: "",
    minNights: 2,
    petsAllowed: true,
    maxBabies: 4,
    maxPets: 2,
  },

  whatsappTemplate: DEFAULT_WHATSAPP_TEMPLATE,

  hero: {
    mediaType: "image", // "image" | "video"
    imageUrl: "/facade.webp",
    videoUrl: "",
    posterUrl: "/facade.webp",
    kicker: { es: "Guánica · Puerto Rico", en: "Guánica · Puerto Rico" },
    title: { es: "Donde el sur sonríe", en: "Where the south coast smiles" },
    subtitle: {
      es: "Dos casas de playa con piscina privada, a pasos de Playa Santa. Be Happy, Stay Happy.",
      en: "Two beach houses with a private pool, steps from Playa Santa. Be Happy, Stay Happy.",
    },
  },

  sections: {
    chalets: {
      eyebrow: { es: "Nuestros chalets", en: "Our chalets" },
      title: { es: "Dos casas, una misma buena vibra", en: "Two houses, the same good vibes" },
      text: {
        es: "Cada chalet es independiente, con cocina equipada, aire acondicionado e internet. La piscina y las palapas son para disfrutarlas sin prisa.",
        en: "Each chalet is self-contained, with an equipped kitchen, A/C and Wi-Fi. The pool and palapas are yours to enjoy at your own pace.",
      },
    },
    amenities: {
      eyebrow: { es: "Amenidades", en: "Amenities" },
      title: { es: "Todo listo para que solo pienses en la playa", en: "Everything ready so you only think about the beach" },
      text: { es: "", en: "" },
    },
    gallery: {
      eyebrow: { es: "Galería", en: "Gallery" },
      title: { es: "Así se ve un día en Happy Chalets", en: "A day at Happy Chalets" },
      text: {
        es: "Fotos reales de la propiedad. Lo que ves aquí es lo que encuentras al llegar.",
        en: "Real photos of the property. What you see is what you get.",
      },
    },
    guanica: {
      eyebrow: { es: "Descubre Guánica", en: "Discover Guánica" },
      title: { es: "La costa sur, a minutos de tu puerta", en: "The south coast, minutes from your door" },
      text: {
        es: "Playas de agua tranquila, cayos, el Bosque Seco y noches de bahía bioluminiscente.",
        en: "Calm beaches, cays, the Dry Forest and bioluminescent nights.",
      },
    },
    reviews: {
      eyebrow: { es: "Reseñas", en: "Reviews" },
      title: { es: "Lo que dicen nuestros huéspedes", en: "What our guests say" },
      text: {
        es: "Solo publicamos reseñas reales, con permiso de cada huésped.",
        en: "We only publish real reviews, with each guest's permission.",
      },
    },
    faq: {
      eyebrow: { es: "Preguntas frecuentes", en: "FAQ" },
      title: { es: "Antes de reservar", en: "Before you book" },
      text: {
        es: "¿Otra duda? Escríbenos por WhatsApp y te contestamos nosotros mismos.",
        en: "Another question? Message us on WhatsApp and we'll answer personally.",
      },
    },
    cta: {
      eyebrow: { es: "", en: "" },
      title: { es: "¿Listo para tu escapada?", en: "Ready for your getaway?" },
      text: {
        es: "Elige tus fechas y te respondemos por WhatsApp con disponibilidad y precio.",
        en: "Pick your dates and we'll reply on WhatsApp with availability and price.",
      },
    },
  },

  trust: [
    { icon: "map-pin", es: "A pasos de Playa Santa", en: "Steps from Playa Santa" },
    { icon: "waves", es: "Piscina privada", en: "Private pool" },
    { icon: "users", es: "Ideal para familias", en: "Family friendly" },
    { icon: "sun", es: "Energía solar", en: "Solar powered" },
    { icon: "message-circle", es: "Reserva directa, sin comisiones", en: "Book direct, no fees" },
  ],

  chalets: [
    {
      id: "sol",
      name: "Chalet Sol",
      capacity: 8,
      bedrooms: 3,
      baths: 2,
      imageUrl: "",
      desc: {
        es: "Planta alta con balcón y brisa del mar. Ideal para familias y grupos.",
        en: "Upstairs unit with a balcony and sea breeze. Great for families and groups.",
      },
      features: ["pool", "ac", "kitchen", "wifi"],
    },
    {
      id: "mar",
      name: "Chalet Mar",
      capacity: 6,
      bedrooms: 2,
      baths: 1,
      imageUrl: "",
      desc: {
        es: "Planta baja junto a la piscina. Perfecto para parejas y familias pequeñas.",
        en: "Ground floor right by the pool. Perfect for couples and small families.",
      },
      features: ["pool", "ac", "kitchen", "wifi"],
    },
  ],

  amenities: [
    { icon: "waves", title: { es: "Piscina privada", en: "Private pool" }, text: { es: "Para huéspedes, con área de sol.", en: "Guests only, with sun deck." } },
    { icon: "snowflake", title: { es: "Aire acondicionado", en: "Air conditioning" }, text: { es: "En las habitaciones.", en: "In the bedrooms." } },
    { icon: "utensils", title: { es: "Cocina equipada", en: "Equipped kitchen" }, text: { es: "Cocina lo que pescaste hoy.", en: "Cook today's catch." } },
    { icon: "wifi", title: { es: "Internet incluido", en: "Wi-Fi included" }, text: { es: "Para trabajar o ver una película.", en: "Work or stream a movie." } },
    { icon: "sun", title: { es: "Paneles solares", en: "Solar panels" }, text: { es: "Menos preocupaciones si se va la luz.", en: "Fewer worries during outages." } },
    { icon: "tree-palm", title: { es: "A pasos de Playa Santa", en: "Steps from Playa Santa" }, text: { es: "Aguas tranquilas y llanas.", en: "Calm, shallow water." } },
    { icon: "umbrella", title: { es: "Palapas y sombra", en: "Palapas & shade" }, text: { es: "Para leer, comer o una siesta.", en: "Read, eat or nap outdoors." } },
    { icon: "message-circle", title: { es: "Reserva directa", en: "Book direct" }, text: { es: "Por WhatsApp, sin comisiones.", en: "Via WhatsApp, no fees." } },
  ],

  places: [
    { name: "Playa Santa", distance: { es: "A pasos", en: "Steps away" }, text: { es: "Agua llana y tranquila, kayaks y paddle board.", en: "Shallow calm water, kayaks and paddle boards." }, imageUrl: "" },
    { name: "Gilligan's Island", distance: { es: "≈ 15 min + lancha", en: "≈ 15 min + ferry" }, text: { es: "Cayo de mangles con aguas cristalinas.", en: "Mangrove cay with crystal-clear water." }, imageUrl: "" },
    { name: "Balneario Caña Gorda", distance: { es: "≈ 15 min", en: "≈ 15 min" }, text: { es: "Playa con facilidades, ideal para niños.", en: "Beach with facilities, great for kids." }, imageUrl: "" },
    { name: "Bosque Seco de Guánica", distance: { es: "≈ 20 min", en: "≈ 20 min" }, text: { es: "Reserva de la biosfera con veredas y miradores.", en: "UNESCO biosphere reserve with trails." }, imageUrl: "" },
    { name: "La Parguera", distance: { es: "≈ 25 min", en: "≈ 25 min" }, text: { es: "Bahía bioluminiscente y cayos.", en: "Bioluminescent bay and cays." }, imageUrl: "" },
  ],

  faq: [
    { q: { es: "¿A qué hora es el check-in y el check-out?", en: "What time are check-in and check-out?" }, a: { es: "Check-in desde las [hora] y check-out hasta las [hora]. Si necesitas llegar antes o salir más tarde, pregúntanos.", en: "Check-in from [time], check-out by [time]. Need flexibility? Just ask." } },
    { q: { es: "¿Se permiten mascotas?", en: "Are pets allowed?" }, a: { es: "[Por confirmar] Indícalo en tu solicitud y te confirmamos las condiciones.", en: "[To be confirmed] Mention it in your request and we'll confirm the terms." } },
    { q: { es: "¿Hay que dejar depósito?", en: "Is there a deposit?" }, a: { es: "[Monto y forma de pago por confirmar]. Se devuelve después de la salida si todo está en orden.", en: "[Amount and method TBD]. Refunded after check-out if everything is in order." } },
    { q: { es: "¿Cuál es la política de cancelación?", en: "What's the cancellation policy?" }, a: { es: "[Por confirmar]", en: "[To be confirmed]" } },
    { q: { es: "¿Hay estacionamiento?", en: "Is there parking?" }, a: { es: "[Por confirmar: cantidad de carros por chalet]", en: "[TBD: cars per chalet]" } },
    { q: { es: "¿Cómo sé el precio?", en: "How do I get the price?" }, a: { es: "Envíanos tu solicitud con fechas y cantidad de personas, y te respondemos por WhatsApp con el precio final.", en: "Send us your request with dates and number of guests, and we'll reply on WhatsApp with the final price." } },
  ],

  // Reseñas reales: agrégalas desde el modo administrador.
  reviews: [],
};

/** Galería de ejemplo cuando no hay Supabase. En producción viene de la tabla `media`. */
export const defaultMedia = [
  { id: "demo-1", type: "image", url: "/facade.webp", category: "ext", caption: { es: "Entrada de Happy Chalets", en: "Happy Chalets entrance" }, sort: 0 },
];

/** Fechas ocupadas de ejemplo (relativas a hoy) cuando no hay Supabase. */
export function defaultBlocked() {
  const d = (n) => {
    const x = new Date();
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() + n);
    return x.toISOString().slice(0, 10);
  };
  return [
    { id: "b1", chalet_id: "sol", start_date: d(6), end_date: d(10), note: "Ejemplo" },
    { id: "b2", chalet_id: "sol", start_date: d(20), end_date: d(24), note: "Ejemplo" },
    { id: "b3", chalet_id: "mar", start_date: d(3), end_date: d(6), note: "Ejemplo" },
    { id: "b4", chalet_id: "mar", start_date: d(14), end_date: d(19), note: "Ejemplo" },
  ];
}
