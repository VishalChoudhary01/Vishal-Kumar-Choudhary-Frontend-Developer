"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import LabsHeroArtwork from "./landing/LabsHeroArtwork";

const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.06,
      staggerChildren: 0.11,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.68,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function AnimatedLabStat({ value, label }) {
  const statRef = useRef(null);
  const isInView = useInView(statRef, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();
  const count = useMotionValue(0);
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
      duration: 1.12,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => controls.stop();
  }, [count, isInView, prefersReducedMotion, value]);

  return (
    <div ref={statRef} className="min-w-0">
      <p
        role="img"
        aria-label={`${value} ${label.toLowerCase()}`}
        className="font-display text-[clamp(2.25rem,4.2vw,3.5rem)] leading-none tracking-[-0.055em] text-text-primary tabular-nums"
      >
        <motion.span aria-hidden="true">{displayValue}</motion.span>
      </p>
      <p className="mt-2 max-w-[11rem] font-mono text-[9px] uppercase leading-5 tracking-[0.12em] text-text-muted sm:text-[10px]">
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
  const collectionHref = "#labs-collection-heading";

  if (authState === "guest") {
    return (
      <>
        <HeroAction href="/labs/signup?returnTo=%2Flabs" primary>
          Create account
        </HeroAction>
        <HeroAction href="/labs/login?returnTo=%2Flabs">
          Sign in
        </HeroAction>
      </>
    );
  }

  if (authState === "unverified") {
    return (
      <>
        <HeroAction href="/labs/verify-email?returnTo=%2Flabs" primary>
          Verify email
        </HeroAction>
        <HeroAction href={collectionHref}>Explore experiments</HeroAction>
      </>
    );
  }

  if (authState === "verified") {
    return (
      <>
        <HeroAction href={collectionHref} primary>
          Explore experiments
        </HeroAction>
        {featuredHref ? (
          <HeroAction href={featuredHref}>Explore featured experiment</HeroAction>
        ) : null}
      </>
    );
  }

  return (
    <HeroAction href={collectionHref} primary>
      Explore experiments
    </HeroAction>
  );
}

export default function LabsIntroduction({
  experimentCount = 0,
  categoryCount = 0,
  authState = "unknown",
  featuredHref = null,
}) {
  const prefersReducedMotion = useReducedMotion();
  const safeAuthState = ["guest", "unverified", "verified"].includes(authState)
    ? authState
    : "unknown";

  return (
    <motion.section
      aria-labelledby="labs-heading"
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={heroContainerVariants}
      className="relative mx-auto w-full max-w-[1440px] overflow-hidden px-6 pb-16 pt-[clamp(7.5rem,10vw,9.5rem)] sm:px-8 sm:pb-20 lg:px-20 lg:pb-24"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-10 xl:gap-16">
        <div className="relative z-10 flex min-w-0 flex-col items-start">
          <motion.p
            variants={heroItemVariants}
            className="mb-5 font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-brand sm:mb-6 sm:text-[10px]"
          >
            Frontend experiments / Open collection
          </motion.p>

          <motion.h1
            id="labs-heading"
            variants={heroItemVariants}
            className="max-w-[11ch] font-display text-[clamp(3.35rem,7.1vw,7.1rem)] font-normal leading-[0.9] tracking-[-0.065em] text-text-primary"
          >
            A space for
            <span className="block text-brand">experiments.</span>
          </motion.h1>

          <motion.p
            variants={heroItemVariants}
            className="mt-6 max-w-[34rem] text-sm leading-7 text-text-secondary sm:mt-7 sm:text-base sm:leading-8"
          >
            A growing collection of frontend explorations in motion, interface
            interactions, CSS, and creative coding. Built to explore ideas,
            sharpen details, and make the browser a place to experiment.
          </motion.p>

          <motion.div
            variants={heroItemVariants}
            className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8"
          >
            <HeroActions authState={safeAuthState} featuredHref={featuredHref} />
          </motion.div>

          <motion.div
            variants={heroItemVariants}
            className="mt-10 grid w-full max-w-[28rem] grid-cols-2 gap-6 border-t border-border-subtle pt-5 sm:mt-12 sm:gap-10"
          >
            <AnimatedLabStat value={experimentCount} label="Published experiments" />
            <AnimatedLabStat value={categoryCount} label="Active disciplines" />
          </motion.div>
        </div>

        <div className="relative min-w-0 lg:pl-2">
          <LabsHeroArtwork />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mt-14 h-px w-full bg-border-subtle sm:mt-16 lg:mt-20"
      />
    </motion.section>
  );
}
