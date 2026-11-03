"use client";

const DEFAULT_COLOR = "#07A290";
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

function clamp(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(Math.max(number, min), max)
    : fallback;
}

export default function GradientBloom({ settings = {} }) {
  const color =
    typeof settings.color === "string" &&
    HEX_COLOR_PATTERN.test(settings.color)
      ? settings.color
      : DEFAULT_COLOR;

  const intensity = clamp(settings.intensity, 15, 85, 58);
  const spread = clamp(settings.spread, 35, 90, 74);

  const style = {
    "--bloom-color": color,
    "--bloom-intensity": `${intensity}%`,
    "--bloom-spread": `${spread}%`,
    backgroundImage: [
      "radial-gradient(ellipse 54% 60% at 23% 28%, color-mix(in srgb, var(--bloom-color) var(--bloom-intensity), transparent) 0%, transparent var(--bloom-spread))",
      "radial-gradient(ellipse 58% 64% at 78% 72%, color-mix(in srgb, var(--bloom-color) calc(var(--bloom-intensity) * 0.62), transparent) 0%, transparent calc(var(--bloom-spread) * 0.86))",
      "conic-gradient(from 215deg at 52% 48%, transparent 0deg, color-mix(in srgb, var(--bloom-color) 14%, transparent) 118deg, transparent 236deg, color-mix(in srgb, var(--bloom-color) 20%, transparent) 310deg, transparent 360deg)",
    ].join(", "),
  };

  return (
    <section
      aria-label="CSS gradient bloom experiment"
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-background px-6 py-8 sm:px-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,var(--surface-2)_100%)] opacity-45"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={style}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "radial-gradient(var(--border-strong) 0.65px, transparent 0.65px)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="absolute left-6 top-6 z-10 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.2em] text-text-muted sm:left-9 sm:top-9">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        CSS study / 03
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          Layered color fields
        </p>
        <h2 className="mt-5 font-display text-[clamp(2.8rem,7vw,6.25rem)] font-normal leading-[0.9] tracking-[-0.06em] text-text-primary">
          Gradient
          <span className="block" style={{ color }}>
            Bloom.
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-xs leading-6 text-text-secondary sm:text-sm">
          One canvas. Three CSS gradient layers. Shape the light with the
          controls.
        </p>
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between gap-4 font-mono text-[8px] uppercase tracking-[0.16em] text-text-muted sm:bottom-9 sm:left-9 sm:right-9">
        <span>Radial / Conic / Color mix</span>
        <span className="text-right">Live CSS</span>
      </div>
    </section>
  );
}
