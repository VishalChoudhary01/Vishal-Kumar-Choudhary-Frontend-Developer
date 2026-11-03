import Link from "next/link";
import LabArtwork from "./landing/LabArtwork";

export default function FeaturedExperiment({ experiment }) {
  if (!experiment?.slug || !experiment?.title) return null;

  const technologies = Array.isArray(experiment.technologies)
    ? experiment.technologies.filter(Boolean)
    : [];

  return (
    <section
      aria-labelledby="featured-lab-title"
      className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-6 pb-24 sm:gap-10 sm:px-8 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-center lg:gap-12 lg:px-20 lg:pb-28 xl:gap-16"
    >
      <div className="flex flex-col items-start lg:py-5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-brand">
          Featured experiment
        </p>

        {experiment.category ? (
          <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted sm:mt-7 sm:text-[10px]">
            {experiment.category}
          </p>
        ) : null}

        <h2
          id="featured-lab-title"
          className="mt-3 max-w-xl font-display text-[clamp(2.6rem,4.4vw,4.8rem)] font-normal leading-[0.94] tracking-[-0.05em] text-text-primary"
        >
          {experiment.title}
        </h2>

        {experiment.description ? (
          <p className="mt-5 max-w-lg text-sm leading-7 text-text-secondary sm:mt-6 sm:text-base sm:leading-8">
            {experiment.description}
          </p>
        ) : null}

        {technologies.length ? (
          <div className="mt-7 sm:mt-8">
            <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-text-muted">
              Built with
            </p>
            <p className="mt-2 text-xs leading-6 text-text-secondary sm:text-sm">
              {technologies.join(" · ")}
            </p>
          </div>
        ) : null}

        <Link
          href={`/labs/${experiment.slug}`}
          className="group mt-7 inline-flex min-h-10 items-center gap-2 border-b border-brand/60 pb-1 text-sm font-semibold text-text-primary transition-colors duration-200 hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background motion-reduce:transition-none sm:mt-8"
        >
          Explore experiment
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
          >
            ↗
          </span>
        </Link>
      </div>

      <Link
        href={`/labs/${experiment.slug}`}
        aria-label={`Explore featured experiment: ${experiment.title}`}
        className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-sm)] border border-border-subtle bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <LabArtwork experiment={experiment} />
      </Link>
    </section>
  );
}
