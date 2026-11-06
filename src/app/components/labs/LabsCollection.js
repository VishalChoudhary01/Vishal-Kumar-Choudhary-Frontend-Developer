"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import LabExperimentPreview from "./LabExperimentPreview";
import LabLikeButton from "./LabLikeButton";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import useLabPublicCollection from "@/app/hooks/labs/useLabPublicCollection";

function CategoryNavigation({ categories, activeCategory, onChange }) {
  if (!categories?.length) return null;

  return (
    <nav
      aria-label="Filter experiments by category"
      className="-mx-6 flex max-w-[calc(100%+3rem)] items-center gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain px-6 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:max-w-full sm:gap-2.5 sm:px-0"
    >
      {categories.map((category) => {
        const active = activeCategory === category.id;

        return (
          <button
            key={category.id}
            type="button"
            aria-label={`${category.label}, ${category.count} experiments`}
            aria-pressed={active}
            onClick={() => onChange(category.id)}
            className={[
              "inline-flex min-h-10 shrink-0 items-center gap-2.5 border px-3.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-[background-color,border-color,color] duration-200 sm:px-4 sm:text-[10px]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              active
                ? "border-brand bg-brand text-brand-contrast"
                : "border-border-subtle bg-surface-1 text-text-muted hover:border-brand/50 hover:text-text-primary",
              "motion-reduce:transition-none",
            ].join(" ")}
          >
            <span>{category.label}</span>
            <span
              aria-hidden="true"
              className={[
                "inline-flex min-w-5 items-center justify-center border px-1 py-0.5 text-[8px] tabular-nums",
                active
                  ? "border-brand-contrast/30 text-brand-contrast"
                  : "border-border-subtle text-text-tertiary",
              ].join(" ")}
            >
              {String(category.count).padStart(2, "0")}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function LabCard({ experiment, index, total, engagement }) {
  const technologies = Array.isArray(experiment.technologies)
    ? experiment.technologies
        .filter((technology) => typeof technology === "string" && technology.trim())
        .slice(0, 3)
    : [];
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              duration: 0.56,
              delay: Math.min(index % 3, 2) * 0.055,
              ease: [0.16, 1, 0.3, 1],
            }
      }
      className="group/card flex h-full min-w-0 flex-col border-b border-border-subtle pb-5"
    >
      <Link
        href={`/labs/${experiment.slug}`}
        aria-label={`Explore ${experiment.title}`}
        className="flex min-w-0 flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <div className="relative aspect-[4/3] overflow-hidden border border-border-subtle bg-surface-2">
          <LabExperimentPreview
            experiment={experiment}
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            className="h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
          />

          <span className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between border-b border-border-subtle/70 bg-background/70 px-3 py-2 backdrop-blur-sm sm:px-4">
            <span className="min-w-0 truncate font-mono text-[8px] uppercase tracking-[0.14em] text-text-muted">
              {experiment.category || "Experiment"}
            </span>
            <span className="shrink-0 font-mono text-[8px] tabular-nums tracking-[0.12em] text-text-muted">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </span>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center border border-border-subtle bg-background/80 text-sm text-text-primary opacity-0 backdrop-blur-sm transition-[opacity,transform] duration-200 group-hover/card:translate-x-0 group-hover/card:opacity-100 group-focus-visible/card:opacity-100 motion-reduce:transition-none"
          >
            ↗
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col pt-4 sm:pt-5">
          <h3 className="min-w-0 max-w-[19ch] font-display text-[clamp(1.55rem,2.25vw,2.15rem)] font-normal leading-[1.02] tracking-[-0.04em] text-text-primary transition-colors duration-200 group-hover/card:text-brand motion-reduce:transition-none">
            {experiment.title}
          </h3>

          {experiment.description ? (
            <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-xs leading-6 text-text-secondary sm:text-[13px]">
              {experiment.description}
            </p>
          ) : null}

          <div className="mt-auto flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 pt-5">
            {technologies.map((technology, technologyIndex) => (
              <span
                key={technology}
                className="inline-flex min-w-0 items-center gap-2 font-mono text-[8px] uppercase tracking-[0.08em] text-text-muted sm:text-[9px]"
              >
                {technologyIndex > 0 ? (
                  <span aria-hidden="true" className="text-brand/70">/</span>
                ) : null}
                <span className="max-w-[13ch] truncate">{technology}</span>
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="mt-4 flex min-h-9 items-center justify-between gap-3 border-t border-border-subtle pt-3">
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-text-muted">
          Experiment / {String(index + 1).padStart(2, "0")}
        </span>
        <LabLikeButton
          slug={experiment.slug}
          initialData={engagement}
          loadOnMount={!engagement}
          skipGuestCookieCleanup
          compact
        />
      </div>
    </motion.article>
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

function NoResultsState({ onReset, loadError, onRetry }) {
  return (
    <div className="border-y border-border-subtle py-12 sm:py-16">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
        {loadError ? "Collection temporarily unavailable" : "No matching experiments"}
      </p>
      <p className="mt-3 max-w-md text-sm leading-7 text-text-secondary">
        {loadError || "There are no published experiments in this category yet."}
      </p>
      {loadError ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-10 items-center border-b border-brand/60 pb-1 text-xs font-semibold text-text-primary transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand motion-reduce:transition-none"
        >
          Try again
        </button>
      ) : (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex min-h-10 items-center border-b border-brand/60 pb-1 text-xs font-semibold text-text-primary transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand motion-reduce:transition-none"
        >
          View all experiments
        </button>
      )}
    </div>
  );
}

function Gallery({
  visibleExperiments,
  visibleCount,
  totalCount,
  selectedCategory,
  hasMore,
  nextPageCount,
  isLoadingMore,
  isLoadingCategory,
  loadError,
  onLoadMore,
  onRetryCategory,
  engagementBySlug,
}) {
  return (
    <div>
      <div
        className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-border-subtle py-3"
        aria-live="polite"
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted sm:text-[10px]">
          Showing{" "}
          <span className="text-text-primary tabular-nums">
            {String(visibleCount).padStart(2, "0")}
          </span>{" "}
          of{" "}
          <span className="text-text-primary tabular-nums">
            {String(totalCount).padStart(2, "0")}
          </span>{" "}
          experiments
        </p>
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-brand">
          {selectedCategory}
        </span>
      </div>

      {isLoadingCategory && visibleExperiments.length ? (
        <p role="status" className="mb-4 text-xs text-text-muted">
          Loading the rest of this category…
        </p>
      ) : null}

      <div className="grid grid-cols-1 items-stretch gap-x-7 gap-y-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
        {visibleExperiments.map((experiment, index) => (
          <LabCard
            key={experiment.slug}
            experiment={experiment}
            index={index}
            total={totalCount}
            engagement={engagementBySlug?.[experiment.slug] || null}
          />
        ))}
      </div>

      {loadError ? (
        <div role="status" className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-warning">
          <span>{loadError}</span>
          {!hasMore ? (
            <button
              type="button"
              onClick={onRetryCategory}
              className="border-b border-warning/50 pb-0.5 font-semibold hover:border-warning focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Retry category
            </button>
          ) : null}
        </div>
      ) : null}

      {hasMore ? (
        <div className="mt-12 flex justify-center sm:mt-16">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore || isLoadingCategory}
            className="group inline-flex min-h-11 items-center gap-4 border border-border-subtle px-5 text-xs font-semibold text-text-primary transition-[background-color,border-color,color] duration-200 hover:border-brand hover:bg-surface-1 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"
          >
            {isLoadingMore
              ? "Loading experiments…"
              : isLoadingCategory
                ? "Loading category…"
                : nextPageCount > 0
                  ? `Load ${nextPageCount} more experiments`
                  : "Load more experiments"}
            {!isLoadingMore ? (
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
              >
                ↓
              </span>
            ) : null}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function LabsCollection({
  builtInExperiments = [],
  initialCustomPage = {},
  totalCount = 0,
  categoryCounts = {},
  engagementBySlug = {},
}) {
  const cleanupCandidates = [
    ...builtInExperiments,
    ...(Array.isArray(initialCustomPage.experiments) ? initialCustomPage.experiments : []),
  ];
  const cleanupSlug = cleanupCandidates.find(
    (experiment) => engagementBySlug?.[experiment.slug]?.guestCookieCleanupRequired,
  )?.slug || null;

  useEffect(() => {
    if (!cleanupSlug) return undefined;

    const controller = new AbortController();
    fetch(
      "/api/v1/labs/" + encodeURIComponent(cleanupSlug) + "/engagement",
      {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      },
    ).catch((error) => {
      if (error?.name !== "AbortError") {
        console.error("[labs-engagement] guest identity cleanup request failed");
      }
    });

    return () => controller.abort();
  }, [cleanupSlug]);

  const {
    activeCategory,
    setActiveCategory,
    categories,
    visibleItems,
    visibleCount,
    totalCount: categoryTotalCount,
    hasMore,
    nextPageCount,
    isLoadingCategory,
    isLoadingMore,
    loadError,
    loadMore,
    retryCategory,
  } = useLabPublicCollection({
    builtInExperiments,
    initialCustomPage,
    totalCount,
    categoryCounts,
  });

  const selectedCategory =
    categories.find((category) => category.id === activeCategory)?.label || "All";

  return (
    <section
      aria-labelledby="labs-collection-heading"
      className="mx-auto w-full max-w-[1440px] px-6 pb-24 sm:px-8 sm:pb-32 lg:px-20"
    >
      <div className="mb-8 grid grid-cols-1 items-end gap-5 border-t border-border-subtle pt-8 sm:mb-10 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.42fr)] lg:gap-10">
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-brand sm:text-[10px]">
            The collection / {String(totalCount).padStart(2, "0")} published
          </p>
          <h2
            id="labs-collection-heading"
            className="mt-3 max-w-[15ch] font-display text-[clamp(2.35rem,4.8vw,4.6rem)] font-normal leading-[0.94] tracking-[-0.055em] text-text-primary"
          >
            Explore the experiments<span className="text-brand">.</span>
          </h2>
        </div>

        {totalCount ? (
          <p className="max-w-[22rem] text-xs leading-6 text-text-muted sm:text-sm sm:leading-7 lg:justify-self-end">
            Focused explorations across motion, CSS, interface interactions and
            creative coding. Choose a discipline to narrow the collection.
          </p>
        ) : null}
      </div>

      {totalCount > 0 ? (
        <>
          <CategoryNavigation
            categories={categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />

          <div className="pt-5 sm:pt-7">
            {isLoadingCategory && !visibleItems.length ? (
              <p role="status" className="border-y border-border-subtle py-12 text-center text-xs text-text-muted">
                Loading published experiments…
              </p>
            ) : visibleItems.length ? (
              <Gallery
                visibleExperiments={visibleItems}
                visibleCount={visibleCount}
                totalCount={categoryTotalCount}
                selectedCategory={selectedCategory}
                hasMore={hasMore}
                nextPageCount={nextPageCount}
                isLoadingMore={isLoadingMore}
                isLoadingCategory={isLoadingCategory}
                loadError={loadError}
                onLoadMore={loadMore}
                onRetryCategory={retryCategory}
                engagementBySlug={engagementBySlug}
              />
            ) : (
              <NoResultsState
                onReset={() => setActiveCategory("all")}
                loadError={loadError}
                onRetry={retryCategory}
              />
            )}
          </div>
        </>
      ) : (
        <EmptyLabsState />
      )}
    </section>
  );
}
