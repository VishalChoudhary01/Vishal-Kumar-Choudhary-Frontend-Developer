"use client";

import { motion } from "motion/react";
import useReducedMotion from "@/app/hooks/useReducedMotion";

const EASE = [0.22, 1, 0.36, 1];

export default function AnimatedSendIcon({ size = 18 }) {
  const reduced = useReducedMotion();

  const still = {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
  };

  // A compact take-off: the plane lifts, banks forward, then settles back
  // into the circle. The parent button supplies the hover/focus/tap variants.
  const planeMotion = reduced
    ? still
    : {
        x: [0, 2.2, 1.1, 0],
        y: [0, -2.4, -0.8, 0],
        rotate: [0, -13, -4, 0],
        scale: [1, 1.12, 1.04, 1],
        transition: {
          duration: 0.78,
          ease: EASE,
          times: [0, 0.38, 0.72, 1],
        },
      };

  const planeVariants = {
    rest: still,
    hover: planeMotion,
    focus: planeMotion,
    tap: reduced
      ? still
      : {
          x: 1.2,
          y: -1,
          rotate: -6,
          scale: 0.94,
          transition: { duration: 0.16, ease: EASE },
        },
  };

  // Two independently-drawn airflow streaks make the paper-plane movement
  // read clearly without adding visual noise to the small circular icon well.
  const trailVariants = (delay = 0) => ({
    rest: {
      opacity: 0,
      pathLength: 0,
      x: 0,
    },
    hover: reduced
      ? { opacity: 0, pathLength: 0, x: 0 }
      : {
          opacity: [0, 0.95, 0],
          pathLength: [0, 1, 0.55],
          x: [0, -1.8, -4.5],
          transition: {
            duration: 0.52,
            delay,
            ease: "easeOut",
            times: [0, 0.42, 1],
          },
        },
    focus: reduced
      ? { opacity: 0, pathLength: 0, x: 0 }
      : {
          opacity: [0, 0.95, 0],
          pathLength: [0, 1, 0.55],
          x: [0, -1.8, -4.5],
          transition: {
            duration: 0.52,
            delay,
            ease: "easeOut",
            times: [0, 0.42, 1],
          },
        },
    tap: { opacity: 0, pathLength: 0, x: 0 },
  });

  const sparkVariants = {
    rest: {
      opacity: 0,
      scale: 0.35,
      x: 0,
      y: 0,
      rotate: 0,
    },
    hover: reduced
      ? { opacity: 0, scale: 0.35, x: 0, y: 0, rotate: 0 }
      : {
          opacity: [0, 1, 0],
          scale: [0.35, 1.1, 0.25],
          x: [0, 1.2, 2.2],
          y: [0, -1, -1.8],
          rotate: [0, 25, 45],
          transition: {
            duration: 0.48,
            delay: 0.12,
            ease: EASE,
            times: [0, 0.42, 1],
          },
        },
    focus: reduced
      ? { opacity: 0, scale: 0.35, x: 0, y: 0, rotate: 0 }
      : {
          opacity: [0, 1, 0],
          scale: [0.35, 1.1, 0.25],
          x: [0, 1.2, 2.2],
          y: [0, -1, -1.8],
          rotate: [0, 25, 45],
          transition: {
            duration: 0.48,
            delay: 0.12,
            ease: EASE,
            times: [0, 0.42, 1],
          },
        },
    tap: { opacity: 0, scale: 0.35, x: 0, y: 0, rotate: 0 },
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      initial="rest"
      variants={planeVariants}
      className="shrink-0"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />

      <motion.path d="M7 16h3.5" variants={trailVariants(0)} />
      <motion.path d="M4.5 12.5h3" variants={trailVariants(0.08)} />

      <motion.path
        d="M19.2 4.2v2.2m-1.1-1.1h2.2"
        strokeWidth="1.45"
        variants={sparkVariants}
      />
    </motion.svg>
  );
}
