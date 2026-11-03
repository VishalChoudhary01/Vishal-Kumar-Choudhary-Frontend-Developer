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
      className="flex max-w-full items-center gap-6 overflow-x-auto border-b border-border-subtle sm:gap-8"
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

function LabCard({ experiment }) {
  const technologies = Array.isArray(experiment.technologies)
    ? experiment.technologies.filter(Boolean).slice(0, 3)
    : [];

  return (
    <Link
      href={`/labs/${experiment.slug}`}
      aria-label={`Explore ${experiment.title}`}
      className="group block min-w-0 rounded-[var(--radius-sm)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="aspect-[4/3] overflow-hidden border border-border-subtle bg-surface-2">
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
      </div>

      <div className="pt-5">
        {experiment.category ? (
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-brand">
            {experiment.category}
          </p>
        ) : null}
        <h3 className="mt-2 font-display text-[clamp(1.5rem,2vw,2rem)] font-normal leading-tight tracking-[-0.025em] text-text-primary">
          {experiment.title}
        </h3>
        {experiment.description ? (
          <p className="mt-2 line-clamp-3 text-xs leading-6 text-text-secondary sm:text-sm">
            {experiment.description}
          </p>
        ) : null}
        {technologies.length ? (
          <p className="mt-4 text-[11px] leading-5 text-text-muted">
            {technologies.join(" · ")}
          </p>
        ) : null}
        <span
          aria-hidden="true"
          className="mt-4 inline-flex text-sm text-text-secondary transition-transform duration-200 group-hover:translate-x-[3px] motion-reduce:transform-none motion-reduce:transition-none"
        >
          ↗
        </span>
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

function Gallery({ visibleExperiments, visibleCount, totalCount, hasMore, onLoadMore }) {
  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
          Showing {visibleCount} of {totalCount} experiments
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
        {visibleExperiments.map((experiment) => (
          <LabCard key={experiment.slug} experiment={experiment} />
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
            <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none">
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
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-brand">
            The collection
          </p>
          <h2
            id="labs-collection-heading"
            className="mt-3 font-display text-[clamp(2.25rem,4vw,4rem)] font-normal leading-[0.98] tracking-[-0.04em] text-text-primary"
          >
            Explore the experiments.
          </h2>
        </div>
        {experiments.length ? (
          <p className="max-w-sm text-xs leading-6 text-text-muted sm:text-right sm:text-sm">
            Focused explorations across motion, CSS, interaction, and creative coding.
          </p>
        ) : null}
      </div>

      {experiments.length ? (
        <>
          <CategoryNavigation categories={categories} activeCategory={activeCategory} onChange={setActiveCategory} />
          <div className="pt-8 sm:pt-10">
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
