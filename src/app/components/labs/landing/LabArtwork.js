function MagneticArtwork() {
  return (
    <div aria-hidden="true" className="relative flex h-full w-full items-center justify-center overflow-hidden bg-background">
      <div className="absolute left-1/2 top-1/2 h-[78%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/15" />
      <div className="absolute left-1/2 top-1/2 h-[56%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-brand/35" />
      <div className="absolute left-1/2 top-1/2 h-[34%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-soft/70 blur-2xl" />
      <div className="relative z-10 flex items-center gap-3 rounded-[var(--radius-md)] border border-brand/30 bg-brand px-5 py-3 text-xs font-semibold text-brand-contrast shadow-[0_12px_36px_-18px_var(--brand)] sm:px-7 sm:py-4 sm:text-sm">
        <span className="h-2 w-2 rounded-full bg-brand-contrast" />
        Magnetic button
        <span className="opacity-70">↗</span>
      </div>
      <span className="absolute bottom-5 right-5 font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted sm:bottom-7 sm:right-7">
        Pointer field / 01
      </span>
    </div>
  );
}

function ScrollTextArtwork() {
  return (
    <div aria-hidden="true" className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-background px-5 py-6 sm:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,var(--brand-soft),transparent_66%)] opacity-60" />
      <div className="absolute left-6 top-6 font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted sm:left-9 sm:top-9">
        Motion study / 02
      </div>
      <p className="relative mb-4 font-mono text-[8px] uppercase tracking-[0.2em] text-brand sm:mb-6">
        A study in scroll and type
      </p>
      <div className="relative max-w-3xl text-center font-display text-[clamp(2rem,5.2vw,4.6rem)] leading-[0.96] tracking-[-0.05em] text-text-primary">
        <span className="block">Motion gives</span>
        <span className="block text-brand">interfaces a</span>
        <span className="block">sense of life.</span>
      </div>
      <div className="absolute inset-x-7 bottom-6 h-px bg-border sm:inset-x-9 sm:bottom-9">
        <span className="block h-full w-2/3 bg-brand" />
      </div>
    </div>
  );
}

function GradientBloomArtwork() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-background"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 56% 64% at 22% 28%, color-mix(in srgb, #07A290 58%, transparent), transparent 74%), radial-gradient(ellipse 58% 64% at 78% 72%, color-mix(in srgb, #07A290 36%, transparent), transparent 64%), conic-gradient(from 215deg at 52% 48%, transparent 0deg, color-mix(in srgb, #07A290 14%, transparent) 118deg, transparent 236deg, color-mix(in srgb, #07A290 20%, transparent) 310deg, transparent 360deg)",
      }}
    >
      <div className="relative z-10 text-center">
        <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-muted">
          CSS study / 03
        </p>
        <p className="mt-3 font-display text-[clamp(2rem,5vw,4rem)] leading-none tracking-[-0.06em] text-text-primary">
          Gradient
          <span className="block text-brand">Bloom.</span>
        </p>
      </div>
      <span className="absolute bottom-5 right-5 font-mono text-[8px] uppercase tracking-[0.16em] text-text-muted">
        Live CSS
      </span>
    </div>
  );
}

export default function LabArtwork({ experiment }) {
  switch (experiment?.slug) {
    case "magnetic-interaction":
      return <MagneticArtwork />;
    case "scroll-driven-text-reveal":
      return <ScrollTextArtwork />;
    case "gradient-bloom":
      return <GradientBloomArtwork />;
    default:
      return (
        <div aria-hidden="true" className="flex h-full w-full items-center justify-center bg-surface-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
            {experiment?.category || "Lab experiment"}
          </span>
        </div>
      );
  }
}
