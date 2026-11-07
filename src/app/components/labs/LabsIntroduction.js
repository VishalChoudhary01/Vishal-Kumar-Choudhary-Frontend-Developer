"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import LabsHeroArtwork from "./landing/LabsHeroArtwork";
import { getLabsHeroActions } from "@/app/lib/labs/hero-cta.mjs";

const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.085,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 1, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.56,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function AnimatedLabStat({ value, label }) {
  const statRef = useRef(null);
  const isInView = useInView(statRef, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();
  const count = useMotionValue(value);
  const displayValue = useTransform(count, (latest) =>
    String(Math.min(value, Math.max(0, Math.round(latest)))).padStart(2, "0")
  );

  useEffect(() => {
    if (!isInView) return undefined;

    if (prefersReducedMotion || value <= 0) {
      count.set(value);
      return undefined;
    }

    count.set(0);
    const controls = animate(count, value, {
      duration: 0.95,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => controls.stop();
  }, [count, isInView, prefersReducedMotion, value]);

  return (
    <div ref={statRef} className="min-w-0">
      <p
        role="img"
        aria-label={`${value} ${label.toLowerCase()}`}
        className="font-display text-[clamp(2rem,3.5vw,3rem)] leading-none tracking-[-0.055em] text-text-primary tabular-nums"
      >
        <motion.span aria-hidden="true">{displayValue}</motion.span>
      </p>
      <p className="mt-2 max-w-[11rem] font-mono text-[9px] uppercase leading-4 tracking-[0.1em] text-text-muted sm:text-[10px]">
        {label}
      </p>
    </div>
  );
}

function HeroAction({ href, children, primary = false }) {
  return (
    <Link
      href={href}
      className={[
        "group inline-flex min-h-11 items-center justify-center gap-3 border px-4 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand motion-reduce:transition-none sm:px-5 sm:text-sm",
        primary
          ? "border-brand bg-brand text-brand-contrast hover:-translate-y-px hover:border-brand-hover hover:bg-brand-hover"
          : "border-border-subtle text-text-secondary hover:-translate-y-px hover:border-brand/60 hover:text-text-primary",
      ].join(" ")}
    >
      {children}
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
      >
        ↗
      </span>
    </Link>
  );
}

function HeroActions({ authState, featuredHref }) {
  const actions = getLabsHeroActions({ authState, featuredHref });

  return actions.map((action) => (
    <HeroAction
      key={action.label}
      href={action.href}
      primary={action.variant === "primary"}
    >
      {action.label}
    </HeroAction>
  ));
}

export default function LabsIntroduction({
  experimentCount = 0,
  categoryCount = 0,
  authState = "unknown",
  featuredHref = null,
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      aria-labelledby="labs-heading"
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={heroContainerVariants}
      className="relative mx-auto flex w-full max-w-[1440px] flex-col justify-center overflow-hidden px-6 pb-10 pt-[calc(60px+2rem)] sm:px-8 sm:pb-12 sm:pt-[calc(60px+2.5rem)] lg:min-h-[calc(100svh-78px)] lg:px-20 lg:pb-8 lg:pt-[calc(78px+2.25rem)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 top-[48%] z-0 hidden w-full bg-[radial-gradient(ellipse_at_76%_48%,rgba(0,0,0,0.22)_0%,rgba(5,12,10,0.12)_42%,transparent_78%)] dark:block dark:w-[68%] dark:bg-[radial-gradient(ellipse_at_68%_48%,rgba(0,0,0,0.76)_0%,rgba(2,9,7,0.58)_44%,rgba(4,10,8,0.12)_72%,transparent_88%)] lg:top-0"
      />

      <div className="relative z-10 grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-8 xl:gap-12">
        <div className="relative z-10 flex min-w-0 flex-col items-start">
          <motion.p
            variants={heroItemVariants}
            className="mb-4 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-brand sm:mb-5 sm:text-[10px]"
          >
            Frontend experiments / Open collection
          </motion.p>

          <motion.h1
            id="labs-heading"
            variants={heroItemVariants}
            className="max-w-[10ch] font-display text-[clamp(3.2rem,6.2vw,6.35rem)] font-normal leading-[0.89] tracking-[-0.065em] text-text-primary"
          >
            A space for
            <span className="block text-brand">experiments.</span>
          </motion.h1>

          <motion.p
            variants={heroItemVariants}
            className="mt-5 max-w-[31rem] text-sm leading-6 text-text-secondary sm:mt-6 sm:text-[15px] sm:leading-7"
          >
            Published frontend experiments by Vishal Kumar Choudhary, a
            Frontend Developer, exploring motion and animation, CSS,
            interface interactions, and creative coding. Each detail page
            explains the experiment and lists its category and technologies;
            preview media appears when available.
          </motion.p>

          <motion.div
            variants={heroItemVariants}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <HeroActions authState={authState} featuredHref={featuredHref} />
          </motion.div>

          <motion.div
            variants={heroItemVariants}
            className="mt-8 grid w-full max-w-[25rem] grid-cols-2 gap-6 border-t border-border-subtle pt-4 sm:mt-9 sm:gap-8"
          >
            <AnimatedLabStat value={experimentCount} label="Published experiments" />
            <AnimatedLabStat value={categoryCount} label="Active disciplines" />
          </motion.div>
        </div>

        <div className="relative min-w-0 w-full lg:justify-self-stretch">
          <LabsHeroArtwork />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mt-8 h-px w-full bg-border-subtle lg:mt-7"
      />
    </motion.section>
  );
}
