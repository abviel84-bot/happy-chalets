import {
  MapPin, Waves, Users, Sun, MessageCircle, Snowflake, Utensils, Wifi, TreePalm, Umbrella, Car, Bed, Bath,
  Star, Sparkles, Flame, Tv, WashingMachine, PawPrint, House, Anchor, Fish, Sailboat, Mountain, Camera,
  Heart, ShieldCheck, Coffee, SquareParking, Sunset, Shell, Baby,
} from "lucide-react";

/** Íconos que el administrador puede elegir (nombre → componente Lucide). */
export const ICONS = {
  "map-pin": MapPin, waves: Waves, users: Users, sun: Sun, "message-circle": MessageCircle, snowflake: Snowflake,
  utensils: Utensils, wifi: Wifi, "tree-palm": TreePalm, umbrella: Umbrella, car: Car, bed: Bed, bath: Bath,
  star: Star, sparkles: Sparkles, flame: Flame, tv: Tv, "washing-machine": WashingMachine, "paw-print": PawPrint,
  house: House, anchor: Anchor, fish: Fish, sailboat: Sailboat, mountain: Mountain, camera: Camera, heart: Heart,
  "shield-check": ShieldCheck, coffee: Coffee, parking: SquareParking, sunset: Sunset, shell: Shell, baby: Baby,
};

/** Íconos de las características de cada chalet */
export const FEATURE_ICONS = {
  pool: "waves", ac: "snowflake", kitchen: "utensils", wifi: "wifi", parking: "parking", bbq: "flame",
  tv: "tv", washer: "washing-machine", pets: "paw-print", balcony: "sunset",
};

export default function Icon({ name, className = "size-5", strokeWidth = 1.75, ...rest }) {
  const C = ICONS[name] || Sparkles;
  return <C className={className} strokeWidth={strokeWidth} aria-hidden="true" {...rest} />;
}
