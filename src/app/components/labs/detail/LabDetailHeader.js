import Link from "next/link";
import LabLikeButton from "@/app/components/labs/LabLikeButton";

function parsePublicDate(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatPublicDate(date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default function LabDetailHeader({ experiment, initialEngagement = null }) {
  const technologies = Array.isArray(experiment.technologies)
    ? experiment.technologies.filter(Boolean)
    : [];
  const publishedAt = parsePublicDate(experiment.publishedAt);
  const updatedAt = parsePublicDate(experiment.updatedAt);

  return (
    <header className="mx-auto w-full max-w-[1440px] px-6 pb-7 pt-[clamp(6.5rem,9vw,8rem)] sm:px-8 sm:pb-9 lg:px-20">
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
        <p className="mt-6 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-brand">
          {experiment.category}
        </p>
      ) : null}

      <h1 id="lab-page-title" className="mt-3 max-w-5xl font-display text-[clamp(2.75rem,6vw,5.5rem)] font-normal leading-[0.96] tracking-[-0.05em] text-text-primary">
        {experiment.title}
      </h1>

      {experiment.description ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base sm:leading-8">
          {experiment.description}
        </p>
      ) : null}

      <p className="mt-2 text-[11px] leading-5 text-text-tertiary">
        A frontend experiment by Vishal Kumar Choudhary.
      </p>

      {publishedAt || updatedAt ? (
        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-text-tertiary">
          {publishedAt ? (
            <div className="flex items-baseline gap-1.5">
              <dt>Published</dt>
              <dd>
                <time dateTime={publishedAt.toISOString()}>
                  {formatPublicDate(publishedAt)}
                </time>
              </dd>
            </div>
          ) : null}
          {updatedAt ? (
            <div className="flex items-baseline gap-1.5">
              <dt>Updated</dt>
              <dd>
                <time dateTime={updatedAt.toISOString()}>
                  {formatPublicDate(updatedAt)}
                </time>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {technologies.length ? (
        <p className="mt-5 text-xs leading-6 text-text-muted sm:text-sm">
          <span className="font-medium text-text-secondary">Technologies:</span>{" "}
          {technologies.join(" · ")}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border-subtle pt-5">
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
