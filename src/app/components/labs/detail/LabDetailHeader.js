import Link from "next/link";
import LabLikeButton from "@/app/components/labs/LabLikeButton";

export default function LabDetailHeader({ experiment, initialEngagement = null }) {
  const technologies = Array.isArray(experiment.technologies)
    ? experiment.technologies.filter(Boolean)
    : [];

  return (
    <header className="mx-auto w-full max-w-[1440px] px-6 pb-9 pt-[clamp(8.5rem,13vw,11rem)] sm:px-8 sm:pb-12 lg:px-20">
      <Link
        href="/labs"
        className="group inline-flex min-h-9 items-center gap-2 text-xs font-medium text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background motion-reduce:transition-none"
      >
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
        >
          ←
        </span>
        Back to Labs
      </Link>

      {experiment.category ? (
        <p className="mt-8 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-brand">
          {experiment.category}
        </p>
      ) : null}

      <h1 className="mt-4 max-w-5xl font-display text-[clamp(2.75rem,6vw,6rem)] font-normal leading-[0.96] tracking-[-0.05em] text-text-primary">
        {experiment.title}
      </h1>

      {experiment.description ? (
        <p className="mt-5 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base sm:leading-8">
          {experiment.description}
        </p>
      ) : null}

      {technologies.length ? (
        <p className="mt-6 text-xs leading-6 text-text-muted sm:text-sm">
          {technologies.join(" · ")}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border-subtle pt-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
          Enjoying this experiment?
        </p>
        <LabLikeButton
          slug={experiment.slug}
          initialData={initialEngagement}
        />
      </div>
    </header>
  );
}
