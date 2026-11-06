"use client";

import { motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";

const orbitTransition = {
  duration: 34,
  ease: "linear",
  repeat: Infinity,
};

const counterOrbitTransition = {
  duration: 46,
  ease: "linear",
  repeat: Infinity,
};

export default function LabsHeroArtwork() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.figure
      aria-hidden="true"
      initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: 0.72, delay: 0.18, ease: [0.16, 1, 0.3, 1] }
      }
      className="relative mx-auto aspect-square w-full max-w-[34rem]"
    >
      <div className="absolute inset-[9%] rounded-full bg-[radial-gradient(circle,var(--brand-soft),transparent_70%)] opacity-40" />
      <div className="absolute inset-[18%] rounded-full border border-brand/10" />
      <div className="absolute inset-[29%] rounded-full border border-brand/15" />

      <svg
        viewBox="0 0 640 640"
        fill="none"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle
          cx="320"
          cy="320"
          r="248"
          stroke="var(--brand)"
          strokeOpacity="0.18"
          strokeWidth="1.2"
        />
        <circle
          cx="320"
          cy="320"
          r="184"
          stroke="var(--brand)"
          strokeOpacity="0.26"
          strokeWidth="1.1"
          strokeDasharray="3 9"
        />
        <circle
          cx="320"
          cy="320"
          r="116"
          stroke="var(--brand)"
          strokeOpacity="0.2"
          strokeWidth="1.1"
        />

        <ellipse
          cx="320"
          cy="320"
          rx="235"
          ry="108"
          transform="rotate(-34 320 320)"
          stroke="var(--brand)"
          strokeOpacity="0.22"
          strokeWidth="1.1"
        />
        <ellipse
          cx="320"
          cy="320"
          rx="235"
          ry="108"
          transform="rotate(34 320 320)"
          stroke="var(--brand)"
          strokeOpacity="0.16"
          strokeWidth="1.1"
        />

        <motion.g
          style={{ transformBox: "view-box", transformOrigin: "50% 50%" }}
          animate={reducedMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={reducedMotion ? { duration: 0 } : orbitTransition}
        >
          <circle cx="320" cy="72" r="7" fill="var(--brand)" fillOpacity="0.9" />
          <circle cx="568" cy="320" r="5.5" fill="var(--brand)" fillOpacity="0.68" />
          <circle cx="320" cy="568" r="6" fill="var(--brand)" fillOpacity="0.58" />
          <circle cx="72" cy="320" r="8" fill="var(--brand)" fillOpacity="0.78" />
        </motion.g>

        <motion.g
          style={{ transformBox: "view-box", transformOrigin: "50% 50%" }}
          animate={reducedMotion ? { rotate: 0 } : { rotate: -360 }}
          transition={reducedMotion ? { duration: 0 } : counterOrbitTransition}
        >
          <circle cx="320" cy="136" r="5" fill="var(--brand)" fillOpacity="0.56" />
          <circle cx="504" cy="320" r="7" fill="var(--brand)" fillOpacity="0.8" />
          <circle cx="320" cy="504" r="5" fill="var(--brand)" fillOpacity="0.68" />
          <circle cx="136" cy="320" r="6" fill="var(--brand)" fillOpacity="0.6" />
        </motion.g>

        <circle
          cx="320"
          cy="320"
          r="68"
          fill="var(--surface-1)"
          stroke="var(--brand)"
          strokeOpacity="0.42"
          strokeWidth="1.3"
        />
        <circle
          cx="320"
          cy="320"
          r="58"
          stroke="var(--brand)"
          strokeOpacity="0.1"
          strokeWidth="1"
        />
        <path
          d="M300 296L276 320L300 344"
          stroke="var(--brand)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M340 296L364 320L340 344"
          stroke="var(--brand)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M330 286L310 354"
          stroke="var(--text-primary)"
          strokeOpacity="0.82"
          strokeWidth="2.7"
          strokeLinecap="round"
        />
      </svg>
    </motion.figure>
  );
}
