"use client";

import { motion } from "motion/react";
import useReducedMotion from "@/app/hooks/useReducedMotion";

const EASE = [0.22, 1, 0.36, 1];

export default function AnimatedSendIcon({ size = 18 }) {
  const reduced = useReducedMotion();

  const planeStill = {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
  };

  const planeMotion = reduced
    ? planeStill
    : {
        x: [0, 1.6, -0.3, 0],
        y: [0, -1.4, 0.2, 0],
        rotate: [0, -7, 1.5, 0],
        scale: [1, 1.07, 0.98, 1],
        transition: {
          duration: 0.68,
          ease: EASE,
          times: [0, 0.42, 0.76, 1],
        },
      };

  const planeVariants = {
    rest: planeStill,
    hover: planeMotion,
    focus: planeMotion,
    tap: reduced
      ? planeStill
      : {
          scale: 0.94,
          transition: { duration: 0.16, ease: EASE },
        },
  };

  const trailVariants = {
    rest: {
      opacity: 0,
      x: 0,
    },
    hover: reduced
      ? { opacity: 0, x: 0 }
      : {
          opacity: [0, 0.82, 0],
          x: [0, -2, -5],
          transition: {
            duration: 0.52,
            ease: "easeOut",
            times: [0, 0.38, 1],
          },
        },
    focus: reduced
      ? { opacity: 0, x: 0 }
      : {
          opacity: [0, 0.82, 0],
          x: [0, -2, -5],
          transition: {
            duration: 0.52,
            ease: "easeOut",
            times: [0, 0.38, 1],
          },
        },
    tap: { opacity: 0, x: 0 },
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

      <motion.g variants={trailVariants}>
        <path d="M7 16h3" />
        <path d="M4.5 12.5h3" />
      </motion.g>
    </motion.svg>
  );
}
