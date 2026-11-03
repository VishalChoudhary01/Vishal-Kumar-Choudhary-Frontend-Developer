export default function LabsIntroduction({
  experimentCount = 0,
  categoryCount = 0,
}) {
  const metrics = [
    {
      value: String(experimentCount).padStart(2, "0"),
      label: "Published experiments",
    },
    {
      value: String(categoryCount).padStart(2, "0"),
      label: "Active disciplines",
    },
  ];

  return (
    <section
      aria-labelledby="labs-heading"
      className="mx-auto w-full max-w-[1440px] px-6 pb-14 pt-[clamp(8.5rem,13vw,12rem)] sm:px-8 sm:pb-16 lg:px-20 lg:pb-20"
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(190px,0.34fr)] md:items-end md:gap-12 lg:gap-16">
        <div className="max-w-5xl">
          <p className="mb-5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-brand sm:mb-6 sm:text-[11px]">
            Frontend experiments
          </p>

          <h1
            id="labs-heading"
            className="max-w-4xl font-display text-[clamp(3.25rem,7.5vw,7.25rem)] font-normal leading-[0.91] tracking-[-0.06em] text-text-primary"
          >
            A space for
            <span className="block text-brand">experiments.</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-text-secondary sm:mt-8 sm:text-base sm:leading-8">
            A growing collection of frontend explorations in motion, interface
            interactions, CSS, and creative coding.
          </p>
        </div>

        <aside
          aria-label="Labs collection overview"
          className="grid grid-cols-2 gap-5 border-t border-border-subtle pt-5 md:grid-cols-1 md:gap-6 md:border-l md:border-t-0 md:pl-7 md:pt-0 lg:gap-8 lg:pl-9"
        >
          {metrics.map((metric, index) => (
            <div key={metric.label} className="min-w-0">
              <p className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-[-0.055em] text-text-primary tabular-nums">
                {metric.value}
              </p>
              <p className="mt-2 max-w-[10rem] font-mono text-[9px] uppercase leading-5 tracking-[0.12em] text-text-muted sm:text-[10px]">
                {metric.label}
              </p>
            </div>
          ))}
        </aside>
      </div>

      <div
        aria-hidden="true"
        className="mt-12 h-px w-full bg-border-subtle sm:mt-14 lg:mt-16"
      />
    </section>
  );
}
