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

function HeroAction({ hre...[truncated]