import Icon from "./Icon.jsx";

/** Foto o video con respaldo "foto próximamente" cuando no hay archivo. */
export function Photo({ src, alt = "", label, className = "", imgClassName = "", eager = false }) {
  if (!src) {
    return (
      <div className={`ph-empty relative overflow-hidden ${className}`}>
        <div className="grid justify-items-center gap-2 p-4 text-center text-[13px] font-semibold tracking-wide">
          <Icon name="camera" className="size-10 opacity-90" strokeWidth={1.5} />
          {label && <span>{label}</span>}
        </div>
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden bg-arena-2 ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={`absolute inset-0 size-full object-cover ${imgClassName}`}
      />
    </div>
  );
}

export function VideoBox({ src, poster, className = "", controls = false, autoPlay = false }) {
  return (
    <div className={`relative overflow-hidden bg-tinta ${className}`}>
      <video
        src={src}
        poster={poster || undefined}
        className="absolute inset-0 size-full object-cover"
        controls={controls}
        autoPlay={autoPlay}
        muted={autoPlay}
        loop={autoPlay}
        playsInline
        preload="metadata"
      />
    </div>
  );
}
