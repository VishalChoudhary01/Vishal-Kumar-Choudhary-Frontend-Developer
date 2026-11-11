"use client";

import { motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";

const flaskSway = {
  rotate: [-1.6, 1.6, -1.6],
  y: [0, -1.5, 0],
};

const flaskSwayTransition = {
  duration: 8,
  ease: "easeInOut",
  repeat: Infinity,
};

const liquidFloat = {
  y: [0, -1.25, 0],
};

const liquidFloatTransition = {
  duration: 4.4,
  ease: "easeInOut",
  repeat: Infinity,
};

export default function LabsHeroFlask() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      data-labs-hero-flask=""
      aria-hidden="true"
      className="pointer-events-none absolute -right-5 top-[37%] z-0 h-[13.5rem] opacity-[0.075] sm:-right-3 sm:h-[16rem] sm:opacity-[0.085] dark:opacity-[0.11] lg:top-[24%] lg:h-[clamp(19rem,28vw,23rem)] lg:opacity-[0.09] lg:dark:opacity-[0.14]"
    >
      <svg
        viewBox="0 0 260 360"
        fill="none"
        className="h-full w-auto overflow-visible text-[#08796f] dark:text-[#75dcd1]"
      >
        <defs>
          <linearGradient id="labs-flask-glass" x1="42" y1="72" x2="218" y2="330" gradientUnits="userSpaceOnUse">
            <stop stopColor="currentColor" stopOpacity="0.025" />
            <stop offset="0.55" stopColor="currentColor" stopOpacity="0.075" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.025" />
          </linearGradient>
          <linearGradient id="labs-flask-liquid" x1="130" y1="230" x2="130" y2="336" gradientUnits="userSpaceOnUse">
            <stop stopColor="currentColor" stopOpacity="0.025" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.22" />
          </linearGradient>
          <clipPath id="labs-flask-body-clip">
            <path d="M104 26H156V126L215 282C227 314 207 336 177 336H83C53 336 33 314 45 282L104 126V26Z" />
          </clipPath>
        </defs>

        <motion.g
          animate={prefersReducedMotion ? { rotate: 0, y: 0 } : flaskSway}
          transition={prefersReducedMotion ? { duration: 0 } : flaskSwayTransition}
          style={{
            transformBox: "view-box",
            transformOrigin: "130px 332px",
          }}
        >
          <path
            d="M104 26H156V126L215 282C227 314 207 336 177 336H83C53 336 33 314 45 282L104 126V26Z"
            fill="url(#labs-flask-glass)"
            stroke="currentColor"
            strokeOpacity="0.72"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M96 26H164M104 38H156"
            stroke="currentColor"
            strokeOpacity="0.74"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M103 128C119 132 141 132 157 128"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1.2"
          />

          <g clipPath="url(#labs-flask-body-clip)">
            <motion.g
              animate={prefersReducedMotion ? { y: 0 } : liquidFloat}
              transition={prefersReducedMotion ? { duration: 0 } : liquidFloatTransition}
            >
              <path
                d="M35 258C65 248 89 266 117 260C148 254 177 250 224 263L232 350H28L35 258Z"
                fill="url(#labs-flask-liquid)"
              />
              <path
                d="M40 260C72 251 91 269 120 263C150 256 179 253 220 264"
                stroke="currentColor"
                strokeOpacity="0.5"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </motion.g>

            <g fill="currentColor">
              <circle cx="91" cy="226" r="2.1" opacity="0.42" />
              <circle cx="157" cy="211" r="1.6" opacity="0.34" />
              <circle cx="176" cy="238" r="2.4" opacity="0.36" />
              <circle cx="113" cy="190" r="1.3" opacity="0.28" />
              <circle cx="137" cy="244" r="1.1" opacity="0.5" />
              <circle cx="72" cy="286" r="1.7" opacity="0.26" />
              <circle cx="190" cy="296" r="1.5" opacity="0.28" />
            </g>
          </g>

          <path
            d="M54 285C63 264 76 253 96 247M205 285C196 265 185 253 165 247"
            stroke="currentColor"
            strokeOpacity="0.22"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path
            d="M75 313C91 321 111 324 130 324"
            stroke="currentColor"
            strokeOpacity="0.22"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </motion.g>
      </svg>
    </div>
  );
}
