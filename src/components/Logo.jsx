import { H, HR, HMW, APP } from "./logoSvgs.js";

const MAP = { color: H, reverse: HR, mono: HMW, app: APP };

/** Logo "Arco del Sol". variant: color | reverse | mono | app */
export default function Logo({ variant = "color", className = "", title = "Happy Chalets" }) {
  return (
    <span
      className={`block [&>svg]:block [&>svg]:h-auto [&>svg]:w-full ${className}`}
      role="img"
      aria-label={title}
      dangerouslySetInnerHTML={{ __html: MAP[variant] }}
    />
  );
}
