function MagneticArtwork() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-background"
    >
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute left-1/2 top-1/2 h-[76%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/15" />
      <div className="absolute left-1/2 top-1/2 h-[58%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-brand/30" />
      <div className="absolute left-1/2 top-1/2 h-[36%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/20" />
      <div className="absolute left-1/2 top-1/2 h-[24%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-soft/70 blur-2xl" />

      <div className="relative z-10 flex items-center gap-3 rounded-[var(--radius-md)] border border-brand/30 bg-brand px-5 py-3 text-xs font-semibold text-brand-contrast shadow-[0_12px_36px_-18px_var(--brand)] sm:px-7 sm:py-4 sm:text-sm">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-brand-contrast/30">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-contrast" />
        </span>
        Magnetic button
        <span className="opacity-70">↗</span>
      </div>

      <div className="absolute left-[22%] top-[28%] h-3 w-3 rotate-[-18deg] border-l-2 border-t-2 border-text-secondary/70" />
      <span className="absolute left-5 top-5 font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted sm:left-7 sm:top-7">
        Pointer field / 01
      </span>
    </div>
  );
}

function ScrollTextArtwork() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-background px-5 py-6 sm:px-10"
    >
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

function GenerativeParticleArtwork() {
  const nodes = [
    [8, 25], [17, 15], [26, 30], [35, 12], [44, 26], [55, 17],
    [65, 31], [76, 15], [88, 28], [13, 55], [24, 68], [38, 52],
    [49, 73], [61, 56], [73, 70], [85, 54], [94, 74], [6, 82],
    [31, 88], [53, 43], [70, 43], [42, 39], [81, 87], [19, 39],
  ];
  const links = [
    [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5],
    [4, 5], [4, 6], [5, 6], [5, 7], [6, 7], [6, 8], [7, 8],
    [0, 9], [2, 9], [2, 11], [4, 11], [4, 19], [5, 19],
    [6, 13], [7, 15], [8, 15], [9, 10], [9, 11], [10, 11],
    [10, 12], [11, 12], [11, 21], [12, 13], [12, 18], [13, 14],
    [13, 19], [13, 20], [14, 15], [14, 16], [14, 22], [15, 16],
    [17, 18], [18, 12], [19, 20], [20, 15], [21, 19], [22, 16],
    [23, 2], [23, 9], [23, 11],
  ];

  return (
    <div
      aria-hidden="true"
      className="relative h-full w-full overflow-hidden bg-background"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,var(--brand-soft),transparent_72%)] opacity-60" />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
      >
        {links.map(([from, to], index) => (
          <line
            key={index}
            x1={nodes[from][0]}
            y1={nodes[from][1]}
            x2={nodes[to][0]}
            y2={nodes[to][1]}
            stroke="var(--brand)"
            strokeOpacity="0.28"
            strokeWidth="0.18"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {nodes.map(([x, y], index) => (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={index % 4 === 0 ? "0.55" : "0.34"}
            fill="var(--brand)"
            fillOpacity={index % 3 === 0 ? "0.95" : "0.68"}
          />
        ))}
      </svg>
      <div className="absolute left-6 top-6 font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted sm:left-9 sm:top-9">
        Generative study / 04
      </div>
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-3 sm:bottom-9 sm:left-9 sm:right-9">
        <p className="font-display text-[clamp(1.8rem,4vw,3.5rem)] leading-none tracking-[-0.05em] text-text-primary">
          Connected by chance.
        </p>
        <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-text-muted">
          Canvas 2D
        </span>
      </div>
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
    case "generative-particle-field":
      return <GenerativeParticleArtwork />;
    default:
      return (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center bg-surface-2"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
            {experiment?.category || "Lab experiment"}
          </span>
        </div>
      );
  }
}
