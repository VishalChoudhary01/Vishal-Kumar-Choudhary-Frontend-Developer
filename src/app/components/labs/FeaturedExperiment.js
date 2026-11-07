"use client";

import Link from "next/link";
import { motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import LabExperimentPreview from "./LabExperimentPreview";

const spotlightVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.04,
    },
  },
};

const spotlightItemVariants = {
  hidden: { opacity: 1, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.62,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function FeaturedExperiment({ experiment }) {
  const reducedMotion = useReducedMotion();

  if (!experiment?.slug || !experiment?.title) return null;

  const technologies = Array.isArray(experiment.technologies)
    ? experiment.technologies
        .filter((technology) => typeof technology === "string" && technology.trim())
        .slice(0, 5)
    : [];

  const href = `/labs/${experiment.slug}`;

  return (
    <motion.section
      aria-labelledby="featured-lab-title"
      initial={reducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={spotlightVariants}
      className="mx-auto w-full max-w-[1440px] px-6 pb-20 sm:px-8 sm:pb-24 lg:px-20 lg:pb-28"
    >
      <div className="border-y border-border-subtle py-7 sm:py-9 lg:py-11">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3 sm:mb-9">
          <motion.div variants={spotlightItemVariants} className="flex items-center gap-3">
            <span className="h-px w-7 bg-brand sm:w-10" />
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-brand sm:text-[10px]">
              Selected experiment
            </p>
          </motion.div>
          {experiment.category ? (
            <motion.p
              variants={spotlightItemVariants}
              className="font-mono text-[8px] uppercase tracking-[0.16em] text-text-muted sm:text-[9px]"
            >
              {experiment.category}
            </motion.p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)] lg:gap-12 xl:gap-16">
          <motion.div variants={spotlightItemVariants} className="min-w-0">
            <Link
              href={href}
              aria-label={`Open featured experiment: ${experiment.title}`}
              className="group relative block aspect-[4/3] overflow-hidden border border-border-subtle bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:aspect-[1.28/1] lg:aspect-[1.16/1]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,var(--brand-soft),transparent_74%)] opacity-50" />
              <LabExperimentPreview
                experiment={experiment}
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 85vw, 58vw"
                className="relative z-[1] h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.015] motion-reduce:transform-none motion-reduce:transition-none"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-center justify-between border-t border-border-subtle/70 bg-background/75 px-4 py-3 backdrop-blur-sm sm:px-5">
                <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-text-muted">
                  Preview / {experiment.slug}
                </span>
                <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-brand">
                  Open experiment ↗
                </span>
              </span>
            </Link>
          </motion.div>

          <motion.div
            variants={spotlightItemVariants}
            className="flex min-w-0 flex-col items-start lg:py-3"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
              A closer look
            </p>

            <h2
              id="featured-lab-title"
              className="mt-4 max-w-[12ch] font-display text-[clamp(2.7rem,5.2vw,5.25rem)] font-normal leading-[0.92] tracking-[-0.06em] text-text-primary"
            >
              {experiment.title}
              <span className="text-brand">.</span>
            </h2>

            {experiment.description ? (
              <p className="mt-5 max-w-xl text-sm leading-7 text-text-secondary sm:mt-6 sm:text-base sm:leading-8">
                {experiment.description}
              </p>
            ) : null}

            {technologies.length ? (
              <div className="mt-7 w-full border-t border-border-subtle pt-4 sm:mt-8">
                <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-text-muted sm:text-[9px]">
                  Built with
                </p>
                <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2">
                  {technologies.map((technology, index) => (
                    <li
                      key={technology}
                      className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-text-secondary sm:text-[10px]"
                    >
                      {index > 0 ? (
                        <span aria-hidden="true" className="text-brand/70">/</span>
                      ) : null}
                      {technology}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Link
              href={href}
              className="group mt-8 inline-flex min-h-11 items-center gap-4 border border-brand bg-brand px-5 text-xs font-semibold text-brand-contrast transition-[background-color,border-color,transform] duration-200 hover:-translate-y-px hover:border-brand-hover hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none sm:mt-9 sm:text-sm"
            >
              Explore experiment
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
              >
                ↗
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
