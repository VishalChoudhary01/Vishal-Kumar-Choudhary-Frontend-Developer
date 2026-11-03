"use client";

import Image from "next/image";
import Link from "next/link";
import LabArtwork from "./landing/LabArtwork";
import useLabCategoryFilter from "@/app/hooks/labs/useLabCategoryFilter";
import useLabLoadMore from "@/app/hooks/labs/useLabLoadMore";

function CategoryNavigation({ categories, activeCategory, onChange }) {
  if (!categories?.length) return null;

  return (
    <nav
      aria-label="Filter experiments by category"
      className="-mx-6 flex max-w-[calc(100%+3rem)] items-center gap-6 overflow-x-auto overflow-y-hidden overscroll-x-contain border-b border-border-subtle px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:max-w-full sm:gap-8 sm:px-0"
    >
      {categories.map((category) => {
        const active = activeCategory === category.id;

        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(category.id)}
            className={[
              "relative shrink-0 py-3 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background",
              active ? "text-text-primary" : "text-text-muted hover:text-text-primary",
              "motion-reduce:transition-none",
            ].join(" ")}
          >
            {category.label}
            <span
              aria-hidden="true"
              className={[
                "absolute inset-x-0 bottom-[-1px] h-0.5 origin-left bg-brand transition-transform duration-200 motion-reduce:transition-none",
                active ? "scale-x-100" : "scale-x-0",
              ].join(" ")}
            />
          </button>
        );
      })}
    </nav>
  );
}

function LabCard({ experiment, index, total }) {
  const technologies = Array.isArray(experiment.technologies)
    ? experiment.technologies.filter(Boolean).slice(0, 3)
    : [];

  return (
    <Link
      href={`/labs/${experiment.slug}`}
      aria-label={`Explore ${experiment.title}`}
      className="group flex h-full min-w-0 flex-col rounded-[var(--radius-sm)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-sm)] border border-border-subtle bg-surface-2">
        {experiment.thumbnail?.src ? (
          <Image
            src={experiment.thumbnail.src}
            alt={experiment.thumbnail.alt || ""}
            width={900}
            height={675}
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            className={[
              "h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none",
              experiment.thumbnail.fit === "contain" ? "object-contain" : "object-cover",
            ].join(" ")}
          />
        ) : (
          <LabArtwork experiment={experiment} />
        )}

        <span className="pointer-events-none absolute right-3 top-3 font-mono text-[8px] tabular-nums tracking-[0.14em] text-text-muted sm:right-4 sm:top-4">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-1 flex-col pt-4 sm:pt-5">
        <div className="flex items-center justify-between gap-3">
          {experiment.category ? (
            <p className="min-w-0 truncate font-mono text-[9px] uppercase tracking-[0.16em] text-brand">
              {experiment.category}
            </p>
          ) : <span />}

        </div>

        <h3 className="mt-2 font-display text-[clamp(1.45rem,2vw,2rem)] font-normal leading-tight tracking-[-0.03em] text-text-primary transition-colors duration-200 group-hover:text-brand motion-reduce:transition-none">
          {experiment.title}
        </h3>

        {experiment.description ? (
          <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-xs leading-6 text-text-secondary sm:text-sm">
            {experiment.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          {technologies.length ? (
            <p className="min-w-0 text-[10px] leading-5 text-text-muted sm:text-[11px]">
              {technologies.join(" · ")}
            </p>
          ) : <span />}

          <span
            aria-hidden="true"
            className="inline-flex shrink-0 translate-x-0 text-sm text-text-secondary transition-transform duration-200 group-hover:translate-x-[3px] motion-reduce:transform-none motion-reduce:transition-none"
          >
            ↗
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyLabsState() {
  return (
    <div className="border-y border-border-subtle py-14 sm:py-20">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand">
        Collection in progress
      </p>
      <h3 className="mt-4 max-w-xl font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.02] tracking-[-0.035em] text-text-primary">
        The first experiments are taking shape.
      </h3>
      <p className="mt-4 max-w-lg text-sm leading-7 text-text-secondary">
        Published experiments will appear here when they are ready to explore.
      </p>
    </div>
  );
}

function Gallery({
  visibleExperiments,
  visibleCount,
  totalCount,
  hasMore,
  onLoadMore,
}) {
  return (
    <div>
      <div
        className="mb-6 flex flex-wrap items-center justify-between gap-3"
        aria-live="polite"
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted sm:text-[10px]">
          Showing {String(visibleCount).padStart(2, "0")} of {String(totalCount).padStart(2, "0")} experiments
        </p>
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-text-muted">
          Selected collection
        </span>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-x-7 gap-y-12 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
        {visibleExperiments.map((experiment, index) => (
          <LabCard
            key={experiment.slug}
            experiment={experiment}
            index={index}
            total={totalCount}
          />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-14 flex justify-center sm:mt-16">
          <button
            type="button"
            onClick={onLoadMore}
            className="group inline-flex min-h-11 items-center gap-3 border-b border-border-strong px-1 pb-2 text-sm font-semibold text-text-primary transition-colors duration-200 hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            Load more experiments
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
            >
              ↓
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function LabsCollection({ experiments = [] }) {
  const {
    activeCategory,
    setActiveCategory,
    categories,
    filteredExperiments,
  } = useLabCategoryFilter(experiments);

  const {
    visibleItems,
    visibleCount,
    totalCount,
    hasMore,
    loadMore,
  } = useLabLoadMore(filteredExperiments, activeCategory);

  return (
    <section
      aria-labelledby="labs-collection-heading"
      className="mx-auto w-full max-w-[1440px] px-6 pb-24 sm:px-8 sm:pb-32 lg:px-20"
    >
      <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-brand">
            The collection
          </p>
          <h2
            id="labs-collection-heading"
            className="mt-3 font-display text-[clamp(2.2rem,4vw,3.9rem)] font-normal leading-[0.98] tracking-[-0.045em] text-text-primary"
          >
            Explore the experiments.
          </h2>
        </div>

        {experiments.length ? (
          <p className="max-w-[18rem] text-xs leading-6 text-text-muted sm:text-right sm:text-sm">
            Focused explorations across motion, CSS, interaction, and creative coding.
          </p>
        ) : null}
      </div>

      {experiments.length ? (
        <>
          <CategoryNavigation
            categories={categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />

          <div className="pt-7 sm:pt-9">
            {filteredExperiments.length ? (
              <Gallery
                visibleExperiments={visibleItems}
                visibleCount={visibleCount}
                totalCount={totalCount}
                hasMore={hasMore}
                onLoadMore={loadMore}
              />
            ) : (
              <p className="border-y border-border-subtle py-12 text-sm text-text-secondary">
                No experiments match this category yet.
              </p>
            )}
          </div>
        </>
      ) : (
        <EmptyLabsState />
      )}
    </section>
  );
}
